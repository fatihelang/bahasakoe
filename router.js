/*
  router.js
  "Router" sederhana: cukup ganti isi #app sesuai nama layar yang aktif,
  dan menandai tombol nav yang sesuai sebagai aktif.
  Tidak pakai URL/hash routing supaya tetap sederhana untuk prototype.
*/

import { renderHome } from './screens/home.js';
import { renderLearningPath } from './screens/learningPath.js';
import { renderUnitDetail } from './screens/unitDetail.js';
import { renderProfile } from './screens/profile.js';
import { renderLesson } from './screens/lesson.js';
import { renderOnboarding } from './screens/onboarding.js';
import { renderReview } from './screens/review.js';
import { renderBadges } from './screens/badges.js';

// Budaya bukan destination/tab: ia muncul sebagai Culture Moment di dalam
// lesson (lihat screens/lesson.js), jadi tidak ada layar "culture" di sini.
const screens = {
  home: renderHome,
  learn: renderLearningPath,
  unitDetail: renderUnitDetail,
  review: renderReview,
  badges: renderBadges,
  profile: renderProfile,
  lesson: renderLesson,
  onboarding: renderOnboarding,
};

// Layar yang tampil di bottom nav. "lesson" adalah focused session,
// jadi sengaja tidak masuk daftar ini — nav disembunyikan selama sesi berlangsung.
// "onboarding" juga focused session (tutorial pertama kali / replay dari
// Profil) -- nav disembunyikan dengan alasan yang sama.
// "unitDetail" BUKAN focused session (masih boleh pindah tab kapan saja),
// jadi nav tetap tampil, dan tab "Belajar" tetap ditandai aktif di sana.
const NAV_SCREENS = ['home', 'learn', 'unitDetail', 'review', 'badges', 'profile'];
const TAB_FOR_SCREEN = { unitDetail: 'learn' };

export function createRouter(appEl, navEl) {
  function navigateTo(screenName, params) {
    const renderFn = screens[screenName];
    if (!renderFn) {
      console.error(`Layar "${screenName}" tidak ditemukan.`);
      return;
    }

    renderFn(appEl, { navigateTo }, params);

    // Re-trigger animasi fade tiap kali layar berganti (reflow paksa lewat
    // offsetWidth supaya browser mau mengulang animasi walau class-nya sama).
    appEl.classList.remove('screen-fade');
    void appEl.offsetWidth;
    appEl.classList.add('screen-fade');

    const isNavScreen = NAV_SCREENS.includes(screenName);
    navEl.classList.toggle('is-hidden', !isNavScreen);
    document.body.classList.toggle('is-focused-session', !isNavScreen);

    if (isNavScreen) {
      const activeTab = TAB_FOR_SCREEN[screenName] || screenName;
      navEl.querySelectorAll('.bottom-nav__item').forEach((btn) => {
        const isActive = btn.dataset.screen === activeTab;
        btn.classList.toggle('is-active', isActive);
        if (isActive) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
      });
    }

    window.scrollTo({ top: 0 });
  }

  navEl.querySelectorAll('.bottom-nav__item').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  return { navigateTo };
}
