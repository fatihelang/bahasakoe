/*
  mascot.js
  SATU tempat untuk semua posisi maskot. Saat ini semuanya masih PLACEHOLDER
  (kotak putus-putus berlabel "Maskot"), supaya posisi dan ukurannya sudah
  bisa dinilai sebelum karakter aslinya ada.

  Cara mengganti dengan maskot asli (tanpa mengubah layar mana pun):
  1. Taruh gambar (SVG/PNG transparan, persegi) di assets/mascot/ dengan nama
     sesuai mood: wave, think, cheer, happy, gentle  (mis. wave.svg).
  2. Ubah USE_ASSETS di bawah menjadi true (dan MASCOT_EXT bila bukan svg).
  Mood yang berkasnya belum ada otomatis kembali ke placeholder.

  Mood dan posisinya sekarang:
  - wave   : Home (sapaan), Lesson Intro
  - think  : Culture Moment
  - cheer  : Lesson Complete
  - happy / gentle : belum dipakai (kandidat untuk feedback benar / belum tepat)
*/

const USE_ASSETS = false;
const MASCOT_EXT = 'svg';
const MASCOT_DIR = 'assets/mascot/';

/**
 * @param {{ mood?: 'wave'|'think'|'cheer'|'happy'|'gentle', size?: 'sm'|'md'|'lg'|'xl', className?: string }} [options]
 * @returns {string} HTML. Dekoratif (aria-hidden), tidak menyampaikan informasi.
 */
export function mascotHtml({ mood = 'wave', size = 'md', className = '' } = {}) {
  const img = USE_ASSETS
    ? `<img class="mascot__img" src="${MASCOT_DIR}${mood}.${MASCOT_EXT}" alt="" onerror="this.remove()" />`
    : '';
  return `
    <span class="mascot mascot--${size} ${className}" data-mood="${mood}" aria-hidden="true">
      ${img}<span class="mascot__placeholder">Maskot</span>
    </span>`;
}
