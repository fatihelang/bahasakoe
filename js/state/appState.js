/*
  appState.js
  Satu-satunya file yang boleh baca/tulis LocalStorage.
  File lain (screens, router) hanya boleh memanggil fungsi di sini,
  supaya kalau nanti format penyimpanan berubah, cukup diubah di satu tempat.

  STEP 1 (multi-language + multi-unit): progress tidak lagi flat
  (completedLessons/currentLessonId di top level, seolah cuma ada satu
  unit di seluruh aplikasi) -- sekarang bersarang per languageId + unitId:

    state.progress = {
      jawa: {
        unit1: { completedLessons: ['l1', 'l2'], currentLessonId: 'l3' }
      }
      // sunda: { unit1: {...} } -- akan terisi sendiri begitu ada yang
      // memainkan lesson Sunda pertama kali, lewat ensureUnitProgress().
    }

  state.missed = [ { languageId, unitId, lessonId, questionId, ts } ]
  menyimpan soal yang terakhir dijawab SALAH (bahan untuk "Ulas kata yang
  salah"). Soal yang kemudian dijawab benar otomatis dihapus dari daftar.
  State lama tanpa field ini tetap aman (dianggap daftar kosong).

  xp, streak, lastActiveDate, dan selectedLanguage TETAP global (bukan
  per-bahasa/unit) -- itu representasi pengguna secara keseluruhan, bukan
  progress kurikulum, jadi sengaja tidak ikut dipecah.
*/

import { DEFAULT_LANGUAGE_ID, getLanguageById } from '../data/languages.js';
import { getUnit, getUnitsForLanguage, getDefaultUnit, getFirstPlayableLesson, getNextPlayableLesson } from '../data/curriculum.js';
import { BADGES } from '../data/badges.js';

const STORAGE_KEY = 'bahasakoe_state_v1';

// Dipakai HANYA untuk dua hal yang memang sengaja tetap terikat ke Bahasa
// Jawa Unit 1 secara eksplisit, bukan mengikuti selectedLanguage/current unit:
// (1) migrateLegacyProgress -- data lama secara struktural memang cuma
//     pernah berisi progress Jawa Unit 1 (satu-satunya unit yang pernah ada
//     saat format lama dipakai), jadi migrasinya harus ke unit itu juga;
// (2) getBadgesWithStatus -- badge ("Langkah Pertama", "Unit 1 MVP Tuntas",
//     dst.) memang didefinisikan seputar perjalanan Jawa Unit 1 spesifik,
//     bukan progress lintas-bahasa/unit (lihat komentar di fungsi itu).
// STEP 1.5: Home & Profile TIDAK LAGI pakai konstanta ini -- keduanya
// sekarang mengikuti selectedLanguage + getCurrentUnit() di bawah.
const PINNED_UNIT = getDefaultUnit(DEFAULT_LANGUAGE_ID);
const PINNED_UNIT_ID = PINNED_UNIT ? PINNED_UNIT.id : null;

function getTodayKey() {
  // Format YYYY-MM-DD, dipakai untuk hitung streak sederhana
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    xp: 0,
    streak: 1,
    lastActiveDate: getTodayKey(),
    selectedLanguage: DEFAULT_LANGUAGE_ID,
    progress: {}, // diisi lazy per languageId/unitId lewat ensureUnitProgress()
    missed: [], // soal yang salah, untuk "Ulas kata yang salah" (lihat saveQuestionResults)
    onboardingSeen: false, // lihat isFirstLaunch() / markOnboardingSeen()
  };
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca state dari LocalStorage:', err);
    return null;
  }
}

function writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Gagal menyimpan state ke LocalStorage:', err);
  }
}

/**
 * Migrasi bentuk state lama (sebelum STEP 1): dulu progress disimpan flat
 * di top-level (completedLessons, currentLessonId), karena aplikasi cuma
 * pernah punya satu unit. TIDAK ADA DATA YANG DIHILANGKAN -- progress lama
 * itu memang progress Bahasa Jawa Unit 1 (satu-satunya unit yang pernah
 * ada), jadi cukup dipindah bentuknya ke progress.jawa.unit1, lalu field
 * lama dihapus supaya tidak ada dua sumber kebenaran yang tumpang tindih.
 */
function migrateLegacyProgress(state) {
  const hasLegacyShape = Array.isArray(state.completedLessons) || typeof state.currentLessonId === 'string';
  if (!hasLegacyShape) return state;

  if (!state.progress) state.progress = {};
  if (!state.progress[DEFAULT_LANGUAGE_ID]) state.progress[DEFAULT_LANGUAGE_ID] = {};

  if (PINNED_UNIT_ID && !state.progress[DEFAULT_LANGUAGE_ID][PINNED_UNIT_ID]) {
    state.progress[DEFAULT_LANGUAGE_ID][PINNED_UNIT_ID] = {
      completedLessons: state.completedLessons || [],
      currentLessonId: state.currentLessonId || null,
    };
  }

  delete state.completedLessons;
  delete state.currentLessonId;
  return state;
}

/**
 * Memastikan state.progress[languageId][unitId] ada, membuat default kalau
 * belum (lesson playable pertama di unit itu jadi currentLessonId-nya).
 * Mutasi terjadi di object `state` yang di-pass -- pemanggil yang menentukan
 * apakah hasilnya perlu di-writeState() atau cukup dipakai untuk baca saja.
 */
function ensureUnitProgress(state, languageId, unitId) {
  if (!state.progress) state.progress = {};
  if (!state.progress[languageId]) state.progress[languageId] = {};
  if (!state.progress[languageId][unitId]) {
    const unit = getUnit(languageId, unitId);
    const firstPlayable = unit ? getFirstPlayableLesson(unit) : null;
    state.progress[languageId][unitId] = {
      completedLessons: [],
      currentLessonId: firstPlayable ? firstPlayable.id : null,
    };
  }
  return state.progress[languageId][unitId];
}

function updateStreak(state) {
  const today = getTodayKey();
  if (state.lastActiveDate === today) {
    return state; // sudah dihitung hari ini
  }
  const last = new Date(state.lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    state.streak += 1;
  } else if (diffDays > 1) {
    state.streak = 1;
  }
  state.lastActiveDate = today;
  return state;
}

/**
 * Panggil sekali saat aplikasi dibuka.
 * Membuat state default jika belum ada, migrasi bentuk lama jika perlu,
 * dan meng-update streak harian.
 */
// XP per jawaban benar. Diekspor supaya UI (feedback "+10 XP" di lesson.js)
// selalu memakai angka yang sama dengan yang benar-benar ditambahkan
// completeLesson(), bukan angka kedua yang bisa selisih.
export const XP_PER_CORRECT_ANSWER = 10;

export function initState() {
  const existingState = readState();
  let state = existingState;
  if (!state) {
    state = defaultState();
  }
  if (!state.selectedLanguage) {
    state.selectedLanguage = DEFAULT_LANGUAGE_ID;
  }
  // State lama (sebelum onboarding ada) tidak punya field ini sama sekali --
  // itu berarti orangnya SUDAH pernah pakai app (ada state tersimpan), jadi
  // tidak perlu dipaksa lihat tutorial. Hanya state yang benar-benar baru
  // (belum pernah ada apa pun di LocalStorage) yang mulai dari false.
  if (typeof state.onboardingSeen !== 'boolean') {
    state.onboardingSeen = Boolean(existingState);
  }
  state = migrateLegacyProgress(state);
  if (!state.progress) state.progress = {};
  state = updateStreak(state);
  writeState(state);
  return state;
}

/** Apakah user sudah pernah menyelesaikan/melewati layar onboarding. */
export function hasSeenOnboarding() {
  return Boolean(getState().onboardingSeen);
}

/** Dipanggil saat onboarding selesai (tombol terakhir) atau di-skip ("Lewati"). */
export function markOnboardingSeen() {
  const state = getState();
  if (state.onboardingSeen) return;
  state.onboardingSeen = true;
  writeState(state);
}

export function getState() {
  return readState() || initState();
}

export function isLessonCompleted(languageId, unitId, lessonId) {
  const state = getState();
  const unitProgress = ensureUnitProgress(state, languageId, unitId);
  return unitProgress.completedLessons.includes(lessonId);
}

export function getCurrentLessonId(languageId, unitId) {
  const state = getState();
  return ensureUnitProgress(state, languageId, unitId).currentLessonId;
}

/**
 * Mengembalikan object bahasa yang sedang aktif (dari data/languages.js),
 * bukan cuma id-nya — supaya pemanggil langsung dapat name/available/dst.
 */
export function getSelectedLanguage() {
  const state = getState();
  return getLanguageById(state.selectedLanguage);
}

/**
 * Mengganti bahasa yang dipilih user. TIDAK menyentuh progress
 * (xp/streak/progress per unit) sama sekali — setiap bahasa punya
 * progress-nya sendiri di bawah state.progress[languageId].
 */
export function setSelectedLanguage(languageId) {
  const state = getState();
  state.selectedLanguage = languageId;
  writeState(state);
  return getLanguageById(state.selectedLanguage);
}

export function getUnitProgress(languageId, unitId) {
  const state = getState();
  const unitProgress = ensureUnitProgress(state, languageId, unitId);
  const unit = getUnit(languageId, unitId);
  const total = unit ? unit.lessons.length : 0;
  return {
    completed: unitProgress.completedLessons.length,
    total,
  };
}

/**
 * STEP 1.5: Unit "sekarang" untuk sebuah bahasa -- dipakai Home & Profile
 * (dan Learning Path) supaya tidak lagi dipin ke Unit 1.
 *
 * Logika:
 * 1. Ambil semua unit bahasa itu, terurut berdasarkan "order".
 * 2. Cari unit PERTAMA yang lesson playable-nya BELUM seluruhnya selesai
 *    ("selesai" dihitung dari completedLessons vs lesson yang playable
 *    SAJA -- lesson locked/preview tidak pernah ikut dihitung, sesuai
 *    getFirstPlayableLesson/getNextPlayableLesson yang juga selalu
 *    memfilter `.playable`).
 * 3. Kalau tidak ada progress sama sekali, unit itu otomatis "belum
 *    selesai" (completedLessons kosong), jadi hasilnya jatuh ke unit
 *    pertama -- sama seperti perilaku getDefaultUnit() sebelumnya.
 * 4. Kalau SEMUA unit yang ada sudah selesai, kembalikan unit terakhir
 *    (dipakai untuk mode review, bukan error).
 * 5. Unit tanpa lesson playable sama sekali (secara teori bisa terjadi,
 *    mis. unit isinya cuma preview) dilewati -- tidak ada yang bisa
 *    "dilanjutkan" di situ, jadi bukan kandidat current unit.
 * 6. Bahasa tanpa unit sama sekali (mis. Sunda untuk sekarang) -> null.
 */
export function getCurrentUnit(languageId) {
  const units = getUnitsForLanguage(languageId);
  if (units.length === 0) return null;

  const state = getState();
  const firstUnfinished = units.find((unit) => {
    const playableLessons = unit.lessons.filter((l) => l.playable);
    if (playableLessons.length === 0) return false;
    const unitProgress = ensureUnitProgress(state, languageId, unit.id);
    return !playableLessons.every((l) => unitProgress.completedLessons.includes(l.id));
  });

  return firstUnfinished || units[units.length - 1];
}

/**
 * Mengembalikan semua badge beserta status earned/belum, dihitung dari
 * state saat ini. Definisi badge murni ada di data/badges.js — di sini
 * cuma logic pengecekannya. Badge SENGAJA tetap dipin ke Bahasa Jawa
 * Unit 1 (sama seperti stats-row Home/Profile) -- badge-badge ini
 * ("Langkah Pertama", "Unit 1 MVP Tuntas", dst.) memang didefinisikan
 * seputar perjalanan Unit 1, bukan progress lintas-bahasa/unit.
 */
export function getBadgesWithStatus() {
  const state = getState();
  const pinnedProgress = PINNED_UNIT_ID
    ? ensureUnitProgress(state, DEFAULT_LANGUAGE_ID, PINNED_UNIT_ID)
    : { completedLessons: [] };

  return BADGES.map((badge) => {
    let earned = false;
    if (badge.requirement.type === 'lessonsCompleted') {
      earned = pinnedProgress.completedLessons.length >= badge.requirement.value;
    } else if (badge.requirement.type === 'streak') {
      earned = state.streak >= badge.requirement.value;
    }
    return { ...badge, earned };
  });
}

/**
 * Dipanggil saat Lesson Complete: menandai lesson selesai (dalam konteks
 * languageId+unitId tertentu), menambah XP (tetap global), dan membuka
 * lesson berikutnya DI DALAM UNIT YANG SAMA.
 */
export function completeLesson(languageId, unitId, lessonId, correctCount, totalQuestions) {
  const state = getState();
  const unitProgress = ensureUnitProgress(state, languageId, unitId);
  const unit = getUnit(languageId, unitId);

  if (!unitProgress.completedLessons.includes(lessonId)) {
    unitProgress.completedLessons.push(lessonId);
  }

  const earnedXP = correctCount * XP_PER_CORRECT_ANSWER;
  state.xp += earnedXP;

  const lesson = unit ? unit.lessons.find((l) => l.id === lessonId) : null;
  const nextPlayableLesson = unit && lesson ? getNextPlayableLesson(unit, lesson.order) : null;
  if (nextPlayableLesson) {
    unitProgress.currentLessonId = nextPlayableLesson.id;
  }
  // Kalau tidak ada lesson playable berikutnya (mis. baru selesai lesson
  // playable terakhir di unit ini), currentLessonId sengaja TIDAK diubah —
  // biarkan tetap menunjuk ke lesson playable terakhir yang sudah completed,
  // supaya Learning Path tidak salah menandai lesson locked berikutnya
  // sebagai "current".

  writeState(state);

  return {
    earnedXP,
    totalXP: state.xp,
    unitProgress: getUnitProgress(languageId, unitId),
    nextLessonId: unitProgress.currentLessonId,
  };
}

/* ---------------- Ulas kata yang salah ---------------- */

// Batas daftar ulas agar LocalStorage tidak membengkak; yang paling lama dibuang.
const MAX_MISSED_ITEMS = 40;

/**
 * Dipanggil saat sesi selesai (Lesson Complete, termasuk mode review & sesi
 * Ulas): mencatat soal yang salah ke daftar ulas dan MENGHAPUS soal yang
 * kali ini dijawab benar. Tidak menyentuh XP/progress lesson.
 *
 * @param {Array<{languageId:string, unitId:string, lessonId:string, questionId:string, correct:boolean}>} results
 */
export function saveQuestionResults(results) {
  const state = getState();
  const keyOf = (r) => `${r.languageId}|${r.unitId}|${r.lessonId}|${r.questionId}`;
  let missed = Array.isArray(state.missed) ? [...state.missed] : [];

  results.forEach((result) => {
    const key = keyOf(result);
    missed = missed.filter((item) => keyOf(item) !== key);
    if (!result.correct) {
      missed.push({
        languageId: result.languageId,
        unitId: result.unitId,
        lessonId: result.lessonId,
        questionId: result.questionId,
        ts: Date.now(),
      });
    }
  });

  state.missed = missed.slice(-MAX_MISSED_ITEMS);
  writeState(state);
  return state.missed;
}

/** Soal yang perlu diulas untuk satu bahasa, urutan dari yang paling lama. */
export function getMissedItems(languageId) {
  const state = getState();
  return (Array.isArray(state.missed) ? state.missed : []).filter((item) => item.languageId === languageId);
}
