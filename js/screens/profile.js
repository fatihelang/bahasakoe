/*
  profile.js
  Menampilkan ringkasan progress pengguna: XP, streak, progress Unit 1,
  dan badge (earned/locked). Semua data diambil dari appState.js —
  tidak ada penyimpanan lokal di file ini.

  Avatar & nama masih dummy/generik karena prototype belum punya
  login/akun sungguhan (sesuai scope: "tidak perlu settings atau fitur
  akun kompleks").
*/

import { getState, getUnitProgress, getBadgesWithStatus, getSelectedLanguage, getCurrentUnit } from '../state/appState.js';
import { icons } from '../ui/icons.js';

// Setiap badge.icon (key dari data/badges.js) dipetakan ke warna chip yang
// sesuai personanya — dipisah dari data murni supaya badges.js tetap fokus
// pada konten, bukan detail visual.
const BADGE_ICON_COLOR = {
  seedling: 'green',
  flame: 'red',
  trophy: 'red', // sebelumnya 'gold' — trophy adalah reward, bukan konten Budaya,
                 // jadi ikut identitas merah, bukan aksen kuning kunyit
  zap: 'red',
};

export function renderProfile(container) {
  const state = getState();
  const language = getSelectedLanguage();
  // STEP 1.5: kartu progress di sini sekarang mengikuti selectedLanguage +
  // unit yang sedang berjalan (getCurrentUnit) -- TIDAK lagi dipin ke Jawa
  // Unit 1. Badge grid di bawah SENGAJA TIDAK ikut berubah (lihat
  // getBadgesWithStatus di appState.js) -- badge memang didefinisikan
  // seputar perjalanan Jawa Unit 1 secara spesifik.
  const activeUnit = language.available ? getCurrentUnit(language.id) : null;
  const progress = activeUnit ? getUnitProgress(language.id, activeUnit.id) : { completed: 0, total: 0 };
  const progressLabel = activeUnit ? `Unit ${activeUnit.order} — ${activeUnit.title}` : `${language.name} — segera hadir`;
  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const badges = getBadgesWithStatus();
  // Progress yang benar-benar ada cuma untuk Jawa, jadi kalau bahasa yang
  // dipilih belum tersedia (mis. Sunda), wording TIDAK boleh terkesan
  // seolah-olah user sudah belajar bahasa itu — fallback aman ke Jawa.
  const languageSubtitle = language.available
    ? `Sedang belajar ${language.name}`
    : 'Bahasa aktif: Bahasa Jawa';

  const badgesHtml = badges
    .map((badge) => {
      const colorModifier = BADGE_ICON_COLOR[badge.icon] || 'neutral';
      return `
        <div class="badge-card ${badge.earned ? '' : 'is-locked'}">
          ${
            badge.earned
              ? `<div class="badge-card__icon icon-chip icon-chip--${colorModifier} icon-chip--md icon-chip--pop">${icons[badge.icon]}</div>`
              : `<div class="badge-card__lock">${icons.lock}</div>`
          }
          <div class="badge-card__title">${badge.title}</div>
          <div class="badge-card__description">${badge.description}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-header__avatar">${icons.graduate}</div>
      <div class="profile-header__title-row">
        <span class="flag-mark"></span>
        <div class="profile-header__name">Sahabat Basa</div>
      </div>
      <div class="profile-header__subtitle">${languageSubtitle}</div>
    </div>

    <h2 class="section-title">Ringkasan</h2>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card__value">${state.xp} XP</div>
        <div class="stat-card__label">Total XP</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value"><span class="flame-pulse">${icons.flame}</span> ${state.streak} hari</div>
        <div class="stat-card__label">Streak belajar</div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card__value">${progress.completed}/${progress.total}</div>
        <div class="stat-card__label">${progressLabel}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${progressPercent}%"></div>
        </div>
      </div>
    </div>

    <h2 class="section-title">Badge</h2>
    <div class="badge-grid">${badgesHtml}</div>
  `;
}
