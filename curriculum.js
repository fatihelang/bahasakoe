/*
  curriculum.js
  Satu-satunya lapisan yang tahu "unit apa saja yang dimiliki bahasa apa".
  Ini jembatan generik antara data per-bahasa (js/data/<bahasa>/units.js)
  dengan appState.js & screens/*.js -- keduanya TIDAK BOLEH import file
  per-bahasa secara langsung (mis. `import { UNITS } from '../data/jawa/units.js'`
  di dalam screens/learningPath.js), supaya menambah bahasa baru tidak
  pernah butuh menyentuh lesson player, appState, atau screen manapun.

  Struktur data (tidak berubah dari sebelumnya, cuma sekarang bersarang
  di bawah Unit, bukan langsung di bawah "UNIT1" global):

  unit    = { id, order, title, description, lessons[] }
  lesson  = { id, order, title, playable, objective?, learningContent[], questions[] }
  question generik = { id, type, prompt, explanation, context?, cultureInsight?, needsValidation? }
  (detail per-type: lihat komentar di js/data/jawa/unit1.js, tidak berubah)

  ------------------------------------------------------------------------
  CARA MENAMBAH BAHASA BARU (mis. Sunda, setelah kontennya siap):
  1. Buat folder js/data/sunda/ berisi unit1.js (LESSONS) + units.js (UNITS),
     mengikuti pola persis js/data/jawa/.
  2. import { UNITS as SUNDA_UNITS } from './sunda/units.js'; di bawah, lalu
     daftarkan `sunda: SUNDA_UNITS` di UNITS_BY_LANGUAGE.
  Tidak ada file lain yang perlu diubah -- appState.js, learningPath.js,
  unitDetail.js, dan lesson.js semuanya generik lewat fungsi di file ini.

  CARA MENAMBAH UNIT BARU untuk bahasa yang sudah ada (mis. Unit 2 Jawa):
  1. Buat js/data/jawa/unit2.js (LESSONS, sama pola dengan unit1.js).
  2. Tambah satu object baru di js/data/jawa/units.js -> UNITS array.
  Tidak ada perubahan di curriculum.js ini maupun screen manapun.
  ------------------------------------------------------------------------
*/

import { UNITS as JAWA_UNITS } from './jawa/units.js';
import { UNITS as SUNDA_UNITS } from './sunda/units.js';

// STEP 3: Sunda sekarang didaftarkan dengan konten sungguhan (Unit 1) --
// getUnitsForLanguage('sunda') tidak lagi mengembalikan array kosong.
const UNITS_BY_LANGUAGE = {
  jawa: JAWA_UNITS,
  sunda: SUNDA_UNITS,
};

/** Semua unit milik satu bahasa, terurut berdasarkan "order". Array kosong
 *  (bukan error) kalau bahasa belum punya unit sama sekali -- ini kondisi
 *  valid, bukan bug (mis. Sunda saat ini). */
export function getUnitsForLanguage(languageId) {
  const units = UNITS_BY_LANGUAGE[languageId] || [];
  return [...units].sort((a, b) => a.order - b.order);
}

/** Unit "pertama"/default untuk sebuah bahasa (order terkecil), atau null
 *  kalau bahasa itu belum punya unit apapun. Dipakai screen (Home, Learning
 *  Path, Unit Detail) yang untuk sekarang belum punya UI pemilih-unit --
 *  begitu ada Unit 2, ini masih valid dipakai sebagai "unit yang tampil
 *  duluan", sebelum UI pemilih unit yang sesungguhnya dibangun. */
export function getDefaultUnit(languageId) {
  const units = getUnitsForLanguage(languageId);
  return units.length > 0 ? units[0] : null;
}

export function getUnit(languageId, unitId) {
  return getUnitsForLanguage(languageId).find((u) => u.id === unitId) || null;
}

export function getLesson(languageId, unitId, lessonId) {
  const unit = getUnit(languageId, unitId);
  return unit ? unit.lessons.find((l) => l.id === lessonId) || null : null;
}

export function getFirstPlayableLesson(unit) {
  return unit.lessons.find((l) => l.playable) || null;
}

/** Lesson playable berikutnya setelah "order" tertentu dalam unit yang sama
 *  -- dipakai appState.completeLesson() untuk membuka lesson selanjutnya.
 *  Sama seperti sebelumnya: kalau tidak ada lagi, mengembalikan null
 *  (pemanggil membiarkan currentLessonId tetap menunjuk lesson terakhir). */
export function getNextPlayableLesson(unit, afterOrder) {
  return unit.lessons.find((l) => l.order > afterOrder && l.playable) || null;
}
