/*
  languageSheet.js
  Bottom sheet kecil untuk memilih bahasa. Dipakai dari Home ("Ganti bahasa")
  dan Learning Path (compact selector) — satu komponen, dua pemanggil,
  supaya tidak ada logic language-switching yang terduplikasi/kompleks.

  Tidak menyimpan state sendiri: baca dari data/languages.js, baca/tulis
  lewat state/appState.js. Dibuat & dilepas dari DOM setiap kali dibuka
  (bukan disimpan seperti toast) karena kontennya bisa berganti (list -> pesan
  coming-soon) dan pemakaiannya jarang/tidak berbarengan.
*/

import { LANGUAGES } from '../data/languages.js';
import { getSelectedLanguage, setSelectedLanguage } from '../state/appState.js';
import { icons } from '../ui/icons.js';

export function showLanguageSheet({ navigateTo }) {
  const current = getSelectedLanguage();

  const backdrop = document.createElement('div');
  backdrop.className = 'language-sheet-backdrop';

  const sheet = document.createElement('div');
  sheet.className = 'language-sheet';
  backdrop.appendChild(sheet);
  document.body.appendChild(backdrop);

  function close() {
    backdrop.remove();
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  function goToJawaLearning() {
    setSelectedLanguage('jawa');
    close();
    navigateTo('learn');
  }

  function renderList() {
    const rowsHtml = LANGUAGES.map((lang) => `
      <button class="language-sheet__row ${lang.id === current.id ? 'is-active' : ''}" data-lang-id="${lang.id}">
        <span class="language-sheet__row-icon icon-chip ${lang.available ? 'icon-chip--red' : 'icon-chip--neutral'} icon-chip--sm">${icons.graduate}</span>
        <span class="language-sheet__row-text">
          <span class="language-sheet__row-name">${lang.name}</span>
          <span class="language-sheet__row-status ${lang.available ? 'is-available' : 'is-soon'}">${lang.description}</span>
        </span>
      </button>
    `).join('');

    sheet.innerHTML = `
      <div class="language-sheet__header">
        <span class="language-sheet__title">Bahasa yang dipelajari</span>
        <button class="language-sheet__close" data-action="close" aria-label="Tutup">${icons.close}</button>
      </div>
      <div class="language-sheet__list">${rowsHtml}</div>
    `;

    sheet.querySelector('[data-action="close"]').addEventListener('click', close);

    sheet.querySelectorAll('.language-sheet__row').forEach((row) => {
      row.addEventListener('click', () => {
        const langId = row.dataset.langId;
        const lang = LANGUAGES.find((l) => l.id === langId);
        if (lang.available) {
          setSelectedLanguage(lang.id);
          close();
          navigateTo('learn');
        } else {
          renderComingSoon(lang);
        }
      });
    });
  }

  function renderComingSoon(lang) {
    sheet.innerHTML = `
      <div class="language-sheet__header">
        <span class="language-sheet__title">${lang.name}</span>
        <button class="language-sheet__close" data-action="close" aria-label="Tutup">${icons.close}</button>
      </div>
      <div class="language-sheet__soon">
        <p>${lang.name} sedang dipersiapkan.</p>
        <p>Untuk saat ini, kamu bisa mulai belajar Bahasa Jawa.</p>
        <button class="btn btn-primary" data-action="go-jawa">Belajar Bahasa Jawa</button>
      </div>
    `;

    sheet.querySelector('[data-action="close"]').addEventListener('click', close);
    sheet.querySelector('[data-action="go-jawa"]').addEventListener('click', goToJawaLearning);
  }

  renderList();
}
