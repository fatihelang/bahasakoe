/*
  index.js (js/data/culture/)
  Satu-satunya lapisan yang tahu "budaya apa milik bahasa apa" -- pola
  persis js/data/curriculum.js untuk lesson. Screen (culture.js, home.js)
  TIDAK BOLEH import js/data/culture/jawa.js atau sunda.js secara langsung;
  semuanya lewat getCultureTopics()/getCultureTopicById() di sini.

  Struktur data (base, tidak berubah dari js/data/culture.js lama):
  topic = { id, title, icon, description, content, needsValidation?, highlights?, activities?, takeaway? }

  PHASE 2: "highlights" bersifat OPSIONAL -- array kecil { label, text }
  (2-3 item) dipakai culture.js untuk menampilkan Culture Detail sebagai
  bagian yang scannable (mis. NGOKO vs KRAMA), bukan cuma satu paragraf
  panjang. Kalau sebuah topik tidak punya perbandingan alami semacam ini,
  cukup jangan diisi -- culture.js otomatis fallback ke paragraf biasa
  lewat "content". Tidak ada fakta baru di sini, "highlights" cuma
  memecah istilah yang SUDAH ada di "content" jadi lebih mudah dipindai.

  CULTURE EXPERIENCE OVERHAUL: "activities" (array, opsional tapi setiap
  topic di jawa.js/sunda.js sekarang SELALU punya minimal satu) adalah
  reusable activity system yang dirender GENERIK oleh culture.js lewat
  activity.type -- culture.js sendiri tidak pernah tahu "topik apa",
  cuma tahu "tipe activity apa". Tipe yang didukung (lihat renderer
  masing-masing di js/screens/culture.js):

    'scenario' -- situasi singkat (opsional) + pertanyaan pilihan ganda,
      dijawab dulu baru diperiksa (pola sama seperti lesson player):
      { type:'scenario', situation?, prompt, options:[...], correctIndex,
        feedback, explanation, needsValidation? }
      Tanpa "situation", activity ini otomatis berfungsi sebagai "choice"
      sederhana (pertanyaan langsung tanpa framing cerita) -- satu
      renderer generik, dua gaya tampilan, sesuai data yang dikirim.

    'compare' -- dua sisi berdampingan (mis. NGOKO vs KRAMA):
      { type:'compare', left:{label,description,items?}, right:{...} }
      "items" (opsional): [{native, arti}] -- tiap item jadi kartu
      tap-to-reveal individual. Kalau kedua sisi tidak punya "items"
      (belum ada kosakata yang tervalidasi -- lihat catatan di
      sunda.js), culture.js otomatis fallback jadi dua kartu reveal
      berisi label+description saja -- TIDAK PERNAH mengarang item baru.

    'reveal' -- satu atau beberapa kartu tap-to-reveal:
      { type:'reveal', cards:[{front, back}, ...] }

    'quiz' -- 1-3 pertanyaan ringan dibundel jadi satu activity, TIDAK
      memberi XP (lihat catatan di culture.js):
      { type:'quiz', questions:[{prompt, options, correctIndex, feedback}] }

  "takeaway" (opsional, tapi selalu diisi di jawa.js/sunda.js) adalah
  kesimpulan singkat 1-2 kalimat yang ditampilkan sekali di akhir semua
  activities milik satu topic: { body }.

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
