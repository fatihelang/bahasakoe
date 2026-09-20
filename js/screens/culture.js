/*
  === UX REVISION 0: FILE INI SUDAH TIDAK DI-ROUTE/DIPAKAI ===
  Tab "Budaya" dihapus dari bottom nav & router.js -- Budaya sekarang jadi
  bagian dari lesson (Culture Moment), bukan destination terpisah. File ini
  SENGAJA TIDAK DIHAPUS (0 importer sejak router.js diubah): berpotensi
  jadi referensi/data source kalau Culture Moment butuh lebih banyak
  variasi konten di masa depan. Keputusan hapus/reuse/migrasi konten ke
  lesson data diserahkan ke Stage 11 (lihat UX Decision Log). Konten di
  bawah TIDAK diubah apa pun.
  ------------------------------------------------------------------------
  culture.js
  Tab Budaya -- exploratory learning, TIDAK wajib jadi bagian lesson flow.

  CULTURE EXPERIENCE OVERHAUL: Budaya bukan lagi "artikel dengan tombol
  kembali" -- tiap topic sekarang jadi Interactive Culture Learning
  Experience mengikuti alur:

    Culture Home (list) -> Topic Intro -> Activity 1..N -> Takeaway -> (balik ke list)

  Tiap Activity adalah unit interaksi reusable (activity.type), dirender
  generik lewat renderActivityBody() di bawah -- screen ini TIDAK PERNAH
  tahu topic mana yang sedang ditampilkan, cuma tahu "activity tipe apa
  yang harus dirender". Skema data lengkap ada di komentar
  js/data/culture/index.js; data konten (kosakata, kalimat) sendiri ada
  di js/data/culture/jawa.js & sunda.js -- tidak ada satu pun string
  budaya/bahasa baru yang dikarang di file screen ini.

  Pola UX pilih-dulu-baru-diperiksa + flash benar/salah + sound sengaja
  DIPAKAI ULANG persis dari lesson player (lihat js/screens/lesson.js):
  class ".question-option"/".question-check-btn" dan data-action
  "check-answer" yang sama, supaya (a) visualnya konsisten dengan
  Question/Feedback lesson, dan (b) otomatis ikut ter-exclude dari SFX
  tap generik di main.js (SFX_EXCLUDE_SELECTOR) tanpa perlu menyentuh
  main.js sama sekali.

  PENTING -- Culture BUKAN Learning Path:
  - Tidak ada XP yang diberikan di sini sama sekali (tidak pernah
    memanggil completeLesson()/appState apa pun yang menyentuh xp).
  - Progress activity (activityIndex, jawaban tiap activity) HANYA
    disimpan di closure lokal seperti sebelumnya (mode list/detail lama)
    -- BUKAN di LocalStorage -- jadi keluar dari topic atau refresh
    otomatis mulai ulang dari Topic Intro. Ini sesuai brief bagian 12:
    "untuk prototype, TIDAK perlu sistem progress kompleks", dan
    memastikan Culture tidak pernah bentrok dengan progress/XP lesson
    utama (appState.js sama sekali tidak diimpor/disentuh di file ini).
*/

import { getCultureTopics, getCultureTopicById } from '../data/culture/index.js';
import { getSelectedLanguage } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { playSelect, playCorrect, playWrong } from '../ui/soundManager.js';

// Delay sebelum flash benar/salah berpindah ke tampilan hasil -- angka
// sama persis dengan ANSWER_FLASH_DELAY_MS di lesson.js, supaya "rasa"
// jawab-soal di Budaya konsisten dengan Lesson (bagian dari satu bahasa
// interaksi yang sama, bukan sistem terpisah).
const ANSWER_FLASH_DELAY_MS = 700;

export function renderCulture(container) {
  const language = getSelectedLanguage();
  const topics = getCultureTopics(language.id);

  // view = "di mana user sekarang". activityRuntime = state INTERAKTIF
  // sementara punya activity yang sedang aktif (jawaban terpilih, kartu
  // mana yang sudah di-tap, dst) -- di-reset total tiap kali masuk/keluar
  // topic supaya topic lain / kunjungan ulang selalu mulai bersih.
  const view = {
    mode: 'list', // 'list' | 'topic'
    topicId: null,
    step: 'intro', // 'intro' | 'activity' | 'takeaway'
    activityIndex: 0,
  };
  let activityRuntime = {};

  // renderGen dipakai persis seperti sessionActive di lesson.js: dibatalkan
  // (dibandingkan) sebelum timeout flashThenSubmit-style benar2 mengubah
  // state, supaya kalau user sempat pindah activity/keluar topic di dalam
  // jendela 700ms, hasil delay lama tidak menimpa layar yang sudah beda.
  let renderGen = 0;

  function currentTopic() {
    return getCultureTopicById(language.id, view.topicId);
  }

  // ---------------------------------------------------------------
  // LIST (Culture Home)
  // ---------------------------------------------------------------
  function renderList() {
    const [featured, ...rest] = topics;

    const featuredHtml = featured
      ? `
        <button class="culture-featured" data-topic-id="${featured.id}">
          <span class="culture-featured__icon icon-chip icon-chip--accent icon-chip--lg">${icons[featured.icon]}</span>
          <span class="culture-featured__text">
            <span class="culture-featured__eyebrow">Topik pilihan</span>
            <span class="culture-featured__title">${featured.title}</span>
            <span class="culture-featured__description">${featured.description}</span>
          </span>
          <span class="culture-featured__cta">Coba Sekarang ${icons.chevronRight}</span>
        </button>
      `
      : '';

    const cardsHtml = rest
      .map(
        (topic) => `
          <button class="culture-card" data-topic-id="${topic.id}">
            <span class="culture-card__icon icon-chip icon-chip--accent icon-chip--md">${icons[topic.icon]}</span>
            <span class="culture-card__text">
              <span class="culture-card__title">${topic.title}</span>
              <span class="culture-card__description">${topic.description}</span>
            </span>
          </button>
        `
      )
      .join('');

    container.innerHTML = `
      <div class="culture-header">
        <div class="culture-header__title">Budaya ${language.name.replace('Bahasa ', '')}</div>
        <p class="culture-header__subtitle">Jelajahi konteks di balik bahasa yang kamu pelajari.</p>
      </div>
      ${featuredHtml}
      ${rest.length > 0 ? '<h2 class="section-title culture-list__title">Topik lainnya</h2>' : ''}
      <div class="culture-list">${cardsHtml}</div>
    `;

    container.querySelectorAll('[data-topic-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        view.mode = 'topic';
        view.topicId = btn.dataset.topicId;
        view.step = 'intro';
        view.activityIndex = 0;
        activityRuntime = {};
        renderCurrentView();
      });
    });
  }

  // ---------------------------------------------------------------
  // Shared shell dipakai di 3 step topic (intro/activity/takeaway):
  // header dengan tombol keluar + (khusus step 'activity') dot progress.
  // ---------------------------------------------------------------
  function cultureSessionHeader(progress) {
    return `
      <div class="culture-session__header">
        <button class="culture-session__exit" data-action="culture-exit">${icons.chevronLeft} Budaya</button>
      </div>
      ${
        progress
          ? `
            <div class="culture-session__progress">
              <div class="culture-session__dots">
                ${progress.dots
                  .map((state) => `<span class="culture-session__dot ${state}"></span>`)
                  .join('')}
              </div>
              <span class="culture-session__counter">${progress.current} / ${progress.total}</span>
            </div>
          `
          : ''
      }
    `;
  }

  function bindCultureExit() {
    const btn = container.querySelector('[data-action="culture-exit"]');
    if (!btn) return;
    btn.addEventListener('click', exitToList);
  }

  function exitToList() {
    view.mode = 'list';
    view.step = 'intro';
    view.topicId = null;
    view.activityIndex = 0;
    activityRuntime = {};
    renderCurrentView();
  }

  // ---------------------------------------------------------------
  // TOPIC INTRO
  // ---------------------------------------------------------------
  function renderTopicIntro() {
    const topic = currentTopic();
    if (!topic) {
      exitToList();
      return;
    }

    const activities = topic.activities || [];
    const hasActivities = activities.length > 0;

    // Jaga-jaga: topic yang (belum) punya activities sama sekali cukup
    // ditampilkan paragrafnya di sini (fallback ke "content" lama) --
    // TIDAK dipaksa masuk activity flow kosong. Semua topic di
    // jawa.js/sunda.js saat ini sudah punya >=1 activity, jadi jalur ini
    // murni pengaman struktural, bukan jalur yang aktif dipakai.
    container.innerHTML = `
      <div class="culture-session culture-intro">
        ${cultureSessionHeader(null)}
        <div class="culture-intro__icon icon-chip icon-chip--accent icon-chip--lg">${icons[topic.icon]}</div>
        <h2 class="culture-intro__title">${topic.title}</h2>
        <p class="culture-intro__lead">${topic.description}</p>
        ${
          hasActivities
            ? `
              <div class="lesson-intro__meta culture-intro__meta">
                <span class="lesson-intro__meta-item">${icons.zap} ${activities.length} interaksi</span>
              </div>
            `
            : `<p class="culture-intro__fallback-content">${topic.content}</p>`
        }
        <button class="btn btn-primary culture-activity__cta" data-action="start-topic">${hasActivities ? 'Mulai' : 'Selesai'}</button>
      </div>
    `;

    bindCultureExit();
    container.querySelector('[data-action="start-topic"]').addEventListener('click', () => {
      if (!hasActivities) {
        exitToList();
        return;
      }
      view.step = 'activity';
      view.activityIndex = 0;
      activityRuntime = {};
      renderCurrentView();
    });
  }

  // ---------------------------------------------------------------
  // ACTIVITY STEP -- dispatcher generik berdasar activity.type
  // ---------------------------------------------------------------
  function getActivityRuntime(index) {
    if (!activityRuntime[index]) activityRuntime[index] = {};
    return activityRuntime[index];
  }

  function goToNextActivity() {
    const topic = currentTopic();
    const total = (topic.activities || []).length;
    if (view.activityIndex >= total - 1) {
      view.step = 'takeaway';
    } else {
      view.activityIndex += 1;
    }
    renderCurrentView();
  }

  function renderActivityStep() {
    const topic = currentTopic();
    const activities = topic.activities || [];
    const total = activities.length;
    const activity = activities[view.activityIndex];
    const rt = getActivityRuntime(view.activityIndex);

    const dots = activities.map((_, i) => {
      if (i < view.activityIndex) return 'is-done';
      if (i === view.activityIndex) return 'is-current';
      return '';
    });

    container.innerHTML = `
      <div class="culture-session">
        ${cultureSessionHeader({ dots, current: view.activityIndex + 1, total })}
        <div class="culture-activity" id="culture-activity-body"></div>
      </div>
    `;

    bindCultureExit();
    const bodyEl = container.querySelector('#culture-activity-body');

    if (activity.type === 'compare') {
      renderCompareActivity(bodyEl, activity, rt);
    } else if (activity.type === 'reveal') {
      renderRevealActivity(bodyEl, activity, rt);
    } else if (activity.type === 'quiz') {
      renderQuizActivity(bodyEl, activity, rt);
    } else {
      // default: 'scenario' (dan 'choice' -- activity tanpa "situation"
      // otomatis tampil sebagai choice sederhana, lihat komentar index.js)
      renderScenarioActivity(bodyEl, activity, rt);
    }
  }

  // ---- Activity: SCENARIO / CHOICE ----
  // Pola sama persis renderMultipleChoiceBody() di lesson.js: pilih dulu
  // (bisa diganti), baru "Periksa" mengunci jawaban -- TIDAK langsung
  // dinilai saat opsi ditekan.
  function renderScenarioActivity(bodyEl, activity, rt) {
    if (rt.answered) {
      renderScenarioResult(bodyEl, activity, rt);
      return;
    }

    bodyEl.innerHTML = `
      ${activity.situation ? `<div class="culture-scenario__situation">${activity.situation}</div>` : ''}
      <div class="question-prompt culture-activity__prompt">${activity.prompt}</div>
      <div class="question-options">
        ${activity.options.map((opt, i) => `<button class="question-option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <button class="btn btn-success question-check-btn" data-action="check-answer" disabled>Periksa</button>
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
      const isCorrect = selectedIndex === activity.correctIndex;
      const selectedBtn = bodyEl.querySelector(`.question-option[data-index="${selectedIndex}"]`);
      optionButtons.forEach((optionBtn) => { optionBtn.disabled = true; });
      checkBtn.disabled = true;
      selectedBtn.classList.add(isCorrect ? 'is-correct-flash' : 'is-wrong-flash');
      selectedBtn.classList.add(isCorrect ? 'is-correct-pop' : 'is-wrong-shake');
      if (isCorrect) playCorrect(); else playWrong();

      const gen = renderGen;
      setTimeout(() => {
        if (gen !== renderGen) return; // user sudah pindah sebelum delay selesai
        rt.answered = true;
        rt.selectedIndex = selectedIndex;
        rt.correct = isCorrect;
        renderCurrentView();
      }, ANSWER_FLASH_DELAY_MS);
    });
  }

  // Feedback (benar/salah + penjelasan) SENGAJA disisipkan tepat di bawah
  // opsi yang dipilih user -- BUKAN selalu di bawah daftar opsi -- supaya
  // hubungan "ini jawabanmu, ini kenapa" tetap jelas walau opsi yang
  // dipilih bukan yang paling bawah (report user: penjelasan kelihatan
  // "nyasar" jauh dari opsi yang dipilih). Dipakai renderScenarioResult()
  // & cabang tersimpan renderQuizActivity() -- dua tempat dengan pola
  // options+feedback yang identik.
  function inlineFeedbackPanelHtml(isCorrect, mainText, contextText) {
    return `
      <div class="feedback-panel ${isCorrect ? 'is-correct' : 'is-gentle-wrong'}">
        <div class="feedback-panel__status">${isCorrect ? `${icons.star} Pas!` : 'Belum pas'}</div>
        <p class="feedback-panel__explanation">${mainText}</p>
        ${
          contextText
            ? `<div class="feedback-panel__context"><span class="feedback-panel__label">Kenapa</span><p>${contextText}</p></div>`
            : ''
        }
      </div>
    `;
  }

  function renderScenarioResult(bodyEl, activity, rt) {
    const isCorrect = rt.correct;
    const mainText = isCorrect && activity.feedback ? activity.feedback : activity.explanation;
    const contextText = isCorrect && activity.feedback && activity.explanation ? activity.explanation : null;
    const feedbackHtml = inlineFeedbackPanelHtml(isCorrect, mainText, contextText);

    const optionsHtml = activity.options
      .map((opt, i) => {
        const isPicked = i === rt.selectedIndex;
        const flashClass = isPicked ? (isCorrect ? 'is-correct-flash' : 'is-wrong-flash') : '';
        const optionHtml = `<button class="question-option ${isPicked ? 'is-selected' : ''} ${flashClass}" disabled>${opt}</button>`;
        // Feedback disisipkan sebagai "baris" tambahan tepat setelah opsi
        // yang dipilih -- .question-options adalah flex column, jadi
        // urutan elemen di DOM = urutan tampil, tidak perlu positioning
        // absolut apa pun.
        return isPicked ? optionHtml + feedbackHtml : optionHtml;
      })
      .join('');

    bodyEl.innerHTML = `
      ${activity.situation ? `<div class="culture-scenario__situation">${activity.situation}</div>` : ''}
      <div class="question-prompt culture-activity__prompt">${activity.prompt}</div>
      <div class="question-options">${optionsHtml}</div>
      <button class="btn btn-primary culture-activity__cta" data-action="activity-next">Lanjut</button>
    `;
    bodyEl.querySelector('[data-action="activity-next"]').addEventListener('click', goToNextActivity);
  }

  // ---- Activity: COMPARE ----
  // Kalau "left"/"right" tidak punya "items" (belum ada kosakata
  // tervalidasi -- lihat catatan sunda.js), fallback ke dua kartu
  // tap-to-reveal sederhana lewat renderRevealActivity() -- TIDAK
  // mengarang item baru supaya layout "penuh".
  function renderCompareActivity(bodyEl, activity, rt) {
    const hasItems = (activity.left.items && activity.left.items.length) || (activity.right.items && activity.right.items.length);

    if (!hasItems) {
      const fallbackActivity = {
        cards: [
          { front: activity.left.label, back: activity.left.description },
          { front: activity.right.label, back: activity.right.description },
        ],
      };
      renderRevealActivity(bodyEl, fallbackActivity, rt);
      return;
    }

    if (!rt.revealedKeys) rt.revealedKeys = [];

    function itemsHtml(side, sideKey) {
      return (side.items || [])
        .map((item, i) => {
          const key = `${sideKey}-${i}`;
          const isRevealed = rt.revealedKeys.includes(key);
          return `
            <button class="culture-compare__item ${isRevealed ? 'is-revealed' : ''}" data-key="${key}">
              <span class="culture-compare__item-native">${item.native}</span>
              ${
                isRevealed
                  ? `<span class="culture-compare__item-arti">${item.arti}</span>`
                  : `<span class="culture-compare__item-hint">Tap</span>`
              }
            </button>
          `;
        })
        .join('');
    }

    bodyEl.innerHTML = `
      <div class="culture-compare">
        <div class="culture-compare__col">
          <div class="culture-compare__label">${activity.left.label}</div>
          <p class="culture-compare__desc">${activity.left.description}</p>
          <div class="culture-compare__items">${itemsHtml(activity.left, 'left')}</div>
        </div>
        <div class="culture-compare__col">
          <div class="culture-compare__label">${activity.right.label}</div>
          <p class="culture-compare__desc">${activity.right.description}</p>
          <div class="culture-compare__items">${itemsHtml(activity.right, 'right')}</div>
        </div>
      </div>
      <button class="btn btn-primary culture-activity__cta" data-action="activity-next" ${rt.revealedKeys.length > 0 ? '' : 'disabled'}>Lanjut</button>
    `;

    bodyEl.querySelectorAll('.culture-compare__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (rt.revealedKeys.includes(key)) return;
        rt.revealedKeys.push(key);
        renderCompareActivity(bodyEl, activity, rt);
      });
    });

    const nextBtn = bodyEl.querySelector('[data-action="activity-next"]');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', goToNextActivity);
    }
  }

  // ---- Activity: REVEAL (tap to reveal) ----
  // "Lanjut" baru aktif setelah SEMUA kartu di-tap -- jumlah kartu selalu
  // kecil (1-4), jadi ini tidak bikin interaction terasa lambat (brief
  // bagian 7), tapi tetap memaksa minimal satu interaksi nyata per kartu.
  function renderRevealActivity(bodyEl, activity, rt) {
    if (!rt.revealed) rt.revealed = new Array(activity.cards.length).fill(false);
    const allRevealed = rt.revealed.every(Boolean);

    bodyEl.innerHTML = `
      <div class="culture-reveal-grid">
        ${activity.cards
          .map((card, i) => {
            const isRevealed = rt.revealed[i];
            return `
              <button class="culture-reveal-card ${isRevealed ? 'is-revealed' : ''}" data-index="${i}" ${isRevealed ? 'disabled' : ''}>
                <span class="culture-reveal-card__front">${card.front}</span>
                ${
                  isRevealed
                    ? `<span class="culture-reveal-card__back">${card.back}</span>`
                    : `<span class="culture-reveal-card__hint">Tap</span>`
                }
              </button>
            `;
          })
          .join('')}
      </div>
      <button class="btn btn-primary culture-activity__cta" data-action="activity-next" ${allRevealed ? '' : 'disabled'}>Lanjut</button>
    `;

    bodyEl.querySelectorAll('.culture-reveal-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index);
        if (rt.revealed[i]) return;
        rt.revealed[i] = true;
        renderRevealActivity(bodyEl, activity, rt);
      });
    });

    const nextBtn = bodyEl.querySelector('[data-action="activity-next"]');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', goToNextActivity);
    }
  }

  // ---- Activity: QUIZ (1-3 pertanyaan ringan, TANPA XP) ----
  function renderQuizActivity(bodyEl, activity, rt) {
    if (rt.qIndex === undefined) {
      rt.qIndex = 0;
      rt.answers = new Array(activity.questions.length).fill(null);
    }

    const totalQ = activity.questions.length;
    const question = activity.questions[rt.qIndex];
    const saved = rt.answers[rt.qIndex];

    if (saved) {
      const optionsHtml = question.options
        .map((opt, i) => {
          const isPicked = i === saved.selectedIndex;
          const flashClass = isPicked ? (saved.correct ? 'is-correct-flash' : 'is-wrong-flash') : '';
          const optionHtml = `<button class="question-option ${isPicked ? 'is-selected' : ''} ${flashClass}" disabled>${opt}</button>`;
          // Sama seperti renderScenarioResult(): feedback disisipkan tepat
          // setelah opsi yang dipilih, bukan selalu di bawah daftar opsi.
          return isPicked && question.feedback ? optionHtml + `<p class="culture-quiz__feedback">${question.feedback}</p>` : optionHtml;
        })
        .join('');

      bodyEl.innerHTML = `
        <div class="culture-quiz__subcounter">Pertanyaan ${rt.qIndex + 1} / ${totalQ}</div>
        <div class="question-prompt culture-activity__prompt">${question.prompt}</div>
        <div class="question-options">${optionsHtml}</div>
        <button class="btn btn-primary culture-activity__cta" data-action="quiz-next">Lanjut</button>
      `;
      bodyEl.querySelector('[data-action="quiz-next"]').addEventListener('click', () => {
        if (rt.qIndex < totalQ - 1) {
          rt.qIndex += 1;
          renderQuizActivity(bodyEl, activity, rt);
        } else {
          goToNextActivity();
        }
      });
      return;
    }

    bodyEl.innerHTML = `
      <div class="culture-quiz__subcounter">Pertanyaan ${rt.qIndex + 1} / ${totalQ}</div>
      <div class="question-prompt culture-activity__prompt">${question.prompt}</div>
      <div class="question-options">
        ${question.options.map((opt, i) => `<button class="question-option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <button class="btn btn-success question-check-btn" data-action="check-answer" disabled>Jawab</button>
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
      selectedBtn.classList.add(isCorrect ? 'is-correct-flash' : 'is-wrong-flash');
      selectedBtn.classList.add(isCorrect ? 'is-correct-pop' : 'is-wrong-shake');
      if (isCorrect) playCorrect(); else playWrong();

      const gen = renderGen;
      setTimeout(() => {
        if (gen !== renderGen) return;
        rt.answers[rt.qIndex] = { selectedIndex, correct: isCorrect };
        renderQuizActivity(bodyEl, activity, rt);
      }, ANSWER_FLASH_DELAY_MS);
    });
  }

  // ---------------------------------------------------------------
  // TAKEAWAY
  // ---------------------------------------------------------------
  function renderTakeaway() {
    const topic = currentTopic();
    const body = topic.takeaway ? topic.takeaway.body : topic.description;

    container.innerHTML = `
      <div class="culture-session culture-takeaway">
        ${cultureSessionHeader(null)}
        <div class="culture-takeaway__icon icon-chip icon-chip--accent icon-chip--lg">${icons.check}</div>
        <div class="culture-takeaway__title">Yang Perlu Diingat</div>
        <p class="culture-takeaway__body">${body}</p>
        <button class="btn btn-primary culture-activity__cta" data-action="finish-topic">Selesai</button>
      </div>
    `;

    bindCultureExit();
    container.querySelector('[data-action="finish-topic"]').addEventListener('click', exitToList);
  }

  // ---------------------------------------------------------------
  function renderCurrentView() {
    renderGen += 1; // batalkan timeout flash activity sebelumnya (lihat komentar renderGen di atas)
    if (view.mode === 'list') return renderList();
    if (view.step === 'activity') return renderActivityStep();
    if (view.step === 'takeaway') return renderTakeaway();
    return renderTopicIntro();
  }

  renderCurrentView();
}
