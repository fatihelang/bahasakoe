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
import { showConfirmDialog } from '../ui/confirmDialog.js';
import { icons } from '../ui/icons.js';
import { playSelect, playCorrect, playWrong, playComplete } from '../ui/soundManager.js';

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

// Estimasi kasar lama pengerjaan -- bukan pengukuran presisi, cuma gambaran
// buat Lesson Intro (~20 detik per kata baru + ~30 detik per pertanyaan).
function estimateMinutes(lesson) {
  const totalSeconds = lesson.learningContent.length * 20 + lesson.questions.length * 30;
  return Math.max(1, Math.round(totalSeconds / 60));
}

export function renderLesson(container, { navigateTo }, params = {}) {
  const { languageId, unitId, lessonId } = params;
  const lesson = languageId && unitId ? getLesson(languageId, unitId, lessonId) : null;

  if (!lesson || !lesson.playable) {
    // Jaga-jaga kalau renderLesson dipanggil dengan context yang tidak valid/belum playable.
    navigateTo('unitDetail', { languageId, unitId });
    return;
  }

  const session = {
    step: 'intro', // 'intro' | 'content' | 'cultureMoment' | 'question' | 'feedback' | 'complete'
    contentIndex: 0,
    contentRevealed: false,
    questionIndex: 0,
    // frontier = index soal PALING JAUH yang sudah pernah jadi soal "aktif"
    // (belum tentu sudah dijawab). Back/Forward TIDAK PERNAH menggerakkan
    // frontier -- itu murni penanda "batas terjauh yang boleh di-Forward".
    // Dipakai supaya Forward tidak pernah melompati soal yang belum pernah
    // dijawab (lihat renderQuestionStep + TEST H di brief).
    frontier: 0,
    // answers[i] = null selama soal ke-i belum pernah disubmit, atau berisi
    // record spesifik-tipe { type, correct, ...jawaban } sekali disubmit.
    // Back/Forward membaca array ini untuk menampilkan ulang state soal lama
    // TANPA pernah memanggil submitAnswer() lagi -- itulah yang mencegah
    // double count XP/score (lihat getCorrectCount() di bawah).
    answers: new Array(lesson.questions.length).fill(null),
    lastAnswerCorrect: null,
    arrangeSelection: [], // dipakai khusus tipe 'arrange': urutan index kata yang sudah disentuh
    matchingState: { selectedLeft: null, matchedPairIndices: [] }, // dipakai khusus tipe 'matching'
  };

  // correctCount TIDAK LAGI berupa counter yang di-increment tiap submit --
  // itu rawan dihitung dua kali kalau soal yang sama sempat disubmit ulang.
  // Sumber kebenaran tunggal-nya sekarang session.answers: setiap soal
  // paling banyak py satu record, jadi correctCount SELALU turunan (derived),
  // bukan state yang bisa drift dari jumlah submit yang sebenarnya terjadi.
  function getCorrectCount() {
    return session.answers.filter((a) => a && a.correct).length;
  }

  function getAnsweredCount() {
    return session.answers.filter(Boolean).length;
  }

  // `nav`, kalau diisi, menambahkan tombol Back/Forward antar-soal + counter
  // "x / total" di bawah progress bar. HANYA dipakai renderQuestionStep --
  // step lain (intro/content/cultureMoment/feedback/complete) tetap pakai
  // header polos seperti sebelumnya, supaya perubahan ini tidak menyentuh
  // bagian lesson yang di luar scope Phase 1 (navigasi ANTAR soal saja).
  function sessionHeader(progressPercent, nav = null) {
    return `
      <div class="lesson-session__header">
        <button class="lesson-session__exit" data-action="exit" aria-label="Keluar dari lesson">${icons.close}</button>
        ${
          nav
            ? `<button class="lesson-session__nav-btn" data-action="question-back" aria-label="Soal sebelumnya" ${nav.canGoBack ? '' : 'disabled'}>${icons.chevronLeft}</button>`
            : ''
        }
        <div class="progress-track lesson-session__progress">
          <div class="progress-fill" style="width:${progressPercent}%"></div>
        </div>
        ${
          nav
            ? `<button class="lesson-session__nav-btn" data-action="question-forward" aria-label="Soal berikutnya" ${nav.canGoForward ? '' : 'disabled'}>${icons.chevronRight}</button>`
            : ''
        }
      </div>
      ${nav ? `<div class="lesson-session__question-counter">${nav.questionIndex + 1} / ${nav.totalQuestions}</div>` : ''}
    `;
  }

  // BUG FIX (audit STEP 6): flashThenSubmit() menunda submitAnswer() 700ms
  // (lihat ANSWER_FLASH_DELAY_MS). Kalau user tap tombol keluar (exit) di
  // dalam jendela 700ms itu -- sepenuhnya mungkin, tombolnya masih ada &
  // aktif -- timeout tetap jalan dan menimpa layar yang sudah dinavigasikan
  // user dengan Feedback step yang basi begitu 700ms lewat. sessionActive
  // dipakai untuk membatalkan efek lanjutan setelah user keluar.
  let sessionActive = true;

  function goToUnitDetail() {
    sessionActive = false;
    navigateTo('unitDetail', { languageId, unitId });
  }

  // Konfirmasi keluar HANYA relevan kalau ada progress lesson yang bisa
  // hilang (step content/question/feedback). Di step intro belum ada
  // progress apa pun, jadi keluar langsung tanpa dialog -- "jangan bikin
  // confirmation untuk tindakan yang tidak berisiko".
  function bindExit() {
    const exitBtn = container.querySelector('[data-action="exit"]');
    if (!exitBtn) return;
    exitBtn.addEventListener('click', () => {
      if (session.step === 'intro') {
        goToUnitDetail();
        return;
      }
      showConfirmDialog({
        title: 'Keluar dari lesson?',
        message: 'Progress lesson ini belum selesai.',
        safeLabel: 'Tetap Belajar',
        riskyLabel: 'Keluar',
        onRisky: goToUnitDetail,
      });
    });
  }

  function renderIntroStep() {
    container.innerHTML = `
      <div class="lesson-session lesson-intro">
        ${sessionHeader(0)}
        <div class="lesson-intro__title">${lesson.title}</div>
        <p class="lesson-intro__objective">${lesson.objective}</p>
        <div class="lesson-intro__meta">
          <span class="lesson-intro__meta-item">${icons.book} ${lesson.learningContent.length} kata baru</span>
          <span class="lesson-intro__meta-item">${icons.check} ${lesson.questions.length} pertanyaan</span>
          <span class="lesson-intro__meta-item">${icons.zap} ± ${estimateMinutes(lesson)} menit</span>
        </div>
        <button class="btn btn-primary lesson-session__cta" data-action="start-lesson">Mulai Lesson</button>
      </div>
    `;

    bindExit();
    container.querySelector('[data-action="start-lesson"]').addEventListener('click', () => {
      session.step = 'content';
      renderCurrentStep();
    });
  }

  function renderContentStep() {
    const totalWords = lesson.learningContent.length;
    const item = lesson.learningContent[session.contentIndex];
    const isLastWord = session.contentIndex >= totalWords - 1;
    // Content dianggap "separuh pertama" progress sesi, question "separuh kedua" —
    // supaya progress bar terasa jalan terus dari awal sampai lesson selesai.
    const progressPercent = (session.contentIndex / totalWords) * 50;

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(progressPercent)}
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
        // Culture Moment (kalau lesson ini punya data cultureMoment) muncul
        // SEKALI di antara Learning Content dan Question -- bukan di setiap
        // soal. Lihat renderCultureMomentStep() + STEP G di lesson data.
        session.step = lesson.cultureMoment ? 'cultureMoment' : 'question';
      } else {
        session.contentIndex += 1;
        session.contentRevealed = false;
      }
      renderCurrentStep();
    });
  }

  // Culture Moment: satu layar singkat di antara Learning Content dan
  // Question, HANYA muncul kalau lesson.cultureMoment ada di data (lihat
  // js/data/jawa/unit2.js) -- data-driven, bukan daftar hardcode di sini.
  // Prinsip Language -> Context -> Culture: kata/kalimatnya sudah dipelajari
  // di Content, konteks pemakaiannya ada di Question/Feedback, dan di sinilah
  // gambaran budaya yang lebih luas ditampilkan, singkat saja.
  function renderCultureMomentStep() {
    const moment = lesson.cultureMoment;

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(50)}
        <div class="culture-moment">
          <div class="culture-moment__icon icon-chip icon-chip--accent icon-chip--lg icon-chip--pop">${icons.bulb}</div>
          <div class="culture-moment__title">${moment.title}</div>
          <p class="culture-moment__body">${moment.body}</p>
          <button class="btn btn-primary lesson-session__cta" data-action="continue-culture-moment">Lanjut Belajar</button>
        </div>
      </div>
    `;

    bindExit();
    container.querySelector('[data-action="continue-culture-moment"]').addEventListener('click', () => {
      session.step = 'question';
      renderCurrentStep();
    });
  }

  // `record` menyimpan detail spesifik-tipe (selectedIndex/value/order/dst)
  // supaya kalau user Back ke soal ini nanti, tampilannya bisa direkonstruksi
  // persis seperti saat pertama dijawab -- BUKAN cuma benar/salah, tapi juga
  // PILIHAN yang tadi dibuat (lihat brief bagian 3: "Simpan minimal: selected
  // answer, submitted status, correct/incorrect status").
  function submitAnswer(isCorrect, record = {}) {
    session.lastAnswerCorrect = isCorrect;
    session.answers[session.questionIndex] = { ...record, correct: isCorrect };
    session.step = 'feedback';
    renderCurrentStep();
  }

  // Highlight sekejap di elemen yang dijawab (hijau = benar, soft red = kurang
  // tepat — bagian dari sistem warna merah-putih, bukan warna semantic
  // ketiga) sebelum pindah ke Feedback, supaya jawaban terasa "direspons"
  // langsung, bukan langsung lompat layar.
  const ANSWER_FLASH_DELAY_MS = 700;

  function flashThenSubmit(el, isCorrect, record) {
    el.classList.add(isCorrect ? 'is-correct-flash' : 'is-wrong-flash');
    el.classList.add(isCorrect ? 'is-correct-pop' : 'is-wrong-shake');
    if (isCorrect) playCorrect(); else playWrong();
    setTimeout(() => {
      if (!sessionActive) return; // user sudah keluar dari lesson ini sebelum timer selesai
      submitAnswer(isCorrect, record);
    }, ANSWER_FLASH_DELAY_MS);
  }

  // Multiple choice TIDAK LAGI langsung menentukan benar/salah saat opsi
  // diklik. Klik cuma menandai selectedIndex (bisa diganti kapan saja);
  // baru saat tombol "Periksa Jawaban" ditekan, correctIndex dicek.
  function renderMultipleChoiceBody(bodyEl, question, savedAnswer) {
    // Soal yang sudah pernah disubmit (dilihat lagi lewat Back/Forward)
    // ditampilkan APA ADANYA seperti hasil terakhir -- read-only, tanpa
    // tombol "Periksa Jawaban" -- bukan soal segar yang bisa dijawab ulang.
    if (savedAnswer) {
      const optionsHtml = question.options
        .map((opt, i) => {
          const isPicked = i === savedAnswer.selectedIndex;
          const flashClass = isPicked ? (savedAnswer.correct ? 'is-correct-flash' : 'is-wrong-flash') : '';
          return `<button class="question-option ${isPicked ? 'is-selected' : ''} ${flashClass}" data-index="${i}" disabled>${opt}</button>`;
        })
        .join('');
      bodyEl.innerHTML = `<div class="question-options">${optionsHtml}</div>`;
      return;
    }

    const optionsHtml = question.options
      .map((opt, i) => `<button class="question-option" data-index="${i}">${opt}</button>`)
      .join('');

    bodyEl.innerHTML = `
      <div class="question-options">${optionsHtml}</div>
      <button class="btn btn-primary question-check-btn" data-action="check-answer" disabled>Periksa Jawaban</button>
    `;

    const optionButtons = bodyEl.querySelectorAll('.question-option');
    const checkBtn = bodyEl.querySelector('[data-action="check-answer"]');
    let selectedIndex = null;

    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedIndex = Number(btn.dataset.index);
        optionButtons.forEach((optionBtn) => {
          optionBtn.classList.toggle('is-selected', Number(optionBtn.dataset.index) === selectedIndex);
        });
        checkBtn.disabled = false;
        playSelect();
      });
    });

    checkBtn.addEventListener('click', () => {
      if (selectedIndex === null) return;
      const isCorrect = selectedIndex === question.correctIndex;
      const selectedBtn = bodyEl.querySelector(`.question-option[data-index="${selectedIndex}"]`);
      optionButtons.forEach((optionBtn) => { optionBtn.disabled = true; });
      checkBtn.disabled = true;
      flashThenSubmit(selectedBtn, isCorrect, { type: 'multiple-choice', selectedIndex });
    });
  }

  function renderTranslateBody(bodyEl, question, savedAnswer) {
    if (savedAnswer) {
      bodyEl.innerHTML = `
        <div class="translate-body">
          <input type="text" class="question-text-input" disabled />
        </div>
      `;
      const inputEl = bodyEl.querySelector('.question-text-input');
      // Diisi lewat property .value (bukan attribute di template string) supaya
      // jawaban user tidak perlu di-escape manual untuk karakter kutip/HTML.
      inputEl.value = savedAnswer.value;
      inputEl.classList.add(savedAnswer.correct ? 'is-correct-flash' : 'is-wrong-flash');
      return;
    }

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
        <button class="btn btn-primary question-submit" data-action="submit-translate" disabled>Periksa Jawaban</button>
      </div>
    `;

    const inputEl = bodyEl.querySelector('.question-text-input');
    const submitBtn = bodyEl.querySelector('[data-action="submit-translate"]');
    inputEl.focus();

    function handleSubmit() {
      if (normalizeAnswer(inputEl.value).length === 0) return;
      const userAnswer = normalizeAnswer(inputEl.value);
      const isCorrect = question.correctAnswers.some((ans) => normalizeAnswer(ans) === userAnswer);
      const rawValue = inputEl.value;
      inputEl.disabled = true;
      submitBtn.disabled = true;
      flashThenSubmit(inputEl, isCorrect, { type: 'translate', value: rawValue });
    }

    inputEl.addEventListener('input', () => {
      submitBtn.disabled = normalizeAnswer(inputEl.value).length === 0;
    });
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
    submitBtn.addEventListener('click', handleSubmit);
  }

  function renderArrangeBody(bodyEl, question, savedAnswer) {
    if (savedAnswer) {
      const flashClass = savedAnswer.correct ? 'is-correct-flash' : 'is-wrong-flash';
      const answerHtml = savedAnswer.order
        .map((wordIndex) => `<button class="arrange-chip is-selected ${flashClass}" disabled>${question.words[wordIndex]}</button>`)
        .join('');
      bodyEl.innerHTML = `<div class="arrange-answer-row">${answerHtml}</div>`;
      return;
    }

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
        <button class="btn btn-primary question-submit" data-action="submit-arrange" ${isComplete ? '' : 'disabled'}>Periksa Jawaban</button>
      `;

      bodyEl.querySelectorAll('.arrange-answer-row .arrange-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const wordIndex = Number(chip.dataset.wordIndex);
          session.arrangeSelection = session.arrangeSelection.filter((i) => i !== wordIndex);
          playSelect();
          draw();
        });
      });

      bodyEl.querySelectorAll('.arrange-word-bank .arrange-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const wordIndex = Number(chip.dataset.wordIndex);
          session.arrangeSelection.push(wordIndex);
          playSelect();
          draw();
        });
      });

      const submitBtn = bodyEl.querySelector('[data-action="submit-arrange"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          const isCorrect = session.arrangeSelection.every((wordIndex, position) => wordIndex === position);
          const answerRow = bodyEl.querySelector('.arrange-answer-row');
          const order = [...session.arrangeSelection];
          submitBtn.disabled = true;
          bodyEl.querySelectorAll('.arrange-chip').forEach((chip) => { chip.disabled = true; });
          flashThenSubmit(answerRow, isCorrect, { type: 'arrange', order });
        });
      }
    }

    draw();
  }

  function renderMatchingBody(bodyEl, question, savedAnswer) {
    // Matching tidak punya status "salah final" (lihat komentar di header
    // file), jadi savedAnswer.correct di sini selalu true -- yang direkam
    // ulang cukup tampilan "semua sudah cocok".
    if (savedAnswer) {
      const chipHtml = (label) => `<button class="matching-chip is-matched" disabled>${label}</button>`;
      const leftHtml = question.pairs.map((pair) => chipHtml(pair.native)).join('');
      const rightHtml = question.pairs.map((pair) => chipHtml(pair.arti)).join('');
      bodyEl.innerHTML = `
        <div class="matching-columns">
          <div class="matching-column">${leftHtml}</div>
          <div class="matching-column">${rightHtml}</div>
        </div>
      `;
      return;
    }

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
          playSelect();
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
              playCorrect();
              submitAnswer(true, { type: 'matching' });
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

  // Sama seperti multiple choice: pilih Benar/Salah dulu (bisa diganti),
  // baru "Periksa Jawaban" yang menentukan benar/salah.
  function renderTrueFalseBody(bodyEl, question, savedAnswer) {
    if (savedAnswer) {
      const options = [
        { value: true, label: 'Benar' },
        { value: false, label: 'Salah' },
      ];
      const optionsHtml = options
        .map(({ value, label }) => {
          const isPicked = value === savedAnswer.selectedValue;
          const flashClass = isPicked ? (savedAnswer.correct ? 'is-correct-flash' : 'is-wrong-flash') : '';
          return `<button class="btn btn-secondary true-false-option ${isPicked ? 'is-selected' : ''} ${flashClass}" data-value="${value}" disabled>${label}</button>`;
        })
        .join('');
      bodyEl.innerHTML = `<div class="true-false-options">${optionsHtml}</div>`;
      return;
    }

    bodyEl.innerHTML = `
      <div class="true-false-options">
        <button class="btn btn-secondary true-false-option" data-value="true">Benar</button>
        <button class="btn btn-secondary true-false-option" data-value="false">Salah</button>
      </div>
      <button class="btn btn-primary question-check-btn" data-action="check-answer" disabled>Periksa Jawaban</button>
    `;

    const optionButtons = bodyEl.querySelectorAll('.true-false-option');
    const checkBtn = bodyEl.querySelector('[data-action="check-answer"]');
    let selectedValue = null;

    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedValue = btn.dataset.value === 'true';
        optionButtons.forEach((optionBtn) => {
          optionBtn.classList.toggle('is-selected', optionBtn.dataset.value === btn.dataset.value);
        });
        checkBtn.disabled = false;
        playSelect();
      });
    });

    checkBtn.addEventListener('click', () => {
      if (selectedValue === null) return;
      const isCorrect = selectedValue === question.correctAnswer;
      const selectedBtn = bodyEl.querySelector(`.true-false-option[data-value="${selectedValue}"]`);
      optionButtons.forEach((optionBtn) => { optionBtn.disabled = true; });
      checkBtn.disabled = true;
      flashThenSubmit(selectedBtn, isCorrect, { type: 'true-false', selectedValue });
    });
  }

  // Back/Forward TIDAK PERNAH menggerakkan session.frontier -- itu murni
  // navigasi tampilan. Forward hanya boleh maju sampai frontier (soal
  // paling jauh yang pernah jadi soal aktif); tidak mungkin melompati soal
  // yang belum pernah dijawab (TEST H).
  function bindQuestionNav() {
    const backBtn = container.querySelector('[data-action="question-back"]');
    const forwardBtn = container.querySelector('[data-action="question-forward"]');

    if (backBtn && !backBtn.disabled) {
      backBtn.addEventListener('click', () => {
        session.questionIndex -= 1;
        session.step = 'question';
        renderCurrentStep();
      });
    }
    if (forwardBtn && !forwardBtn.disabled) {
      forwardBtn.addEventListener('click', () => {
        session.questionIndex += 1;
        session.step = 'question';
        renderCurrentStep();
      });
    }
  }

  function renderQuestionStep() {
    const question = lesson.questions[session.questionIndex];
    const totalQuestions = lesson.questions.length;
    const savedAnswer = session.answers[session.questionIndex];

    // Reset state interaktif transien HANYA kalau soal ini memang belum
    // pernah dijawab -- kalau savedAnswer ada, render*Body akan pakai jalur
    // read-only dan tidak menyentuh arrangeSelection/matchingState sama
    // sekali, jadi resetnya tidak berdampak, tapi tetap dijaga di sini biar
    // soal berikutnya yang benar-benar baru selalu mulai bersih.
    if (!savedAnswer) {
      session.arrangeSelection = [];
      session.matchingState = { selectedLeft: null, matchedPairIndices: [] };
    }

    // Progress bar dihitung dari JUMLAH SOAL YANG SUDAH DIJAWAB (bukan dari
    // posisi tampilan session.questionIndex) -- supaya progress tidak
    // terlihat "mundur" waktu user cuma browsing balik lewat Back, padahal
    // progress sebenarnya tidak berkurang sama sekali.
    const progressPercent = 50 + (getAnsweredCount() / totalQuestions) * 50;

    const nav = {
      questionIndex: session.questionIndex,
      totalQuestions,
      canGoBack: session.questionIndex > 0,
      canGoForward: session.questionIndex < session.frontier,
    };

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(progressPercent, nav)}
        <div class="question-prompt">${question.prompt}</div>
        <div class="question-body" id="question-body"></div>
      </div>
    `;

    bindExit();
    bindQuestionNav();
    const bodyEl = container.querySelector('#question-body');

    if (question.type === 'translate') {
      renderTranslateBody(bodyEl, question, savedAnswer);
    } else if (question.type === 'arrange') {
      renderArrangeBody(bodyEl, question, savedAnswer);
    } else if (question.type === 'matching') {
      renderMatchingBody(bodyEl, question, savedAnswer);
    } else if (question.type === 'true-false') {
      renderTrueFalseBody(bodyEl, question, savedAnswer);
    } else {
      renderMultipleChoiceBody(bodyEl, question, savedAnswer);
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
        // frontier maju bareng soal baru yang benar-benar aktif -- inilah
        // batas Forward (lihat bindQuestionNav/renderQuestionStep di atas).
        session.frontier = Math.max(session.frontier, session.questionIndex);
        session.step = 'question';
      }
      renderCurrentStep();
    });
  }

  function renderCompleteStep() {
    // Kalau lesson ini sedang di-review (sudah completed sebelumnya), progress
    // dan XP TIDAK ditulis ulang — supaya review tidak menggandakan XP.
    const wasAlreadyCompleted = isLessonCompleted(languageId, unitId, lesson.id);
    // getCorrectCount() dihitung dari session.answers, bukan counter yang
    // di-increment tiap submit -- jadi walau soal sempat dijawab, dilihat
    // ulang lewat Back/Forward berkali-kali, lalu completeLesson() dipanggil,
    // hasilnya tetap jumlah soal benar yang SEBENARNYA (masing-masing soal
    // cuma tercatat sekali di array itu). Lihat TEST I di brief.
    const correctCount = getCorrectCount();
    const earnedXP = wasAlreadyCompleted ? 0 : completeLesson(languageId, unitId, lesson.id, correctCount, lesson.questions.length).earnedXP;
    playComplete();

    container.innerHTML = `
      <div class="lesson-session lesson-complete">
        <div class="lesson-complete__icon icon-chip icon-chip--red icon-chip--xl">${icons.trophy}</div>
        <div class="lesson-complete__title">Lesson Selesai!</div>
        <p class="lesson-complete__stats">
          ${correctCount}/${lesson.questions.length} benar
          ${wasAlreadyCompleted ? '&middot; (mode review)' : `&middot; +${earnedXP} XP`}
        </p>
        <button class="btn btn-primary lesson-session__cta" data-action="finish">Lanjutkan</button>
      </div>
    `;

    container.querySelector('[data-action="finish"]').addEventListener('click', goToUnitDetail);
  }

  function renderCurrentStep() {
    if (session.step === 'intro') return renderIntroStep();
    if (session.step === 'content') return renderContentStep();
    if (session.step === 'cultureMoment') return renderCultureMomentStep();
    if (session.step === 'question') return renderQuestionStep();
    if (session.step === 'feedback') return renderFeedbackStep();
    if (session.step === 'complete') return renderCompleteStep();
  }

  renderCurrentStep();
}
