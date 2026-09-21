/*
  gamification.js
  Logic TAMPILAN kecil yang dipakai bareng oleh Home & Profile supaya
  identitas gamified-nya konsisten di kedua layar, tanpa duplikasi.

  PENTING: file ini TIDAK menyimpan/membaca state apa pun (bukan lapisan
  storage seperti appState.js) -- isinya murni fungsi turunan tampilan
  dari data yang sudah ada (xp) + data statis (pemetaan warna ikon badge).
*/

// XP per level murni angka tampilan (bukan konfigurasi gameplay/backend) --
// dipakai hanya untuk menerjemahkan state.xp yang sudah ada jadi "Level N"
// + progress bar menuju level berikutnya.
const XP_PER_LEVEL = 100;

export function getLevelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpToNext: XP_PER_LEVEL - xpIntoLevel,
    percent: (xpIntoLevel / XP_PER_LEVEL) * 100,
  };
}

// Memetakan badge.icon (key dari data/badges.js) ke warna chip yang sesuai
// personanya — dipisah dari data murni (badges.js) supaya file itu tetap
// fokus ke konten, bukan detail visual.
export const BADGE_ICON_COLOR = {
  seedling: 'green',
  flame: 'red',
  trophy: 'red', // trophy adalah reward, bukan konten Budaya, jadi ikut
                 // identitas merah, bukan aksen kuning kunyit
  zap: 'red',
};
