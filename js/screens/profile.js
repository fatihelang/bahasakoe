/*
  profile.js
  Profil: sederhana, bukan dashboard analitik.
  Prioritas: identitas -> bahasa aktif -> XP & streak -> progress -> achievement,
  ditambah satu pengaturan (suara). Semua data dari appState.js.

  Avatar & nama masih generik karena prototype belum punya akun (sesuai scope).
*/

import { getState, getUnitProgress, getBadgesWithStatus, getSelectedLanguage, getCurrentUnit } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { pageHeader } from '../ui/pageHeader.js';
import { isSoundEnabled, setSoundEnabled, playSelect } from '../ui/soundManager.js';
import { showLanguageSheet } from '../ui/languageSheet.js';
import { animateCount } from '../ui/animateCount.js';

export function renderProfile(container, { navigateTo } = {}) {
  const state = getState();
  const language = getSelectedLanguage();
  const activeUnit = language.available ? getCurrentUnit(language.id) : null;
  const progress = activeUnit ? getUnitProgress(language.id, activeUnit.id) : { completed: 0, total: 0 };
  const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const soundOn = isSoundEnabled();

  const badgesHtml = getBadgesWithStatus()
    .map(
      (badge) => `
      <li class="card card--static badge-card ${badge.earned ? 'is-unlocked' : 'is-locked'}">
        <span class="badge-icon" aria-hidden="true">${badge.earned ? icons[badge.icon] : icons.lock}</span>
        <span class="badge-card__name">${badge.title}</span>
        <span class="badge-card__desc">${badge.description}</span>
        <span class="sr-only">${badge.earned ? 'Sudah didapat' : 'Belum didapat'}</span>
      </li>`
    )
    .join('');

  container.innerHTML = `
    <div class="screen profile">
      ${pageHeader({ title: 'Profil' })}

      <div class="card card--static profile-identity">
        <span class="icon-bubble icon-bubble--md icon-bubble--round" aria-hidden="true">${icons.graduate}</span>
        <div class="card-body">
          <p class="profile-identity__name">Sahabat Basa</p>
          <p class="card-text">${language.available ? `Sedang belajar ${language.name}` : 'Bahasa aktif: Bahasa Jawa'}</p>
        </div>
        <button class="btn btn-secondary btn-sm" data-action="switch-language">Ganti</button>
      </div>

      <div class="stat-grid">
        <div class="card card--static stat-card">
          <span class="icon-bubble icon-bubble--culture" aria-hidden="true">${icons.zap}</span>
          <span class="card-body"><span class="stat-card__value" id="stat-xp">${state.xp}</span><span class="stat-card__label">Total XP</span></span>
        </div>
        <div class="card card--static stat-card">
          <span class="icon-bubble icon-bubble--culture" aria-hidden="true">${icons.flame}</span>
          <span class="card-body"><span class="stat-card__value">${state.streak} hari</span><span class="stat-card__label">Streak belajar</span></span>
        </div>
      </div>

      <div class="card card--static">
        <span class="card-title">${activeUnit ? `Unit ${activeUnit.order}: ${activeUnit.title}` : `${language.name} (segera hadir)`}</span>
        <span class="card-progress-track" role="progressbar" aria-label="Progress unit" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.completed}">
          <span class="card-progress-fill" style="display:block;width:${percent}%"></span>
        </span>
        <span class="card-progress-label">${progress.completed} dari ${progress.total} lesson selesai</span>
      </div>

      <div class="stack stack--section">
        <h2 class="section-title">Achievement</h2>
        <ul class="badge-grid">${badgesHtml}</ul>
      </div>

      <div class="stack stack--section">
        <h2 class="section-title">Pengaturan</h2>
        <button class="card card-clickable setting-row" data-action="toggle-sound" aria-pressed="${soundOn}">
          <span class="icon-bubble" aria-hidden="true">${soundOn ? icons.soundOn : icons.soundOff}</span>
          <span class="card-body"><span class="card-title">Suara</span><span class="card-text">Efek suara saat belajar</span></span>
          <span class="setting-row__state">${soundOn ? 'Aktif' : 'Mati'}</span>
        </button>
        <button class="card card-clickable setting-row" data-action="view-tutorial">
          <span class="icon-bubble" aria-hidden="true">${icons.bulb}</span>
          <span class="card-body"><span class="card-title">Lihat tutorial lagi</span><span class="card-text">Ulangi pengenalan singkat cara belajar di BahasaKoe</span></span>
          <span class="setting-row__chevron" aria-hidden="true">${icons.chevronRight}</span>
        </button>
      </div>
    </div>
  `;

  const xpEl = container.querySelector('#stat-xp');
  if (xpEl) animateCount(xpEl, state.xp, { duration: 600 });

  container.querySelector('[data-action="switch-language"]').addEventListener('click', () => {
    showLanguageSheet({ navigateTo });
  });

  container.querySelector('[data-action="toggle-sound"]').addEventListener('click', () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    if (next) playSelect(); // konfirmasi kecil begitu suara dinyalakan
    renderProfile(container, { navigateTo });
    container.querySelector('[data-action="toggle-sound"]').focus();
  });

  container.querySelector('[data-action="view-tutorial"]').addEventListener('click', () => {
    navigateTo('onboarding', { replay: true });
  });
}
