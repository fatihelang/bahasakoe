/*
  icons.js
  Kumpulan ikon SVG garis (stroke 1.8, currentColor) untuk seluruh aplikasi.
  Semua ikon original, bukan dari icon library berlisensi tertentu.
  Warna & ukuran diatur lewat CSS (currentColor), bukan di sini.

  Catatan: culture, handsTogether, house, candle, mask tidak dipakai UI
  saat ini, tetapi dirujuk lewat key oleh js/data/culture/* (konten Budaya
  yang disimpan sebagai cadangan sumber Culture Moment), jadi dipertahankan.
*/

export const icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/></svg>`,

  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5c2-1 5-1 7 0v13c-2-1-5-1-7 0z"/><path d="M20 5.5c-2-1-5-1-7 0v13c2-1 5-1 7 0z"/></svg>`,

  culture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 2 5 5 5 9a5 5 0 0 1-10 0c0-4 2-7 5-9Z"/><path d="M9 21c1-1.2 2-2 3-2s2 .8 3 2"/></svg>`,

  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.5-3.5 4.3-5.3 7-5.3S17.5 16.5 19 20"/></svg>`,

  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 9.5 17 19 7"/></svg>`,

  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>`,

  /* ---- Ditambahkan untuk menggantikan emoji di seluruh aplikasi ---- */

  wave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11.5V6a1.5 1.5 0 0 1 3 0v4"/><path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 10V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M16 11v-2a1.5 1.5 0 0 1 3 0v5c0 3.5-2.5 6-6 6h-1c-2.2 0-3.4-.8-4.6-2.4L4.6 13.8c-.5-.8-.3-1.7.5-2.1.7-.4 1.5-.2 2 .4L9 14"/></svg>`,

  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-2.7 1.5-4.5 2.6-6.3.4.9.9 1.6 1.6 2C9.5 8 10 5.6 12 3c1 2.4 2.3 3.7 3.8 5.4 1.6 1.8 2.7 3.5 2.7 6.4 0 3.6-2.6 6.2-6.5 6.2Z"/><path d="M12 21c1.7 0 3-1.1 3-2.8 0-1.4-.9-2.3-1.6-3.2-.4.6-.8 1-1.4 1.3-.2-1-.5-1.8-1-2.5-.9 1.1-2 2.1-2 3.7 0 1.6 1.3 2.5 3 2.5Z"/></svg>`,

  seedling: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9"/><path d="M12 12c0-3.5-2.5-6-7-6 0 4 2 6.5 7 6Z"/><path d="M12 9c0-3 2-5 6-5 0 3.5-1.7 5.5-6 5Z"/></svg>`,

  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10"/><path d="M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10"/><path d="M12 14v3"/><path d="M8.5 20.5h7"/><path d="M9.5 17.5h5l.5 3h-6z"/></svg>`,

  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13z"/></svg>`,

  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.5 14.5 9.2 20.7 9.9 16 14 17.3 20.2 12 17 6.7 20.2 8 14 3.3 9.9 9.5 9.2Z"/></svg>`,

  handsTogether: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v6"/><path d="M12 10c-1.5-2-3-2.7-4.5-2-1.5.7-2 2.3-1 4l3 5c1 1.5 2.5 2.5 4 2.5h1c1.5 0 3-1 4-2.5l3-5c1-1.7.5-3.3-1-4-1.5-.7-3 0-4.5 2"/></svg>`,

  house: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12 12 6l7 6"/><path d="M7 11v8h10v-8"/><path d="M10 19v-4h4v4"/></svg>`,

  candle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 1.3 1.6 2.2 1.6 3.1 0 .9-.7 1.4-1.6 1.4s-1.6-.5-1.6-1.4C10.4 5.2 11 4.3 12 3Z"/><rect x="9.5" y="8" width="5" height="12" rx="1"/><path d="M9.5 13h5"/></svg>`,

  mask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8c0-2.8 3.6-5 8-5s8 2.2 8 5c0 4-2 7-4 8.5-1 .8-1.7 1.5-1.7 2.5h-4.6c0-1-.7-1.7-1.7-2.5-2-1.5-4-4.5-4-8.5Z"/><path d="M9 10.5c.5-1 2.5-1 3 0"/><path d="M12 10.5c.5-1 2.5-1 3 0"/><path d="M10.5 15c1 .7 2 .7 3 0"/></svg>`,

  /* ---- Ditambahkan untuk UX overhaul: sound toggle + culture moment ---- */

  soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L13 19V5L7.5 9.5Z"/><path d="M17 9c1 1 1 5 0 6"/><path d="M19.5 6.8c2.3 2.7 2.3 7.7 0 10.4"/></svg>`,

  soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L13 19V5L7.5 9.5Z"/><path d="M17 10l4 4"/><path d="M21 10l-4 4"/></svg>`,

  bulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9v.7h5v-.7c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3Z"/></svg>`,

  graduate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 9-3.5L21 8l-9 3.5Z"/><path d="M7 10v4.5c0 1.5 2.2 2.7 5 2.7s5-1.2 5-2.7V10"/><path d="M21 8v5.5"/></svg>`,

  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg>`,

  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`,

  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,

  // Ulas: dua panah melingkar (kartu "Ulas kata yang salah")
  repeat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/></svg>`,

  // Silang tebal untuk indikator jawaban "kurang tepat" (dipasangkan dengan check di Answer Choice)
  cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M17 7 7 17"/></svg>`,
};

/**
 * Menambahkan class ke <svg> ikon (dipakai Answer Choice untuk .icon-check / .icon-cross).
 */
export function withClass(svg, className) {
  return svg.replace('<svg ', `<svg class="${className}" aria-hidden="true" `);
}
