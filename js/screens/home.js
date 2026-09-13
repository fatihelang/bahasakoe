/*
  home.js
  Merender layar Home: kartu "Lanjutkan Belajar", kartu bahasa aktif +
  language selector, ringkasan progress, dan teaser tab Budaya. Home tidak
  menyimpan state sendiri — semua data diambil dari appState.js.

  STEP 1.5: Progress & "Lanjutkan Belajar" TIDAK LAGI dipin ke Bahasa Jawa
  Unit 1 (PINNED_UNIT lama) -- keduanya sekarang mengikuti selectedLanguage
  + getCurrentUnit(). Untuk Jawa saat ini hasilnya tidak berubah secara
  visual (Jawa cuma punya Unit 1, dan progresnya belum selesai semua), tapi
  begitu Unit 2 Jawa dibuat, atau Sunda dapat konten, Home otomatis ikut
  tanpa perlu diubah lagi.
*/

import { getState, getUnitProgress, isLessonCompleted, getCurrentLessonId, getSelectedLanguage, setSelectedLanguage, getCurrentUnit } from '../state/appState.js';
import { getLesson } from '../data/curriculum.js';
import { getCultureTopics } from '../data/culture/index.js';
import { icons } from '../ui/icons.js';
import { showLanguageSheet } from '../ui/languageSheet.js';

export function renderHome(container, { navigateTo }) {
  const state = getState();
  const language = getSelectedLanguage();

  // Unit "sekarang" milik bahasa yang SEDANG DIPILIH user -- dipakai baik
  // untuk kartu "Lanjutkan Belajar" maupun stats-row "Progress" (dulu dua
  // hal ini punya sumber unit yang berbeda: activeUnit vs pinnedUnit --
  // sekarang keduanya satu sumber yang sama).
  const activeUnit = language.available ? getCurrentUnit(language.id) : null;
  const activeUnitProgress = activeUnit ? getUnitProgress(language.id, activeUnit.id) : { completed: 0, total: 0 };
  const nextLesson = activeUnit
    ? getLesson(language.id, activeUnit.id, getCurrentLessonId(language.id, activeUnit.id)) || activeUnit.lessons[0]
    : null;
  const isFirstTime = activeUnit ? activeUnitProgress.completed === 0 : true;
  // Edge case: setelah semua lesson playable selesai (mis. baru selesai Lesson 3),
  // currentLessonId tetap menunjuk ke lesson playable terakhir itu sendiri
  // (lihat appState.completeLesson). Di titik ini tombolnya jadi "review", bukan
  // "lanjutkan" — sesuai fitur "completed lesson tetap bisa dibuka untuk review".
  const isReviewingCompleted =
    !isFirstTime && activeUnit && nextLesson ? isLessonCompleted(language.id, activeUnit.id, nextLesson.id) : false;

  // Bahasa yang belum punya unit sama sekali (mis. Sunda saat ini) — kartu
  // "Lanjutkan Belajar" diganti jadi ajakan kembali ke Jawa, TANPA
  // menyentuh/menghilangkan progress bahasa lain sama sekali.
  const continueCardHtml = language.available && activeUnit
    ? `
      <div class="home-continue-card__eyebrow">Unit ${activeUnit.order} — ${activeUnit.title}</div>
      <div class="home-continue-card__title">
        ${
          isFirstTime
            ? 'Mulai lesson pertamamu'
            : isReviewingCompleted
            ? `Ulas kembali: ${nextLesson.title}`
            : `Lanjutkan: ${nextLesson.title}`
        }
      </div>
      <button class="btn btn-primary" data-action="continue-learning">
        ${isFirstTime ? 'Mulai Belajar' : isReviewingCompleted ? 'Ulas Lagi' : 'Lanjutkan Belajar'}
      </button>
    `
    : `
      <div class="home-continue-card__eyebrow">${language.name}</div>
      <div class="home-continue-card__title">${language.name} segera hadir</div>
      <button class="btn btn-primary" data-action="go-jawa">Belajar Bahasa Jawa</button>
    `;

  const progressLabel = activeUnit ? `Unit ${activeUnit.order} — ${activeUnit.title}` : `${language.name} — segera hadir`;
  const progressPercent = activeUnitProgress.total > 0 ? (activeUnitProgress.completed / activeUnitProgress.total) * 100 : 0;

  // Teaser "Jelajahi" mengikuti bahasa aktif -- pakai getter budaya yang sama
  // dengan tab Budaya (bukan konten khusus Home), ambil topik pertama saja
  // sebagai highlight ringkas.
  const cultureTopics = getCultureTopics(language.id);
  const cultureHighlightSubtitle = cultureTopics[0]
    ? cultureTopics[0].description
    : 'Kenali tradisi & kebiasaan sehari-hari';

  container.innerHTML = `
    <h1 class="home-greeting"><span class="home-greeting__wave">${icons.wave}</span> Halo!</h1>

    <section class="home-continue-card">${continueCardHtml}</section>

    <h2 class="section-title">Progress</h2>
    <div class="home-progress">
      <div class="home-progress__row">
        <span class="home-progress__label">${progressLabel}</span>
        <span class="home-progress__count">${activeUnitProgress.completed}/${activeUnitProgress.total} lesson</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${progressPercent}%"></div>
      </div>
      <div class="home-progress__streak"><span class="flame-pulse">${icons.flame}</span> ${state.streak} hari streak</div>
    </div>

    <h2 class="section-title">Bahasa yang kamu pelajari</h2>
    <div class="card home-language-card">
      <span class="home-language-card__icon icon-chip icon-chip--red icon-chip--md">${icons.graduate}</span>
      <span class="home-language-card__text">
        <span class="home-language-card__name">${language.name}</span>
        <span class="home-language-card__unit">${language.available && activeUnit ? `Unit ${activeUnit.order} — ${activeUnit.title}` : language.description}</span>
      </span>
      <button class="home-language-card__switch" data-action="switch-language">Ganti bahasa</button>
    </div>

    <h2 class="section-title">Jelajahi</h2>
    <button class="home-culture-card" data-action="go-culture" style="width:100%; text-align:left;">
      <span class="home-culture-card__icon icon-chip icon-chip--accent icon-chip--md">${icons.mask}</span>
      <span>
        <div class="home-culture-card__title">Budaya ${language.name.replace('Bahasa ', '')}</div>
        <div class="home-culture-card__subtitle">${cultureHighlightSubtitle}</div>
      </span>
    </button>
  `;

  const continueBtn = container.querySelector('[data-action="continue-learning"]');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (nextLesson.playable) {
        navigateTo('lesson', { languageId: language.id, unitId: activeUnit.id, lessonId: nextLesson.id });
      } else {
        navigateTo('learn');
      }
    });
  }

  const goJawaBtn = container.querySelector('[data-action="go-jawa"]');
  if (goJawaBtn) {
    goJawaBtn.addEventListener('click', () => {
      setSelectedLanguage('jawa');
      navigateTo('learn');
    });
  }

  container.querySelector('[data-action="switch-language"]').addEventListener('click', () => {
    showLanguageSheet({ navigateTo });
  });

  container.querySelector('[data-action="go-culture"]').addEventListener('click', () => {
    navigateTo('culture');
  });
}
