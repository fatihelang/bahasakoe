/*
  pageHeader.js
  Page Header (brand guide, Navigation & App Shell). Satu fungsi untuk
  semua layar supaya judul, back button, dan area aksi selalu konsisten:

  - Root page (Home, Belajar, Profil): tanpa back button.
  - Nested page (Unit Detail): back button kembali satu langkah.

  Mengembalikan string HTML. Pemanggil memasang listener sendiri lewat
  [data-action="back"] (lihat unitDetail.js).
*/

import { icons } from './icons.js';

export function pageHeader({ title, subtitle = '', backLabel = '', action = '' }) {
  return `
    <header class="app-header">
      ${
        backLabel
          ? `<button class="app-header__back" data-action="back" aria-label="${backLabel}">${icons.chevronLeft}</button>`
          : ''
      }
      <div class="app-header__titles">
        <h1 class="app-header__title">${title}</h1>
        ${subtitle ? `<p class="app-header__subtitle">${subtitle}</p>` : ''}
      </div>
      ${action ? `<div class="app-header__action">${action}</div>` : ''}
    </header>
  `;
}
