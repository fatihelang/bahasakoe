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

const screens = {
  home: renderHome,
  learn: renderLearningPath,
  culture: renderCulture,
  profile: renderProfile,
};

export function createRouter(appEl, navEl) {
  function navigateTo(screenName) {
    const renderFn = screens[screenName];
    if (!renderFn) {
      console.error(`Layar "${screenName}" tidak ditemukan.`);
      return;
    }

    renderFn(appEl, { navigateTo });

    navEl.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.screen === screenName);
    });

    appEl.scrollTo({ top: 0 });
  }

  navEl.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  return { navigateTo };
}
