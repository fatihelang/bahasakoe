/*
  router.js
  "Router" sederhana: cukup ganti isi #app sesuai nama layar yang aktif,
  dan menandai tombol nav yang sesuai sebagai aktif.
  Tidak pakai URL/hash routing supaya tetap sederhana untuk prototype.
*/

import { renderHome } from './screens/home.js';
import { renderLearningPath } from './screens/learningPath.js';
import { renderCulture } from './screens/culture.js';
import { renderProfile } from './screens/profile.js';
import { renderLesson } from './screens/lesson.js';

const screens = {
  home: renderHome,
  learn: renderLearningPath,
  culture: renderCulture,
  profile: renderProfile,
  lesson: renderLesson,
};

// Layar yang tampil di bottom nav. "lesson" adalah focused session,
// jadi sengaja tidak masuk daftar ini — nav disembunyikan selama sesi berlangsung.
const NAV_SCREENS = ['home', 'learn', 'culture', 'profile'];

export function createRouter(appEl, navEl) {
  function navigateTo(screenName, params) {
    const renderFn = screens[screenName];
    if (!renderFn) {
      console.error(`Layar "${screenName}" tidak ditemukan.`);
      return;
    }

    renderFn(appEl, { navigateTo }, params);

    const isNavScreen = NAV_SCREENS.includes(screenName);
    navEl.classList.toggle('is-hidden', !isNavScreen);
    document.body.classList.toggle('is-focused-session', !isNavScreen);

    if (isNavScreen) {
      navEl.querySelectorAll('.nav-item').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.screen === screenName);
      });
    }

    appEl.scrollTo({ top: 0 });
  }

  navEl.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  return { navigateTo };
}
