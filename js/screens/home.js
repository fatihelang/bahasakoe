/*
  home.js
  Merender layar Home: kartu "Lanjutkan Belajar", ringkasan progress, dan
  teaser tab Budaya. Home tidak menyimpan state sendiri — semua data
  diambil dari appState.js.
*/

import { UNIT1, getLessonById } from '../data/unit1.js';
import { getState, getUnitProgress } from '../state/appState.js';

export function renderHome(container, { navigateTo }) {
  const state = getState();
  const progress = getUnitProgress();
  const nextLesson = getLessonById(state.currentLessonId) || UNIT1.lessons[0];
  const isFirstTime = state.completedLessons.length === 0;

  container.innerHTML = `
    <h1 class="home-greeting">Halo! 👋</h1>

    <section class="home-continue-card">
      <div class="home-continue-card__eyebrow">${UNIT1.title}</div>
      <div class="home-continue-card__title">
        ${isFirstTime ? 'Mulai lesson pertamamu' : `Lanjutkan: ${nextLesson.title}`}
      </div>
      <button class="btn btn-primary" data-action="continue-learning">
        ${isFirstTime ? 'Mulai Belajar' : 'Lanjutkan Belajar'}
      </button>
    </section>

    <h2 class="home-section-title">Progress</h2>
    <div class="home-progress-row">
      <div class="home-progress-stat">
        <div class="home-progress-stat__value">${progress.completed}/${progress.total}</div>
        <div class="home-progress-stat__label">Unit 1 selesai</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${(progress.completed / progress.total) * 100}%"></div>
        </div>
      </div>
      <div class="home-progress-stat">
        <div class="home-progress-stat__value">${state.streak} hari</div>
        <div class="home-progress-stat__label">Streak belajar</div>
      </div>
    </div>

    <h2 class="home-section-title">Jelajahi</h2>
    <button class="home-culture-card" data-action="go-culture" style="width:100%; text-align:left;">
      <span class="home-culture-card__icon">🎭</span>
      <span>
        <div class="home-culture-card__title">Budaya Jawa</div>
        <div class="home-culture-card__subtitle">Kenali tradisi & unggah-ungguh</div>
      </span>
    </button>
  `;

  container.querySelector('[data-action="continue-learning"]').addEventListener('click', () => {
    // Lesson player belum dibangun di langkah ini — arahkan ke Learning Path dulu.
    navigateTo('learn');
  });

  container.querySelector('[data-action="go-culture"]').addEventListener('click', () => {
    navigateTo('culture');
  });
}
