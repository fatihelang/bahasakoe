/*
  confirmDialog.js
  Confirm Dialog (brand guide): dipakai saat sebuah aksi bisa menghilangkan
  progress yang belum tersimpan, mis. keluar dari lesson yang belum selesai.

  Konvensi: aksi AMAN selalu jadi tombol primary, aksi berisiko ("Keluar")
  jadi secondary, supaya tombol paling menonjol bukan yang membuat user
  kehilangan progress. Danger (merah destruktif) sengaja tidak dipakai:
  keluar dari lesson bukan aksi destruktif permanen.
*/

import { openOverlay } from './overlay.js';

export function showConfirmDialog({ title, message, safeLabel, riskyLabel, onRisky }) {
  const card = document.createElement('div');
  card.className = 'confirm-dialog';
  card.innerHTML = `
    <h2 class="confirm-dialog__title">${title}</h2>
    <p class="confirm-dialog__message">${message}</p>
    <div class="confirm-dialog__actions">
      <button class="btn btn-primary" data-action="safe" data-autofocus>${safeLabel}</button>
      <button class="btn btn-secondary" data-action="risky">${riskyLabel}</button>
    </div>
  `;

  const { close } = openOverlay(card, { center: true, label: title });

  card.querySelector('[data-action="safe"]').addEventListener('click', close);
  card.querySelector('[data-action="risky"]').addEventListener('click', () => {
    close();
    onRisky();
  });
}
