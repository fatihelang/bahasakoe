/*
  lesson.js
  Lesson player: alur belajar terfokus BahasaKoe.

    Intro -> Learning Content -> (Culture Moment) -> Question (+ feedback inline) -> Lesson Complete

  Mode Ulas (params.mode === 'review'): sesi pendek berisi soal-soal yang
  sebelumnya salah (dari appState.getMissedItems). Langsung ke Question,
  tanpa Intro/Content/Culture, tanpa XP, tanpa mengubah progress lesson;
  hasilnya hanya memperbarui daftar ulas (yang benar dikeluarkan dari daftar).

  Feedback TIDAK lagi layar/modal terpisah: setelah "Periksa Jawaban", jawaban
  berubah state di tempat (benar/kurang tepat), lalu panel feedback muncul
  inline di dock bawah layar yang sama, dengan satu CTA "Lanjutkan".

  Urutan animasi jawaban benar: pilihan berubah success -> ikon centang
  muncul -> pop kecil (~1.05) -> kembali normal -> panel "Benar! +10 XP".
  Jawaban kurang tepat: warna caution + ikon silang + nudge halus,
  jawaban yang benar ditampilkan. Tidak ada XP/progress yang berkurang.

  Tipe soal (question.type), data-driven:
  - 'multiple-choice' (default): pilih 1 dari question.options.
  - 'translate'   : ketik jawaban, dicocokkan ke question.correctAnswers[].
  - 'arrange'     : susun question.words[] (urutan asli = jawaban benar).
  - 'matching'    : cocokkan question.pairs[]; salah pasang hanya reset & coba lagi.
  - 'true-false'  : nilai kebenaran pernyataan (question.correctAnswer: boolean).
  Menambah tipe baru: tambah data soal + satu fungsi render*Body di file ini.

  State per-sesi disimpan di closure ini, BUKAN LocalStorage. LocalStorage
  (appState.js) hanya disentuh sekali, saat lesson selesai (completeLesson).
*/

import { getLesson, getUnit } from '../data/curriculum.js';
import { completeLesson, isLessonCompleted, getBadgesWithStatus, getUnitProgress, getState, saveQuestionResults, getMissedItems, XP_PER_CORRECT_ANSWER } from '../state/appState.js';
import { correctAnswerText } from '../data/questionHelpers.js';
import { mascotHtml } from '../ui/mascot.js';
import { showConfirmDialog } from '../ui/confirmDialog.js';
import { icons, withClass } from '../ui/icons.js';
import { playSelect, playCorrect, playWrong, playComplete } from '../ui/soundManager.js';
import { burstConfetti } from '../ui/confetti.js';
import { animateCount } from '../ui/animateCount.js';

const CHECK_ICON = withClass(icons.check, 'icon-check');
const CROSS_ICON = withClass(icons.cross, 'icon-cross');

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
// Jeda antara animasi jawaban (pop/nudge) dan munculnya panel feedback.
const feedbackDelay = () => (prefersReducedMotion() ? 120 : 460);

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Estimasi kasar: ~20 detik per kata baru + ~30 detik per pertanyaan.
function estimateMinutes(lesson) {
  const totalSeconds = lesson.learningContent.length * 20 + lesson.questions.length * 30;
  return Math.max(1, Math.round(totalSeconds / 60));
}

function choiceHtml(label, attrs = '', classes = '') {
  return `
    <button class="choice ${classes}" ${attrs}>
      <span class="choice-indicator">${CHECK_ICON}${CROSS_ICON}</span>
      <span class="choice-label">${label}</span>
    </button>`;
}

// Banyak soal maksimum dalam satu sesi Ulas.
const REVIEW_SESSION_SIZE = 5;

/**
 * Menyusun "lesson" sementara dari soal-soal yang salah (paling lama dulu).
 * Soal yang sudah tidak ada di data dilewati. Mengembalikan null bila kosong.
 */
function buildReviewLesson(languageId) {
  const questions = [];
  const origins = new Map(); // questionId -> { languageId, unitId, lessonId }
  for (const item of getMissedItems(languageId)) {
    if (questions.length >= REVIEW_SESSION_SIZE) break;
    const source = getLesson(item.languageId, item.unitId, item.lessonId);
    const question = source && source.questions ? source.questions.find((q) => q.id === item.questionId) : null;
    if (!question) continue;
    questions.push(question);
    origins.set(question.id, item);
  }
  if (questions.length === 0) return null;
  return {
    lesson: { id: 'review', order: 0, title: 'Ulas', playable: true, objective: '', learningContent: [], cultureMoment: null, questions },
    origins,
  };
}

export function renderLesson(container, { navigateTo }, params = {}) {
  const isReviewSession = params.mode === 'review';
  const { languageId, unitId, lessonId } = params;
  const originOf = new Map();
  let lesson;

  if (isReviewSession) {
    const built = languageId ? buildReviewLesson(languageId) : null;
    if (!built) {
      navigateTo('home');
      return;
    }
    lesson = built.lesson;
    built.origins.forEach((origin, questionId) => originOf.set(questionId, origin));
  } else {
    lesson = languageId && unitId ? getLesson(languageId, unitId, lessonId) : null;
    if (!lesson || !lesson.playable) {
      navigateTo('unitDetail', { languageId, unitId });
      return;
    }
  }

  // Mode review (lesson yang sudah selesai, atau sesi Ulas): tidak menambah XP.
  const isReview = isReviewSession || isLessonCompleted(languageId, unitId, lesson.id);

  const session = {
    step: isReviewSession ? 'question' : 'intro', // 'intro' | 'content' | 'cultureMoment' | 'question' | 'complete'
    contentIndex: 0,
    contentRevealed: false,
    questionIndex: 0,
    // frontier = soal paling jauh yang pernah aktif. Back/Forward tidak
    // menggerakkannya: Forward tidak boleh melompati soal yang belum dijawab.
    frontier: 0,
    // answers[i] = null sampai soal ke-i disubmit, lalu { type, correct, ...pilihan }.
    // Sumber kebenaran tunggal skor: tidak ada counter yang bisa dihitung dua kali.
    answers: new Array(lesson.questions.length).fill(null),
    arrangeSelection: [],
    matchingState: { selectedLeft: null, matchedPairIndices: [] },
    shownProgress: 0, // lebar progress bar terakhir yang ditampilkan (untuk animasi antar langkah)
  };

  const getCorrectCount = () => session.answers.filter((a) => a && a.correct).length;
  const getAnsweredCount = () => session.answers.filter(Boolean).length;

  // Dipakai untuk membatalkan efek tertunda (feedback) setelah user keluar.
  let sessionActive = true;

  function goToUnitDetail() {
    sessionActive = false;
    if (isReviewSession) navigateTo('home');
    else navigateTo('unitDetail', { languageId, unitId });
  }

  /* ---------------- Kerangka layar ---------------- */

  function headerHtml(progressPercent) {
    return `
      <div class="lesson-header">
        <button class="icon-btn" data-action="exit" aria-label="Keluar dari lesson">${icons.close}</button>
        <div class="progress-track progress-track--sm" role="progressbar" aria-label="Progress lesson" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressPercent)}">
          <div class="progress-fill" style="width:${session.shownProgress}%"></div>
        </div>
      </div>`;
  }

  // Progress bar bergerak dari lebar sebelumnya ke lebar baru (bukan lompat).
  function animateProgressTo(percent) {
    const fill = container.querySelector('.lesson-header .progress-fill');
    const track = container.querySelector('.lesson-header .progress-track');
    if (!fill) return;
    requestAnimationFrame(() => {
      fill.style.width = `${percent}%`;
      if (track) track.setAttribute('aria-valuenow', String(Math.round(percent)));
    });
    session.shownProgress = percent;
  }

  function screen({ progress, main, dock = '', mainClass = '', dockAttrs = '' }) {
    container.innerHTML = `
      <div class="lesson-session">
        ${headerHtml(progress)}
        <div class="lesson-main ${mainClass}">${main}</div>
        ${dock === null ? '' : `<div class="lesson-dock" ${dockAttrs}>${dock}</div>`}
      </div>`;
    animateProgressTo(progress);
    bindExit();
    // Fokus ke judul langkah supaya pembaca layar & keyboard tahu konteks baru.
    const target = container.querySelector('[data-focus-target]');
    if (target) target.focus({ preventScroll: true });
  }

  // Konfirmasi keluar hanya jika ada progress yang bisa hilang.
  function bindExit() {
    const exitBtn = container.querySelector('[data-action="exit"]');
    if (!exitBtn) return;
    exitBtn.addEventListener('click', () => {
      if (session.step === 'intro') {
        goToUnitDetail();
        return;
      }
      showConfirmDialog({
        title: isReviewSession ? 'Keluar dari ulasan?' : 'Keluar dari lesson?',
        message: isReviewSession ? 'Ulasan ini belum selesai.' : 'Progress lesson ini belum selesai.',
        safeLabel: 'Tetap Belajar',
        riskyLabel: 'Keluar',
        onRisky: goToUnitDetail,
      });
    });
  }

  const ctaHtml = (label, action, { disabled = false } = {}) =>
    `<button class="btn btn-primary btn-lg btn-block" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;

  /* ---------------- Intro ---------------- */

  function renderIntroStep() {
    const chips = lesson.learningContent.map((item) => `<span class="lesson-intro__chip">${item.native}</span>`).join('');
    screen({
      progress: 0,
      mainClass: 'lesson-intro__main',
      main: `
        ${mascotHtml({ mood: 'wave', size: 'md', className: 'lesson-intro__mascot' })}
        <span class="t-eyebrow">Lesson ${lesson.order}</span>
        <h1 class="lesson-intro__title" tabindex="-1" data-focus-target>${lesson.title}</h1>
        <p class="lesson-intro__objective">${lesson.objective}</p>
        <div class="lesson-intro__meta">
          <span>${icons.book}${lesson.learningContent.length} kata baru</span>
          <span>${icons.check}${lesson.questions.length} pertanyaan</span>
          <span>${icons.zap}± ${estimateMinutes(lesson)} menit</span>
        </div>
        <div class="lesson-intro__words">
          <span class="t-eyebrow">Kamu akan belajar</span>
          <div class="lesson-intro__chips">${chips}</div>
        </div>`,
      dock: ctaHtml('Mulai Belajar', 'start-lesson'),
    });

    container.querySelector('[data-action="start-lesson"]').addEventListener('click', () => {
      session.step = 'content';
      renderCurrentStep();
    });
  }

  /* ---------------- Learning Content ---------------- */

  function renderContentStep() {
    const total = lesson.learningContent.length;
    const item = lesson.learningContent[session.contentIndex];
    const isLastWord = session.contentIndex >= total - 1;
    // Content = separuh pertama progress sesi, Question = separuh kedua.
    const progress = (session.contentIndex / total) * 50;
    const revealed = session.contentRevealed;

    screen({
      progress,
      main: `
        <span class="t-eyebrow">Kata baru · ${session.contentIndex + 1} dari ${total}</span>
        <button class="card word-card card--static ${revealed ? 'is-revealed' : 'card-clickable'}" data-action="reveal-content" ${revealed ? 'disabled' : ''} aria-label="${item.native}${revealed ? `, artinya ${item.arti}` : ', ketuk untuk melihat arti'}">
          <span class="word-card__native" tabindex="-1" data-focus-target>${item.native}</span>
          <span class="word-card__reveal">
            ${
              revealed
                ? `<span class="word-card__arti">${item.arti}</span>`
                : `<span class="word-card__hint">Ketuk untuk lihat arti</span>`
            }
          </span>
        </button>`,
      dock: revealed ? ctaHtml(isLastWord ? 'Mulai Latihan' : 'Lanjut', 'content-next') : ctaHtml('Lihat Arti', 'reveal-content'),
    });

    const reveal = () => {
      session.contentRevealed = true;
      renderContentStep();
    };
    container.querySelectorAll('[data-action="reveal-content"]').forEach((el) => el.addEventListener('click', reveal));

    const nextBtn = container.querySelector('[data-action="content-next"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (isLastWord) {
          // Culture Moment muncul SEKALI di antara Content dan Question,
          // hanya jika lesson punya data cultureMoment (tidak dipaksakan).
          session.step = lesson.cultureMoment ? 'cultureMoment' : 'question';
        } else {
          session.contentIndex += 1;
          session.contentRevealed = false;
        }
        renderCurrentStep();
      });
      nextBtn.focus({ preventScroll: true });
    }
  }

  /* ---------------- Culture Moment ---------------- */

  function renderCultureMomentStep() {
    const moment = lesson.cultureMoment;
    screen({
      progress: 50,
      mainClass: 'lesson-intro__main',
      main: `
        <div class="card culture-moment">
          ${mascotHtml({ mood: 'think', size: 'sm' })}
          <span class="t-eyebrow">Budaya</span>
          <h2 class="culture-moment__title" tabindex="-1" data-focus-target>${moment.title}</h2>
          <p class="culture-moment__body">${moment.body}</p>
        </div>`,
      dock: ctaHtml('Lanjut Belajar', 'continue-culture-moment'),
    });

    container.querySelector('[data-action="continue-culture-moment"]').addEventListener('click', () => {
      session.step = 'question';
      renderCurrentStep();
    });
  }

  /* ---------------- Question + feedback inline ---------------- */

  function feedbackHtml(question, isCorrect) {
    const answer = correctAnswerText(question);
    const showXp = isCorrect && !isReview;
    return `
        <div class="fb-panel ${isCorrect ? 'is-correct' : 'is-incorrect'}">
          <div class="fb-panel__head">
            <span class="fb-panel__icon" aria-hidden="true">${isCorrect ? icons.check : icons.cross}</span>
            <h2 class="fb-panel__title">${isCorrect ? 'Benar!' : 'Belum tepat'}</h2>
            ${showXp ? `<span class="xp-gain-chip play">${icons.zap}+${XP_PER_CORRECT_ANSWER} XP</span>` : ''}
          </div>
          ${!isCorrect && answer ? `<p class="fb-panel__answer">Jawaban yang benar: <strong>${answer}</strong></p>` : ''}
          <div class="fb-explanation">
            <p class="fb-text">${question.explanation}</p>
            ${question.context ? `<p class="fb-context"><strong>Konteks:</strong> ${question.context}</p>` : ''}
          </div>
        </div>
        ${
          question.cultureInsight
            ? `<div class="fb-culture">
                <span class="fb-culture__icon" aria-hidden="true">${icons.bulb}</span>
                <div><p class="fb-label">Wawasan Budaya</p><p class="fb-text">${question.cultureInsight}</p></div>
              </div>`
            : ''
        }`;
  }

  // Sesi lesson: Content = separuh pertama progress, Question = separuh kedua.
  // Sesi Ulas hanya punya soal, jadi progress-nya 0-100%.
  function questionProgress() {
    const base = isReviewSession ? 0 : 50;
    const span = isReviewSession ? 100 : 50;
    return base + (getAnsweredCount() / lesson.questions.length) * span;
  }

  function updateAnswerProgress() {
    animateProgressTo(questionProgress());
  }

  // Panel feedback ditaruh INLINE di bawah jawaban (bukan menutupi jawaban);
  // dock bawah hanya berisi satu CTA "Lanjutkan".
  function showFeedback(dockEl, question, isCorrect) {
    const slot = container.querySelector('#feedback-slot');
    slot.innerHTML = feedbackHtml(question, isCorrect);
    dockEl.innerHTML = ctaHtml('Lanjutkan', 'continue');
    const continueBtn = dockEl.querySelector('[data-action="continue"]');
    continueBtn.addEventListener('click', goNextQuestion);
    continueBtn.focus({ preventScroll: true });
    slot.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  function goNextQuestion() {
    if (session.questionIndex >= lesson.questions.length - 1) {
      session.step = 'complete';
    } else {
      session.questionIndex += 1;
      session.frontier = Math.max(session.frontier, session.questionIndex);
      session.step = 'question';
    }
    renderCurrentStep();
  }

  // Dipanggil saat "Periksa Jawaban" ditekan (atau matching selesai):
  // catat jawaban, terapkan state visual, lalu tampilkan feedback setelah animasi.
  function commitAnswer({ dockEl, question, isCorrect, record, applyStates }) {
    session.answers[session.questionIndex] = { ...record, correct: isCorrect };
    applyStates(isCorrect);
    if (isCorrect) playCorrect();
    else playWrong();
    updateAnswerProgress();
    setTimeout(() => {
      if (!sessionActive || !dockEl.isConnected) return;
      showFeedback(dockEl, question, isCorrect);
    }, feedbackDelay());
  }

  function checkButtonHtml(disabled = true) {
    return ctaHtml('Periksa Jawaban', 'check-answer', { disabled });
  }

  function motionClass(isCorrect) {
    return isCorrect ? 'is-pop' : 'is-nudge';
  }

  function renderMultipleChoiceBody(bodyEl, dockEl, question, saved) {
    const html = question.options
      .map((opt, i) => choiceHtml(opt, `data-index="${i}" aria-pressed="false" ${saved ? 'disabled' : ''}`))
      .join('');
    bodyEl.innerHTML = `<div class="choice-group">${html}</div>`;
    const choices = [...bodyEl.querySelectorAll('.choice')];

    const applyStates = (picked, isCorrect, animate) => {
      choices.forEach((c) => {
        c.disabled = true;
        c.classList.remove('is-selected');
      });
      const pickedEl = choices[picked];
      pickedEl.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
      if (animate) pickedEl.classList.add(motionClass(isCorrect));
      if (!isCorrect) choices[question.correctIndex].classList.add('is-correct');
    };

    if (saved) {
      applyStates(saved.selectedIndex, saved.correct, false);
      showFeedback(dockEl, question, saved.correct);
      return;
    }

    dockEl.innerHTML = checkButtonHtml();
    const checkBtn = dockEl.querySelector('[data-action="check-answer"]');
    let selected = null;

    choices.forEach((choice, i) => {
      choice.addEventListener('click', () => {
        selected = i;
        choices.forEach((c, j) => {
          c.classList.toggle('is-selected', j === i);
          c.setAttribute('aria-pressed', String(j === i));
        });
        checkBtn.disabled = false;
        playSelect();
      });
    });

    checkBtn.addEventListener('click', () => {
      if (selected === null) return;
      checkBtn.disabled = true;
      const isCorrect = selected === question.correctIndex;
      commitAnswer({
        dockEl, question, isCorrect,
        record: { type: 'multiple-choice', selectedIndex: selected },
        applyStates: (ok) => applyStates(selected, ok, true),
      });
    });
  }

  function renderTrueFalseBody(bodyEl, dockEl, question, saved) {
    const options = [{ value: true, label: 'Benar' }, { value: false, label: 'Salah' }];
    bodyEl.innerHTML = `<div class="choice-group two-col">${options
      .map(({ value, label }) => choiceHtml(label, `data-value="${value}" aria-pressed="false" ${saved ? 'disabled' : ''}`))
      .join('')}</div>`;
    const choices = [...bodyEl.querySelectorAll('.choice')];
    const elFor = (value) => choices.find((c) => c.dataset.value === String(value));

    const applyStates = (picked, isCorrect, animate) => {
      choices.forEach((c) => {
        c.disabled = true;
        c.classList.remove('is-selected');
      });
      const pickedEl = elFor(picked);
      pickedEl.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
      if (animate) pickedEl.classList.add(motionClass(isCorrect));
      if (!isCorrect) elFor(question.correctAnswer).classList.add('is-correct');
    };

    if (saved) {
      applyStates(saved.selectedValue, saved.correct, false);
      showFeedback(dockEl, question, saved.correct);
      return;
    }

    dockEl.innerHTML = checkButtonHtml();
    const checkBtn = dockEl.querySelector('[data-action="check-answer"]');
    let selected = null;

    choices.forEach((choice) => {
      choice.addEventListener('click', () => {
        selected = choice.dataset.value === 'true';
        choices.forEach((c) => {
          c.classList.toggle('is-selected', c === choice);
          c.setAttribute('aria-pressed', String(c === choice));
        });
        checkBtn.disabled = false;
        playSelect();
      });
    });

    checkBtn.addEventListener('click', () => {
      if (selected === null) return;
      checkBtn.disabled = true;
      const isCorrect = selected === question.correctAnswer;
      commitAnswer({
        dockEl, question, isCorrect,
        record: { type: 'true-false', selectedValue: selected },
        applyStates: (ok) => applyStates(selected, ok, true),
      });
    });
  }

  function renderTranslateBody(bodyEl, dockEl, question, saved) {
    bodyEl.innerHTML = `
      <input type="text" class="field-input" aria-label="Jawabanmu"
        placeholder="${question.placeholder || 'Ketik jawabanmu di sini...'}"
        autocomplete="off" autocapitalize="off" spellcheck="false" />`;
    const input = bodyEl.querySelector('.field-input');

    const applyStates = (isCorrect, animate) => {
      input.disabled = true;
      input.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
      if (animate) input.classList.add(motionClass(isCorrect));
    };

    if (saved) {
      input.value = saved.value; // lewat property agar tidak perlu escape manual
      applyStates(saved.correct, false);
      showFeedback(dockEl, question, saved.correct);
      return;
    }

    dockEl.innerHTML = checkButtonHtml();
    const checkBtn = dockEl.querySelector('[data-action="check-answer"]');
    input.focus();

    const submit = () => {
      const normalized = normalizeAnswer(input.value);
      if (!normalized || checkBtn.disabled) return;
      checkBtn.disabled = true;
      const isCorrect = question.correctAnswers.some((ans) => normalizeAnswer(ans) === normalized);
      const raw = input.value;
      commitAnswer({
        dockEl, question, isCorrect,
        record: { type: 'translate', value: raw },
        applyStates: (ok) => applyStates(ok, true),
      });
    };

    input.addEventListener('input', () => {
      checkBtn.disabled = normalizeAnswer(input.value).length === 0;
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    checkBtn.addEventListener('click', submit);
  }

  function renderArrangeBody(bodyEl, dockEl, question, saved) {
    if (saved) {
      const state = saved.correct ? 'is-correct' : 'is-incorrect';
      const tiles = saved.order.map((i) => `<button class="tile ${state}" disabled>${question.words[i]}</button>`).join('');
      bodyEl.innerHTML = `<div class="arrange-answer">${tiles}</div>`;
      showFeedback(dockEl, question, saved.correct);
      return;
    }

    // Urutan asli question.words = jawaban benar; index disimpan supaya kata
    // yang sama persis tetap bisa dibedakan posisinya.
    const shuffled = shuffle(question.words.map((word, i) => ({ word, i })));
    dockEl.innerHTML = checkButtonHtml();
    const checkBtn = dockEl.querySelector('[data-action="check-answer"]');

    function draw() {
      const answerHtml = session.arrangeSelection
        .map((i) => `<button class="tile is-selected" data-word-index="${i}" aria-label="${question.words[i]}, ketuk untuk melepas">${question.words[i]}</button>`)
        .join('');
      const bankHtml = shuffled
        .filter(({ i }) => !session.arrangeSelection.includes(i))
        .map(({ word, i }) => `<button class="tile" data-word-index="${i}">${word}</button>`)
        .join('');

      bodyEl.innerHTML = `
        <div class="arrange-answer">${answerHtml || '<span class="arrange-answer__placeholder">Ketuk kata di bawah untuk menyusun kalimat</span>'}</div>
        <div class="arrange-bank">${bankHtml}</div>`;
      checkBtn.disabled = session.arrangeSelection.length !== question.words.length;

      bodyEl.querySelectorAll('.tile').forEach((tile) => {
        tile.addEventListener('click', () => {
          const i = Number(tile.dataset.wordIndex);
          if (tile.classList.contains('is-selected')) {
            session.arrangeSelection = session.arrangeSelection.filter((x) => x !== i);
          } else {
            session.arrangeSelection.push(i);
          }
          playSelect();
          draw();
        });
      });
    }

    checkBtn.addEventListener('click', () => {
      if (checkBtn.disabled) return;
      checkBtn.disabled = true;
      const order = [...session.arrangeSelection];
      const isCorrect = order.every((wordIndex, position) => wordIndex === position);
      commitAnswer({
        dockEl, question, isCorrect,
        record: { type: 'arrange', order },
        applyStates: (ok) => {
          bodyEl.querySelectorAll('.arrange-answer .tile').forEach((tile) => {
            tile.disabled = true;
            tile.classList.remove('is-selected');
            tile.classList.add(ok ? 'is-correct' : 'is-incorrect', motionClass(ok));
          });
          bodyEl.querySelectorAll('.arrange-bank .tile').forEach((tile) => { tile.disabled = true; });
        },
      });
    });

    draw();
  }

  function renderMatchingBody(bodyEl, dockEl, question, saved) {
    // Matching tidak punya status "salah final": salah pasang hanya reset
    // pilihan. Selesai = semua pasangan cocok = benar, tanpa tombol periksa.
    if (saved) {
      const tile = (label) => `<button class="tile is-matched" disabled>${label}</button>`;
      bodyEl.innerHTML = `
        <div class="matching-columns">
          <div class="matching-column">${question.pairs.map((p) => tile(p.native)).join('')}</div>
          <div class="matching-column">${question.pairs.map((p) => tile(p.arti)).join('')}</div>
        </div>`;
      showFeedback(dockEl, question, true);
      return;
    }

    const left = shuffle(question.pairs.map((pair, i) => ({ label: pair.native, i })));
    const right = shuffle(question.pairs.map((pair, i) => ({ label: pair.arti, i })));

    function draw() {
      const { selectedLeft, matchedPairIndices } = session.matchingState;
      const tile = ({ label, i }, side) => {
        const matched = matchedPairIndices.includes(i);
        const selected = side === 'left' && selectedLeft === i;
        return `<button class="tile ${matched ? 'is-matched' : ''} ${selected ? 'is-selected' : ''}" data-pair-index="${i}" data-side="${side}" ${matched ? 'disabled' : ''}>${label}</button>`;
      };
      bodyEl.innerHTML = `
        <div class="matching-columns">
          <div class="matching-column">${left.map((t) => tile(t, 'left')).join('')}</div>
          <div class="matching-column">${right.map((t) => tile(t, 'right')).join('')}</div>
        </div>`;

      bodyEl.querySelectorAll('[data-side="left"]').forEach((el) => {
        el.addEventListener('click', () => {
          const i = Number(el.dataset.pairIndex);
          session.matchingState.selectedLeft = session.matchingState.selectedLeft === i ? null : i;
          playSelect();
          draw();
        });
      });

      bodyEl.querySelectorAll('[data-side="right"]').forEach((el) => {
        el.addEventListener('click', () => {
          if (session.matchingState.selectedLeft === null) return;
          const i = Number(el.dataset.pairIndex);

          if (i === session.matchingState.selectedLeft) {
            session.matchingState.matchedPairIndices.push(i);
            session.matchingState.selectedLeft = null;
            draw();
            bodyEl.querySelectorAll(`[data-pair-index="${i}"]`).forEach((t) => t.classList.add('is-pop'));
            playSelect();

            if (session.matchingState.matchedPairIndices.length === question.pairs.length) {
              commitAnswer({ dockEl, question, isCorrect: true, record: { type: 'matching' }, applyStates: () => {} });
            }
          } else {
            // Salah pasang bukan kegagalan: nudge halus warna caution, lalu coba lagi.
            session.matchingState.selectedLeft = null;
            draw();
            const wrong = bodyEl.querySelector(`[data-side="right"][data-pair-index="${i}"]`);
            if (wrong) {
              wrong.classList.add('is-incorrect', 'is-nudge');
              setTimeout(() => wrong.classList.remove('is-incorrect', 'is-nudge'), 600);
            }
          }
        });
      });
    }

    draw();
  }

  function bindQuestionNav() {
    const back = container.querySelector('[data-action="question-back"]');
    const forward = container.querySelector('[data-action="question-forward"]');
    if (back && !back.disabled) {
      back.addEventListener('click', () => {
        session.questionIndex -= 1;
        renderCurrentStep();
      });
    }
    if (forward && !forward.disabled) {
      forward.addEventListener('click', () => {
        session.questionIndex += 1;
        renderCurrentStep();
      });
    }
  }

  function renderQuestionStep() {
    const question = lesson.questions[session.questionIndex];
    const total = lesson.questions.length;
    const saved = session.answers[session.questionIndex];

    // Reset state transien hanya untuk soal yang belum pernah dijawab.
    if (!saved) {
      session.arrangeSelection = [];
      session.matchingState = { selectedLeft: null, matchedPairIndices: [] };
    }

    // Progress dihitung dari jumlah soal yang sudah dijawab, bukan posisi
    // tampilan, jadi tidak terlihat "mundur" saat user browsing lewat Back.
    const progress = questionProgress();
    const canBack = session.questionIndex > 0;
    const canForward = session.questionIndex < session.frontier;

    screen({
      progress,
      main: `
        <div class="question-meta">
          <span class="lesson-position__count" aria-label="Soal ${session.questionIndex + 1} dari ${total}">${session.questionIndex + 1}<span class="lesson-position__sep">/</span>${total}</span>
          <div class="question-meta__nav">
            <button class="icon-btn" data-action="question-back" aria-label="Soal sebelumnya" ${canBack ? '' : 'disabled'}>${icons.chevronLeft}</button>
            <button class="icon-btn" data-action="question-forward" aria-label="Soal berikutnya" ${canForward ? '' : 'disabled'}>${icons.chevronRight}</button>
          </div>
        </div>
        <h1 class="question-prompt" tabindex="-1" data-focus-target>${question.prompt}</h1>
        <div class="question-body" id="question-body"></div>
        <div class="feedback-slot" id="feedback-slot" aria-live="polite"></div>`,
      dock: '',
      dockAttrs: 'id="lesson-dock"',
    });

    bindQuestionNav();
    const bodyEl = container.querySelector('#question-body');
    const dockEl = container.querySelector('#lesson-dock');

    const renderers = {
      translate: renderTranslateBody,
      arrange: renderArrangeBody,
      matching: renderMatchingBody,
      'true-false': renderTrueFalseBody,
    };
    (renderers[question.type] || renderMultipleChoiceBody)(bodyEl, dockEl, question, saved);
  }

  /* ---------------- Lesson Complete ---------------- */

  function completeRow(icon, bubbleClass, label, value) {
    return `
      <div class="card card--static complete-row">
        <span class="icon-bubble ${bubbleClass}" aria-hidden="true">${icon}</span>
        <span class="card-body"><span class="complete-row__label">${label}</span><span class="complete-row__value">${value}</span></span>
      </div>`;
  }

  function renderCompleteStep() {
    const total = lesson.questions.length;
    const correctCount = getCorrectCount();
    const wrongCount = total - correctCount;

    // Catat soal yang salah ke daftar ulas dan keluarkan yang kali ini benar.
    const remaining = saveQuestionResults(
      lesson.questions.map((q, i) => {
        const origin = originOf.get(q.id) || { languageId, unitId, lessonId: lesson.id };
        return {
          languageId: origin.languageId,
          unitId: origin.unitId,
          lessonId: origin.lessonId,
          questionId: q.id,
          correct: Boolean(session.answers[i] && session.answers[i].correct),
        };
      })
    ).filter((item) => item.languageId === languageId).length;

    if (isReviewSession) {
      playComplete();
      screen({
        progress: 100,
        mainClass: 'lesson-complete__main',
        main: `
          <div class="card card--featured reward-card" id="reward-card">
            ${mascotHtml({ mood: 'cheer', size: 'md' })}
            <h1 class="reward-card__title" tabindex="-1" data-focus-target>${remaining === 0 ? 'Semua sudah dikuasai!' : 'Ulasan selesai!'}</h1>
            <div class="reward-card__xp">${correctCount}/${total}</div>
            <p class="reward-card__note">jawaban benar · XP tidak bertambah di mode ulas</p>
          </div>
          <div class="complete-rows">
            ${completeRow(icons.check, 'icon-bubble--success', 'Sudah dikuasai', `${correctCount} soal`)}
            ${remaining > 0 ? completeRow(icons.repeat, '', 'Masih perlu diulang', `${remaining} soal`) : ''}
          </div>`,
        dock: ctaHtml('Lanjutkan', 'finish'),
      });
      container.querySelector('[data-action="finish"]').addEventListener('click', goToUnitDetail);
      return;
    }

    const earnedBefore = new Set(getBadgesWithStatus().filter((b) => b.earned).map((b) => b.id));
    const wasUnitDone = unitPlayableDone();

    const earnedXP = isReview
      ? 0
      : completeLesson(languageId, unitId, lesson.id, correctCount, total).earnedXP;

    const newBadges = getBadgesWithStatus().filter((b) => b.earned && !earnedBefore.has(b.id));
    const unitJustDone = !isReview && !wasUnitDone && unitPlayableDone();
    const progress = getUnitProgress(languageId, unitId);
    const streak = getState().streak;
    const isMilestone = unitJustDone || newBadges.length > 0;

    playComplete();

    screen({
      progress: 100,
      mainClass: 'lesson-complete__main',
      main: `
        <div class="card card--featured reward-card" id="reward-card">
          ${mascotHtml({ mood: 'cheer', size: 'md' })}
          <h1 class="reward-card__title" tabindex="-1" data-focus-target>${isReview ? 'Ulasan selesai!' : unitJustDone ? 'Unit selesai!' : 'Lesson selesai!'}</h1>
          ${
            isReview
              ? `<div class="reward-card__xp">${correctCount}/${total}</div><p class="reward-card__note">jawaban benar · XP tidak bertambah di mode ulas</p>`
              : `<div class="reward-card__xp">${icons.zap}<span id="xp-count">+0 XP</span></div><p class="reward-card__note">${correctCount} dari ${total} jawaban benar</p>`
          }
        </div>
        <div class="complete-rows">
          ${completeRow(icons.book, '', 'Progress unit', `${progress.completed} dari ${progress.total} lesson selesai`)}
          ${completeRow(icons.flame, 'icon-bubble--culture', 'Streak', `${streak} hari`)}
          ${newBadges.map((b) => completeRow(icons[b.icon], '', 'Lencana baru', b.title)).join('')}
          ${wrongCount > 0 ? completeRow(icons.repeat, '', 'Untuk diulas', `${wrongCount} soal masuk "Ulas kata yang salah" di Home`) : ''}
        </div>`,
      dock: ctaHtml('Lanjutkan', 'finish'),
    });

    const xpEl = container.querySelector('#xp-count');
    if (xpEl) animateCount(xpEl, earnedXP, { prefix: '+', suffix: ' XP' });
    // Celebration besar hanya untuk milestone (unit selesai / achievement baru).
    if (isMilestone) burstConfetti(container.querySelector('#reward-card'), { pieces: 24 });

    container.querySelector('[data-action="finish"]').addEventListener('click', goToUnitDetail);
  }

  // Unit dianggap selesai bila semua lesson PLAYABLE-nya completed.
  function unitPlayableDone() {
    const unit = getUnit(languageId, unitId);
    const playable = unit ? unit.lessons.filter((l) => l.playable) : [];
    return playable.length > 0 && playable.every((l) => isLessonCompleted(languageId, unitId, l.id));
  }

  /* ---------------- Router internal ---------------- */

  function renderCurrentStep() {
    if (session.step === 'intro') return renderIntroStep();
    if (session.step === 'content') return renderContentStep();
    if (session.step === 'cultureMoment') return renderCultureMomentStep();
    if (session.step === 'question') return renderQuestionStep();
    if (session.step === 'complete') return renderCompleteStep();
  }

  renderCurrentStep();
}
