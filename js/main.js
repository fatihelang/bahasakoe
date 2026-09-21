/*
  main.js
  Titik masuk aplikasi. Dijalankan otomatis oleh index.html.
*/

import { initState, hasSeenOnboarding } from './state/appState.js';
import { createRouter } from './router.js';
import { ONBOARDING_MODE } from './screens/onboarding.js';
import { icons } from './ui/icons.js';
import { playTap } from './ui/soundManager.js';

// Satu sistem SFX untuk seluruh app (soundManager.js). Tap SFX global
// dipasang SEKALI di sini untuk semua <button>, kecuali tombol yang sudah
// punya sound semantik sendiri (pilih jawaban, periksa jawaban, dst.)
// supaya satu klik tidak pernah menghasilkan dua suara sekaligus.
const SFX_EXCLUDE_SELECTOR = [
  '.choice',
  '.tile',
  '[data-action="check-answer"]',
  '[data-action="toggle-sound"]', // sudah memutar playSelect() sendiri saat dinyalakan (lihat profile.js)
].join(', ');

function bindGlobalTapSfx() {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn || btn.disabled) return;
    if (btn.closest(SFX_EXCLUDE_SELECTOR)) return;
    playTap();
  });
}

// UX REVISION 0: tab "Budaya" dihapus dari bottom nav. Budaya bukan lagi
// destination/tab terpisah -- sekarang jadi bagian dari lesson (Culture
// Moment, lihat js/screens/lesson.js) yang muncul saat memang relevan
// dengan materi yang sedang dipelajari, bukan ruang eksplorasi sendiri.
//
// Markup mengikuti komponen Bottom Navigation di brand guide. Elemen yang
// sama tampil sebagai bottom bar di mobile dan sidebar di layar >= 768px
// (lihat components.css), jadi tidak ada dua struktur nav yang berbeda.
const NAV_ITEMS = [
  { screen: 'home', label: 'Home', icon: icons.home },
  { screen: 'learn', label: 'Belajar', icon: icons.book },
  { screen: 'profile', label: 'Profil', icon: icons.profile },
];

function renderBottomNav(navEl) {
  navEl.innerHTML = `
    <div class="bottom-nav__brand" aria-hidden="true">BahasaKoe</div>
    ${NAV_ITEMS.map(
      ({ screen, label, icon }) => `
      <button class="bottom-nav__item" data-screen="${screen}">
        <span class="bottom-nav__icon-wrap">${icon}</span>
        <span class="bottom-nav__label">${label}</span>
      </button>`
    ).join('')}
  `;
}

function main() {
  initState(); // pastikan LocalStorage sudah punya state default + streak ter-update

  const appEl = document.getElementById('app');
  const navEl = document.getElementById('bottom-nav');

  renderBottomNav(navEl);
  bindGlobalTapSfx();
  const router = createRouter(appEl, navEl);
  // Onboarding dibuka dulu sebelum Home. Mode 'always' (bawaan) menampilkannya
  // di setiap pembukaan aplikasi, juga untuk pemain yang sudah pernah
  // berkunjung; mode 'once' hanya untuk yang belum pernah melihatnya.
  // Lihat ONBOARDING_MODE di js/screens/onboarding.js.
  const showOnboarding = ONBOARDING_MODE === 'always' || !hasSeenOnboarding();
  router.navigateTo(showOnboarding ? 'onboarding' : 'home');
}

document.addEventListener('DOMContentLoaded', main);
