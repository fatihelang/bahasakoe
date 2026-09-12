/*
  main.js
  Titik masuk aplikasi. Dijalankan otomatis oleh index.html.
*/

import { initState } from './state/appState.js';
import { createRouter } from './router.js';
import { icons } from './ui/icons.js';

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
  const router = createRouter(appEl, navEl);
  router.navigateTo('home');
}

document.addEventListener('DOMContentLoaded', main);
