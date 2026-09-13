/*
  index.js (js/data/culture/)
  Satu-satunya lapisan yang tahu "budaya apa milik bahasa apa" -- pola
  persis js/data/curriculum.js untuk lesson. Screen (culture.js, home.js)
  TIDAK BOLEH import js/data/culture/jawa.js atau sunda.js secara langsung;
  semuanya lewat getCultureTopics()/getCultureTopicById() di sini.

  Struktur data (tidak berubah dari js/data/culture.js lama):
  topic = { id, title, icon, description, content, needsValidation? }

  CARA MENAMBAH BUDAYA BAHASA BARU (mis. Batak, setelah kontennya siap):
  1. Buat js/data/culture/<bahasa>.js berisi `export const TOPICS = [...]`,
     mengikuti pola persis jawa.js/sunda.js.
  2. import { TOPICS as X_TOPICS } from './<bahasa>.js'; lalu daftarkan
     `<bahasa>: X_TOPICS` di TOPICS_BY_LANGUAGE di bawah.
  Tidak ada file lain yang perlu diubah -- culture.js dan home.js generik
  lewat fungsi di file ini.
*/

import { TOPICS as JAWA_CULTURE } from './jawa.js';
import { TOPICS as SUNDA_CULTURE } from './sunda.js';

const TOPICS_BY_LANGUAGE = {
  jawa: JAWA_CULTURE,
  sunda: SUNDA_CULTURE,
};

/** Semua topik budaya milik satu bahasa. Array kosong (bukan error) kalau
 *  bahasa itu belum punya konten budaya sama sekali. */
export function getCultureTopics(languageId) {
  return TOPICS_BY_LANGUAGE[languageId] || [];
}

export function getCultureTopicById(languageId, topicId) {
  return getCultureTopics(languageId).find((topic) => topic.id === topicId) || null;
}
