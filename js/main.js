/*
  main.js
  Titik masuk aplikasi. Dijalankan otomatis oleh index.html.
*/

import { initState } from './state/appState.js';
import { createRouter } from './router.js';
import { icons } from './ui/icons.js';
import { playTap } from './ui/soundManager.js';

// Tombol yang SUDAH punya semantic sound sendiri (playSelect/playCorrect/
// playWrong dipanggil langsung dari lesson.js) -- sengaja dikecualikan dari
// tap SFX global di bawah supaya satu klik tidak pernah menghasilkan dua
// SFX sekaligus (lihat brief PHASE 2 bagian 2 & 3). Listener ini didaftarkan
// SEKALI di sini, jadi berlaku otomatis untuk tombol di semua screen
// (Home, Belajar, Unit, Culture, Profile, Language selector, Back/Forward,
// CTA) tanpa perlu menambah playSelect() manual satu-satu di tiap file.
const SFX_EXCLUDE_SELECTOR = [
  '.question-option',
  '.true-false-option',
  '.arrange-chip',
  '.matching-chip',
  '[data-action="check-answer"]',
  '[data-action="submit-translate"]',
  '[data-action="submit-arrange"]',
  '[data-action="toggle-sound"]', // sudah punya playSelect() sendiri saat dinyalakan (lihat profile.js)
].join(', ');

function bindGlobalTapSfx() {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn || btn.disabled) return;
    if (btn.closest(SFX_EXCLUDE_SELECTOR)) return;
    playTap();
  });
}

function renderBottomNav(navEl) {
  navEl.innerHTML = `
    <button class="nav-item" data-screen="home">${icons.home}<span>Home</span></button>
    <button class="nav-item" data-screen="learn">${icons.book}<span>Belajar</span></button>
    <button class="nav-item" data-screen="culture">${icons.culture}<span>Budaya</span></button>
    <button class="nav-item" data-screen="profile">${icons.profile}<span>Profil</span></button>
  `;
}

function main() {
  initState(); // pastikan LocalStorage sudah punya state default + streak ter-update

  const appEl = document.getElementById('app');
  const navEl = document.getElementById('bottom-nav');

  renderBottomNav(navEl);
  bindGlobalTapSfx();
  const router = createRouter(appEl, navEl);
  router.navigateTo('home');
}

document.addEventListener('DOMContentLoaded', main);
