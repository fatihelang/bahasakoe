/*
  home.js
  Merender layar Home: kartu "Lanjutkan Belajar", kartu bahasa aktif +
  language selector, ringkasan progress, dan teaser tab Budaya. Home tidak
  menyimpan state sendiri — semua data diambil dari appState.js.
*/

import { UNIT1, getLessonById } from '../data/unit1.js';
import { getState, getUnitProgress, isLessonCompleted, getSelectedLanguage, setSelectedLanguage } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { showLanguageSheet } from '../ui/languageSheet.js';

export function renderHome(container, { navigateTo }) {
  const state = getState();
  const progress = getUnitProgress();
  const language = getSelectedLanguage();
  const nextLesson = getLessonById(state.currentLessonId) || UNIT1.lessons[0];
  const isFirstTime = state.completedLessons.length === 0;
  // Edge case: setelah semua lesson playable selesai (mis. baru selesai Lesson 3),
  // state.currentLessonId tetap menunjuk ke lesson playable terakhir itu sendiri
  // (lihat appState.completeLesson). Di titik ini tombolnya jadi "review", bukan
  // "lanjutkan" — sesuai fitur "completed lesson tetap bisa dibuka untuk review".
  const isReviewingCompleted = !isFirstTime && isLessonCompleted(nextLesson.id);

  // Bahasa Sunda belum punya konten — kartu "Lanjutkan Belajar" diganti jadi
  // ajakan kembali ke Jawa, TANPA menyentuh/menghilangkan progress Jawa yang
  // sudah ada (stats-row di bawah tetap selalu menampilkan progress Jawa).
  const continueCardHtml = language.available
    ? `
      <div class="home-continue-card__eyebrow">${UNIT1.title}</div>
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

  container.innerHTML = `
    <h1 class="home-greeting"><span class="home-greeting__wave">${icons.wave}</span> Halo!</h1>

    <section class="home-continue-card">${continueCardHtml}</section>

    <h2 class="section-title">Bahasa yang kamu pelajari</h2>
    <div class="card home-language-card">
      <span class="home-language-card__icon icon-chip icon-chip--red icon-chip--md">${icons.graduate}</span>
      <span class="home-language-card__text">
        <span class="home-language-card__name">${language.name}</span>
        <span class="home-language-card__unit">${language.available ? UNIT1.title : language.description}</span>
      </span>
      <button class="home-language-card__switch" data-action="switch-language">Ganti bahasa</button>
    </div>

    <h2 class="section-title">Progress</h2>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card__value">${progress.completed}/${progress.total}</div>
        <div class="stat-card__label">Unit 1 selesai</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${(progress.completed / progress.total) * 100}%"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value"><span class="flame-pulse">${icons.flame}</span> ${state.streak} hari</div>
        <div class="stat-card__label">Streak belajar</div>
      </div>
    </div>

    <h2 class="section-title">Jelajahi</h2>
    <button class="home-culture-card" data-action="go-culture" style="width:100%; text-align:left;">
      <span class="home-culture-card__icon icon-chip icon-chip--gold icon-chip--md">${icons.mask}</span>
      <span>
        <div class="home-culture-card__title">Budaya Jawa</div>
        <div class="home-culture-card__subtitle">Kenali tradisi & unggah-ungguh</div>
      </span>
    </button>
  `;

  const continueBtn = container.querySelector('[data-action="continue-learning"]');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (nextLesson.playable) {
        navigateTo('lesson', { lessonId: nextLesson.id });
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
