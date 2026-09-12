/*
  languages.js
  Data murni daftar bahasa yang (akan) didukung BahasaKoe.

  Struktur sengaja sederhana & scalable — menambah bahasa daerah baru di masa
  depan cukup menambah satu object di array ini, tanpa menyentuh logic
  lain (appState, router, dst). TIDAK ada backend/API di balik ini,
  murni data statis untuk prototype.

  language = {
    id,           // dipakai sebagai key di state (selectedLanguage) & routing
    name,         // nama tampilan lengkap, mis. "Bahasa Jawa"
    nativeName,   // nama dalam bahasa itu sendiri (untuk masa depan/branding)
    status,       // 'available' | 'coming-soon'
    available,    // boolean — true kalau ada konten lesson yang playable
    description,  // subtitle singkat dipakai di language selector
  }
*/

export const LANGUAGES = [
  {
    id: 'jawa',
    name: 'Bahasa Jawa',
    nativeName: 'Basa Jawa',
    status: 'available',
    available: true,
    description: 'Sedang dipelajari',
  },
  {
    id: 'sunda',
    name: 'Bahasa Sunda',
    nativeName: 'Basa Sunda',
    status: 'coming-soon',
    available: false,
    description: 'Segera hadir',
  },
];

export const DEFAULT_LANGUAGE_ID = 'jawa';

export function getLanguageById(id) {
  return LANGUAGES.find((lang) => lang.id === id) || LANGUAGES.find((lang) => lang.id === DEFAULT_LANGUAGE_ID);
}
