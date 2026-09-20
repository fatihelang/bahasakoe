/*
  languageSheet.js
  Language Selector (brand guide): daftar bahasa dengan pilihan aktif
  ditandai check + background primary-soft (pola .lang-option). Dipakai
  dari Belajar dan Profil, satu komponen dengan dua pemanggil.

  Tidak menyimpan state sendiri: baca dari data/languages.js, baca/tulis
  lewat state/appState.js. Dibuat & dilepas dari DOM setiap kali dibuka.
*/

import { LANGUAGES } from '../data/languages.js';
import { getSelectedLanguage, setSelectedLanguage } from '../state/appState.js';
import { icons } from './icons.js';
import { openOverlay } from './overlay.js';

export function languageInitial(language) {
  return language.name.replace(/^Bahasa\s+/i, '').charAt(0).toUpperCase();
}

/**
 * @param {{ navigateTo: Function, destination?: string }} options
 *   destination: layar tujuan setelah bahasa dipilih. Default 'learn';
 *   Home mengirim 'home' agar pengguna tetap di Home setelah ganti bahasa.
 */
export function showLanguageSheet({ navigateTo, destination = 'learn' }) {
  const current = getSelectedLanguage();

  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  const { close } = openOverlay(sheet, { label: 'Pilih bahasa' });

  function renderList() {
    const rowsHtml = LANGUAGES.map(
      (lang) => `
      <button class="lang-option ${lang.id === current.id ? 'is-selected' : ''}" data-lang-id="${lang.id}" ${lang.id === current.id ? 'aria-current="true"' : ''}>
        <span class="lang-flag" aria-hidden="true">${languageInitial(lang)}</span>
        <span class="lang-option__text">
          <span>${lang.name}</span>
          <span class="lang-option__desc">${lang.available ? lang.description : 'Segera hadir'}</span>
        </span>
        <span class="check">${icons.check}</span>
      </button>`
    ).join('');

    sheet.innerHTML = `
      <div class="sheet__header">
        <h2 class="sheet__title">Bahasa yang dipelajari</h2>
        <button class="icon-btn" data-action="close" aria-label="Tutup">${icons.close}</button>
      </div>
      <div class="sheet__list">${rowsHtml}</div>
    `;

    sheet.querySelector('[data-action="close"]').addEventListener('click', close);
    sheet.querySelectorAll('.lang-option').forEach((row) => {
      row.addEventListener('click', () => {
        const lang = LANGUAGES.find((l) => l.id === row.dataset.langId);
        if (lang.available) {
          setSelectedLanguage(lang.id);
          close();
          navigateTo(destination);
        } else {
          renderComingSoon(lang);
        }
      });
    });
  }

  function renderComingSoon(lang) {
    sheet.innerHTML = `
      <div class="sheet__header">
        <h2 class="sheet__title">${lang.name}</h2>
        <button class="icon-btn" data-action="close" aria-label="Tutup">${icons.close}</button>
      </div>
      <div class="sheet__body">
        <p>${lang.name} sedang dipersiapkan. Untuk saat ini, kamu bisa mulai belajar Bahasa Jawa.</p>
        <button class="btn btn-primary btn-block" data-action="go-jawa" data-autofocus>Belajar Bahasa Jawa</button>
      </div>
    `;
    sheet.querySelector('[data-action="close"]').addEventListener('click', close);
    sheet.querySelector('[data-action="go-jawa"]').addEventListener('click', () => {
      setSelectedLanguage('jawa');
      close();
      navigateTo(destination);
    });
    sheet.querySelector('[data-autofocus]').focus();
  }

  renderList();
}
