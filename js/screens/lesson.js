/*
  lesson.js
  Lesson player — satu-satunya tempat alur inti BahasaKoe dijalankan:
  Learning Content -> Question -> Feedback -> ... -> Lesson Complete.

  Learning Content ditampilkan satu kata per layar (bukan daftar panjang):
  sisi bahasa yang dipelajari muncul dulu, arti-nya baru terbuka setelah
  user ketuk "Lihat Arti". Tujuannya supaya user aktif menebak dulu, bukan
  sekadar membaca daftar. Field kosakata di data bernama "native" (generik
  untuk semua bahasa) -- lihat js/data/jawa/unit1.js atau
  js/data/sunda/unit1.js.

  Prinsip: Question SELALU diikuti Feedback dengan explanation.
  Context dan Culture Insight hanya dirender kalau memang ada di data
  lesson (lihat js/data/jawa/unit1.js, diakses generik lewat
  js/data/curriculum.js) — tidak dipaksakan di setiap soal.

  Variasi mekanisme soal (question.type):
  - 'multiple-choice' (default kalau type tidak diisi): pilih 1 dari beberapa opsi.
  - 'translate': ketik jawaban singkat, dicocokkan ke question.correctAnswers[].
  - 'arrange': susun question.words[] (urutan yang benar) dengan menyentuh
    kata-kata acak, mirip "build the sentence" ala Duolingo.
  - 'matching': cocokkan question.pairs[] (native <-> arti) dengan tap dua sisi;
    tidak ada status "salah final" — salah pasang cuma reset pilihan & retry,
    baru dianggap selesai (dan correct) begitu semua pasangan cocok.
  - 'true-false': nilai kebenaran satu pernyataan (question.correctAnswer: boolean).
  Menambah tipe baru cukup: (1) tambah data soal dengan field yang relevan,
  (2) tambah satu fungsi render*Body + logic cek jawabannya di file ini.

  State per-sesi (step, index kata/pertanyaan, jumlah benar, dst) disimpan
  sebagai variabel lokal di closure ini, BUKAN di LocalStorage. LocalStorage
  (lewat appState.js) hanya disentuh sekali, saat lesson benar-benar
  selesai (completeLesson).
*/

import { getLesson } from '../data/curriculum.js';
import { completeLesson, isLessonCompleted } from '../state/appState.js';
import { showToast } from '../ui/toast.js';
import { icons } from '../ui/icons.js';

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

export function renderLesson(container, { navigateTo }, params = {}) {
  const { languageId, unitId, lessonId } = params;
  const lesson = languageId && unitId ? getLesson(languageId, unitId, lessonId) : null;

  if (!lesson || !lesson.playable) {
    // Jaga-jaga kalau renderLesson dipanggil dengan context yang tidak valid/belum playable.
    navigateTo('learn');
    return;
  }

  const session = {
    step: 'content', // 'content' | 'question' | 'feedback' | 'complete'
    contentIndex: 0,
    contentRevealed: false,
    questionIndex: 0,
    correctCount: 0,
    lastAnswerCorrect: null,
    arrangeSelection: [], // dipakai khusus tipe 'arrange': urutan index kata yang sudah disentuh
    matchingState: { selectedLeft: null, matchedPairIndices: [] }, // dipakai khusus tipe 'matching'
  };

  function sessionHeader(progressPercent) {
    return `
      <div class="lesson-session__header">
        <button class="lesson-session__exit" data-action="exit" aria-label="Keluar dari lesson">${icons.close}</button>
        <div class="progress-track lesson-session__progress">
          <div class="progress-fill" style="width:${progressPercent}%"></div>
        </div>
      </div>
    `;
  }

  // BUG FIX (audit STEP 6): flashThenSubmit() menunda submitAnswer() 700ms
  // (lihat ANSWER_FLASH_DELAY_MS). Kalau user tap tombol keluar (exit) di
  // dalam jendela 700ms itu -- sepenuhnya mungkin, tombolnya masih ada &
  // aktif -- timeout tetap jalan dan menimpa layar yang sudah dinavigasikan
  // user dengan Feedback step yang basi begitu 700ms lewat. sessionActive
  // dipakai untuk membatalkan efek lanjutan setelah user keluar.
  let sessionActive = true;

  function bindExit() {
    const exitBtn = container.querySelector('[data-action="exit"]');
    if (exitBtn) exitBtn.addEventListener('click', () => {
      sessionActive = false;
      navigateTo('learn');
    });
  }

  function renderContentStep() {
    const totalWords = lesson.learningContent.length;
    const item = lesson.learningContent[session.contentIndex];
    const isLastWord = session.contentIndex >= totalWords - 1;
    // Content dianggap "separuh pertama" progress sesi, question "separuh kedua" —
    // supaya progress bar terasa jalan terus dari awal sampai lesson selesai.
    const progressPercent = (session.contentIndex / totalWords) * 50;

    // Judul & objective cukup ditampilkan di kata pertama saja, supaya
    // kata-kata berikutnya terasa ringkas & fokus ke satu hal.
    const introHtml =
      session.contentIndex === 0
        ? `
          <div class="lesson-session__title">${lesson.title}</div>
          <p class="lesson-session__objective">${lesson.objective}</p>
        `
        : '';

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(progressPercent)}
        ${introHtml}
        <div class="content-card-counter">${session.contentIndex + 1} / ${totalWords}</div>
        <button
          class="content-card ${session.contentRevealed ? 'is-revealed' : ''}"
          data-action="reveal-content"
          ${session.contentRevealed ? 'disabled' : ''}
        >
          <div class="content-card__jawa">${item.native}</div>
          ${
            session.contentRevealed
              ? `<div class="content-card__arti">${item.arti}</div>`
              : `<div class="content-card__hint">Ketuk untuk lihat arti</div>`
          }
        </button>
        <button
          class="btn btn-primary lesson-session__cta"
          data-action="content-next"
          ${session.contentRevealed ? '' : 'disabled'}
        >
          ${isLastWord ? 'Mulai Latihan' : 'Lanjut'}
        </button>
      </div>
    `;

    bindExit();

    container.querySelector('[data-action="reveal-content"]').addEventListener('click', () => {
      session.contentRevealed = true;
      renderContentStep();
    });

    container.querySelector('[data-action="content-next"]').addEventListener('click', () => {
      if (!session.contentRevealed) return; // jaga-jaga; tombol seharusnya sudah disabled
      if (isLastWord) {
        session.step = 'question';
      } else {
        session.contentIndex += 1;
        session.contentRevealed = false;
      }
      renderCurrentStep();
    });
  }

  function submitAnswer(isCorrect) {
    session.lastAnswerCorrect = isCorrect;
    if (isCorrect) session.correctCount += 1;
    session.step = 'feedback';
    renderCurrentStep();
  }

  // Highlight sekejap di elemen yang dijawab (hijau = benar, soft red = kurang
  // tepat — bagian dari sistem warna merah-putih, bukan warna semantic
  // ketiga) sebelum pindah ke Feedback, supaya jawaban terasa "direspons"
  // langsung, bukan langsung lompat layar.
  const ANSWER_FLASH_DELAY_MS = 700;

  function flashThenSubmit(el, isCorrect) {
    el.classList.add(isCorrect ? 'is-correct-flash' : 'is-wrong-flash');
    setTimeout(() => {
      if (!sessionActive) return; // user sudah keluar dari lesson ini sebelum timer selesai
      submitAnswer(isCorrect);
    }, ANSWER_FLASH_DELAY_MS);
  }

  function renderMultipleChoiceBody(bodyEl, question) {
    const optionsHtml = question.options
      .map((opt, i) => `<button class="question-option" data-index="${i}">${opt}</button>`)
      .join('');

    bodyEl.innerHTML = `<div class="question-options">${optionsHtml}</div>`;

    const optionButtons = bodyEl.querySelectorAll('.question-option');
    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedIndex = Number(btn.dataset.index);
        const isCorrect = selectedIndex === question.correctIndex;
        optionButtons.forEach((optionBtn) => { optionBtn.disabled = true; });
        flashThenSubmit(btn, isCorrect);
      });
    });
  }

  function renderTranslateBody(bodyEl, question) {
    bodyEl.innerHTML = `
      <div class="translate-body">
        <input
          type="text"
          class="question-text-input"
          placeholder="${question.placeholder || 'Ketik jawabanmu di sini...'}"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <button class="btn btn-primary question-submit" data-action="submit-translate" disabled>Periksa</button>
      </div>
    `;

    const inputEl = bodyEl.querySelector('.question-text-input');
    const submitBtn = bodyEl.querySelector('[data-action="submit-translate"]');
    inputEl.focus();

    function handleSubmit() {
      if (normalizeAnswer(inputEl.value).length === 0) return;
      const userAnswer = normalizeAnswer(inputEl.value);
      const isCorrect = question.correctAnswers.some((ans) => normalizeAnswer(ans) === userAnswer);
      inputEl.disabled = true;
      submitBtn.disabled = true;
      flashThenSubmit(inputEl, isCorrect);
    }

    inputEl.addEventListener('input', () => {
      submitBtn.disabled = normalizeAnswer(inputEl.value).length === 0;
    });
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
    submitBtn.addEventListener('click', handleSubmit);
  }

  function renderArrangeBody(bodyEl, question) {
    // Urutan asli question.words dianggap jawaban benar; index disimpan
    // supaya kata yang sama persis tetap bisa dibedakan posisinya.
    const shuffledTokens = shuffle(question.words.map((word, i) => ({ word, i })));

    function draw() {
      const answerHtml = session.arrangeSelection
        .map(
          (wordIndex) =>
            `<button class="arrange-chip is-selected" data-word-index="${wordIndex}">${question.words[wordIndex]}</button>`
        )
        .join('');

      const bankHtml = shuffledTokens
        .filter(({ i }) => !session.arrangeSelection.includes(i))
        .map(({ word, i }) => `<button class="arrange-chip" data-word-index="${i}">${word}</button>`)
        .join('');

      const isComplete = session.arrangeSelection.length === question.words.length;

      bodyEl.innerHTML = `
        <div class="arrange-answer-row">
          ${answerHtml || '<span class="arrange-answer-row__placeholder">Ketuk kata di bawah untuk menyusun kalimat</span>'}
        </div>
        <div class="arrange-word-bank">${bankHtml}</div>
        <button class="btn btn-primary question-submit" data-action="submit-arrange" ${isComplete ? '' : 'disabled'}>Periksa</button>
      `;

      bodyEl.querySelectorAll('.arrange-answer-row .arrange-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const wordIndex = Number(chip.dataset.wordIndex);
          session.arrangeSelection = session.arrangeSelection.filter((i) => i !== wordIndex);
          draw();
        });
      });

      bodyEl.querySelectorAll('.arrange-word-bank .arrange-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const wordIndex = Number(chip.dataset.wordIndex);
          session.arrangeSelection.push(wordIndex);
          draw();
        });
      });

      const submitBtn = bodyEl.querySelector('[data-action="submit-arrange"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          const isCorrect = session.arrangeSelection.every((wordIndex, position) => wordIndex === position);
          const answerRow = bodyEl.querySelector('.arrange-answer-row');
          submitBtn.disabled = true;
          bodyEl.querySelectorAll('.arrange-chip').forEach((chip) => { chip.disabled = true; });
          flashThenSubmit(answerRow, isCorrect);
        });
      }
    }

    draw();
  }

  function renderMatchingBody(bodyEl, question) {
    // Kolom kiri (kata bahasa target) & kanan (arti) diacak independen;
    // data-pair-index menyimpan index pasangan aslinya supaya bisa dicek waktu di-tap.
    const leftItems = shuffle(question.pairs.map((pair, i) => ({ label: pair.native, i })));
    const rightItems = shuffle(question.pairs.map((pair, i) => ({ label: pair.arti, i })));

    function draw() {
      const { selectedLeft, matchedPairIndices } = session.matchingState;

      const leftHtml = leftItems
        .map(({ label, i }) => {
          const isMatched = matchedPairIndices.includes(i);
          const isSelected = selectedLeft === i;
          return `<button class="matching-chip ${isMatched ? 'is-matched' : ''} ${isSelected ? 'is-selected' : ''}" data-pair-index="${i}" data-side="left" ${isMatched ? 'disabled' : ''}>${label}</button>`;
        })
        .join('');

      const rightHtml = rightItems
        .map(({ label, i }) => {
          const isMatched = matchedPairIndices.includes(i);
          return `<button class="matching-chip ${isMatched ? 'is-matched' : ''}" data-pair-index="${i}" data-side="right" ${isMatched ? 'disabled' : ''}>${label}</button>`;
        })
        .join('');

      bodyEl.innerHTML = `
        <div class="matching-columns">
          <div class="matching-column">${leftHtml}</div>
          <div class="matching-column">${rightHtml}</div>
        </div>
      `;

      bodyEl.querySelectorAll('.matching-chip[data-side="left"]').forEach((chip) => {
        chip.addEventListener('click', () => {
          session.matchingState.selectedLeft = Number(chip.dataset.pairIndex);
          draw();
        });
      });

      bodyEl.querySelectorAll('.matching-chip[data-side="right"]').forEach((chip) => {
        chip.addEventListener('click', () => {
          if (session.matchingState.selectedLeft === null) return;
          const pairIndex = Number(chip.dataset.pairIndex);

          if (pairIndex === session.matchingState.selectedLeft) {
            session.matchingState.matchedPairIndices.push(pairIndex);
            session.matchingState.selectedLeft = null;

            if (session.matchingState.matchedPairIndices.length === question.pairs.length) {
              // Semua pasangan cocok — matching dianggap selesai & benar.
              submitAnswer(true);
              return;
            }
            draw();
          } else {
            // Salah pasang bukan kegagalan permanen — cukup reset pilihan, coba lagi.
            session.matchingState.selectedLeft = null;
            showToast(`${icons.star} Belum cocok, coba lagi`);
            draw();
          }
        });
      });
    }

    draw();
  }

  function renderTrueFalseBody(bodyEl, question) {
    bodyEl.innerHTML = `
      <div class="true-false-options">
        <button class="btn btn-secondary true-false-option" data-value="true">Benar</button>
        <button class="btn btn-secondary true-false-option" data-value="false">Salah</button>
      </div>
    `;

    const optionButtons = bodyEl.querySelectorAll('.true-false-option');
    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosenValue = btn.dataset.value === 'true';
        const isCorrect = chosenValue === question.correctAnswer;
        optionButtons.forEach((optionBtn) => { optionBtn.disabled = true; });
        flashThenSubmit(btn, isCorrect);
      });
    });
  }

  function renderQuestionStep() {
    const question = lesson.questions[session.questionIndex];
    const totalQuestions = lesson.questions.length;
    session.arrangeSelection = []; // reset tiap masuk soal baru
    session.matchingState = { selectedLeft: null, matchedPairIndices: [] };

    // Question dianggap "separuh kedua" progress sesi (lihat renderContentStep).
    const progressPercent = 50 + (session.questionIndex / totalQuestions) * 50;

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(progressPercent)}
        <div class="question-prompt">${question.prompt}</div>
        <div class="question-body" id="question-body"></div>
      </div>
    `;

    bindExit();
    const bodyEl = container.querySelector('#question-body');

    if (question.type === 'translate') {
      renderTranslateBody(bodyEl, question);
    } else if (question.type === 'arrange') {
      renderArrangeBody(bodyEl, question);
    } else if (question.type === 'matching') {
      renderMatchingBody(bodyEl, question);
    } else if (question.type === 'true-false') {
      renderTrueFalseBody(bodyEl, question);
    } else {
      renderMultipleChoiceBody(bodyEl, question);
    }
  }

  function renderFeedbackStep() {
    const question = lesson.questions[session.questionIndex];
    const isCorrect = session.lastAnswerCorrect;
    const totalQuestions = lesson.questions.length;
    const progressPercent = 50 + ((session.questionIndex + 1) / totalQuestions) * 50;

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(progressPercent)}
        <div class="feedback-panel ${isCorrect ? 'is-correct' : 'is-gentle-wrong'}">
          <div class="feedback-panel__status">${isCorrect ? `${icons.star} Benar!` : 'Kurang tepat'}</div>
          <p class="feedback-panel__explanation">${question.explanation}</p>
          ${
            question.context
              ? `<div class="feedback-panel__context"><span class="feedback-panel__label">Konteks</span><p>${question.context}</p></div>`
              : ''
          }
          ${
            question.cultureInsight && !question.needsValidation
              ? `<div class="feedback-panel__culture"><span class="feedback-panel__label">Wawasan Budaya</span><p>${question.cultureInsight}</p></div>`
              : ''
          }
        </div>
        <button class="btn btn-primary lesson-session__cta" data-action="continue">Lanjut</button>
      </div>
    `;

    bindExit();
    container.querySelector('[data-action="continue"]').addEventListener('click', () => {
      const isLastQuestion = session.questionIndex >= lesson.questions.length - 1;
      if (isLastQuestion) {
        session.step = 'complete';
      } else {
        session.questionIndex += 1;
        session.step = 'question';
      }
      renderCurrentStep();
    });
  }

  function renderCompleteStep() {
    // Kalau lesson ini sedang di-review (sudah completed sebelumnya), progress
    // dan XP TIDAK ditulis ulang — supaya review tidak menggandakan XP.
    const wasAlreadyCompleted = isLessonCompleted(languageId, unitId, lesson.id);
    const earnedXP = wasAlreadyCompleted ? 0 : completeLesson(languageId, unitId, lesson.id, session.correctCount, lesson.questions.length).earnedXP;

    container.innerHTML = `
      <div class="lesson-session lesson-complete">
        <div class="lesson-complete__icon icon-chip icon-chip--red icon-chip--xl">${icons.trophy}</div>
        <div class="lesson-complete__title">Lesson Selesai!</div>
        <p class="lesson-complete__stats">
          ${session.correctCount}/${lesson.questions.length} benar
          ${wasAlreadyCompleted ? '&middot; (mode review)' : `&middot; +${earnedXP} XP`}
        </p>
        <button class="btn btn-primary lesson-session__cta" data-action="finish">Lanjutkan</button>
      </div>
    `;

    container.querySelector('[data-action="finish"]').addEventListener('click', () => navigateTo('learn'));
  }

  function renderCurrentStep() {
    if (session.step === 'content') return renderContentStep();
    if (session.step === 'question') return renderQuestionStep();
    if (session.step === 'feedback') return renderFeedbackStep();
    if (session.step === 'complete') return renderCompleteStep();
  }

  renderCurrentStep();
}
