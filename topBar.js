/*
  topBar.js
  Header atas yang PERSISTEN di semua layar utama (Home, Belajar, Budaya,
  Profil) -- tidak ada di versi lama. Menampilkan wordmark kecil BahasaKoe
  + dua "chip" stat (streak & XP) supaya progress user selalu kelihatan di
  mata, bukan cuma di layar Profil/Home saja seperti sebelumnya.

  SENGAJA dipisah dari bottom-nav (nav TETAP di bawah untuk navigasi antar
  tab) -- top bar murni menampilkan status, tidak ada aksi navigasi di sini
  kecuali wordmark yang membawa balik ke Home. Ini yang membedakan struktur
  layar dari versi lama: dulu cuma ada satu bar (bottom-nav) + judul lepas
  per-halaman; sekarang ada dua lapis (top bar status + bottom nav navigasi),
  pola yang lazim di app pembelajaran gamified tapi disusun ulang dengan
  visual "sticker" khas brand ini (bukan salinan tata letak Duolingo).
*/

import { getState } from '../state/appState.js';
import { icons } from './icons.js';

// Layar yang menampilkan top bar -- sama seperti daftar NAV_SCREENS di
// router.js (lesson & sesi budaya focused tidak menampilkan top bar,
// supaya sesi belajar tetap fokus penuh tanpa distraksi stat).
export function renderTopBar(topbarEl, { navigateTo }) {
  const state = getState();

  topbarEl.innerHTML = `
    <button class="app-topbar__brand" data-action="topbar-home" aria-label="Kembali ke Home">
      <span class="flag-mark"></span>
      <span class="app-topbar__wordmark">BahasaKoe</span>
    </button>
    <div class="app-topbar__stats">
      <span class="topbar-chip topbar-chip--streak">
        <span class="flame-pulse">${icons.flame}</span>${state.streak}
      </span>
      <span class="topbar-chip topbar-chip--xp">
        ${icons.gem}${state.xp}
      </span>
    </div>
  `;

  topbarEl.querySelector('[data-action="topbar-home"]').addEventListener('click', () => {
    navigateTo('home');
  });
}
