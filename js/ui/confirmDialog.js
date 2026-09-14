/*
  confirmDialog.js
  Dialog konfirmasi kecil generik -- dipakai saat sebuah aksi bisa
  menghilangkan progress yang belum tersimpan (mis. keluar dari lesson
  yang belum selesai). Pola sama seperti languageSheet.js (backdrop dibuat
  & dilepas dari DOM setiap kali dipakai), tapi kartunya di TENGAH layar
  (bukan bottom sheet) karena ini konfirmasi singkat, bukan daftar pilihan
  -- reuse --color-scrim yang sama, cuma alignment-nya beda.

  Konvensi: aksi yang AMAN/non-destruktif selalu jadi tombol primary
  (paling menonjol), aksi yang berisiko (mis. "Keluar") jadi secondary --
  supaya tombol paling mencolok bukan yang bikin user kehilangan progress.
*/

export function showConfirmDialog({ title, message, safeLabel, riskyLabel, onRisky }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'confirm-dialog-backdrop';

  const card = document.createElement('div');
  card.className = 'confirm-dialog';
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  function close() {
    backdrop.remove();
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  card.innerHTML = `
    <div class="confirm-dialog__title">${title}</div>
    <p class="confirm-dialog__message">${message}</p>
    <div class="confirm-dialog__actions">
      <button class="btn btn-primary confirm-dialog__safe" data-action="safe">${safeLabel}</button>
      <button class="btn btn-secondary confirm-dialog__risky" data-action="risky">${riskyLabel}</button>
    </div>
  `;

  card.querySelector('[data-action="safe"]').addEventListener('click', close);
  card.querySelector('[data-action="risky"]').addEventListener('click', () => {
    close();
    onRisky();
  });
}
