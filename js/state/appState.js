/*
  appState.js
  Satu-satunya file yang boleh baca/tulis LocalStorage.
  File lain (screens, router) hanya boleh memanggil fungsi di sini,
  supaya kalau nanti format penyimpanan berubah, cukup diubah di satu tempat.
*/

import { UNIT1 } from '../data/unit1.js';
import { BADGES } from '../data/badges.js';
import { DEFAULT_LANGUAGE_ID, getLanguageById } from '../data/languages.js';

const STORAGE_KEY = 'bahasakoe_state_v1';

function getTodayKey() {
  // Format YYYY-MM-DD, dipakai untuk hitung streak sederhana
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    xp: 0,
    streak: 1,
    lastActiveDate: getTodayKey(),
    completedLessons: [],       // array of lesson id, mis. ['l1']
    currentLessonId: 'l1',      // lesson berikutnya yang harus dimainkan
    selectedLanguage: DEFAULT_LANGUAGE_ID, // bahasa yang sedang dipilih user, mis. 'jawa'
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
 * Membuat state default jika belum ada, dan meng-update streak harian.
 */
export function initState() {
  let state = readState();
  if (!state) {
    state = defaultState();
  }
  // Backfill minimal untuk state lama (tersimpan sebelum fitur language
  // selection ada) — bukan migration besar, cuma pastikan field ini ada.
  if (!state.selectedLanguage) {
    state.selectedLanguage = DEFAULT_LANGUAGE_ID;
  }
  state = updateStreak(state);
  writeState(state);
  return state;
}

export function getState() {
  return readState() || initState();
}

export function isLessonCompleted(lessonId) {
  return getState().completedLessons.includes(lessonId);
}

export function getCurrentLessonId() {
  return getState().currentLessonId;
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
 * (xp/streak/completedLessons) sama sekali — bahasa lain (mis. Sunda)
 * belum punya konten, jadi progress yang ada selalu tetap progress Jawa.
 */
export function setSelectedLanguage(languageId) {
  const state = getState();
  state.selectedLanguage = languageId;
  writeState(state);
  return getLanguageById(state.selectedLanguage);
}

export function getUnitProgress() {
  const state = getState();
  const totalLessons = UNIT1.lessons.length;
  return {
    completed: state.completedLessons.length,
    total: totalLessons,
  };
}

/**
 * Mengembalikan semua badge beserta status earned/belum, dihitung dari
 * state saat ini. Definisi badge murni ada di data/badges.js — di sini
 * cuma logic pengecekannya.
 */
export function getBadgesWithStatus() {
  const state = getState();
  return BADGES.map((badge) => {
    let earned = false;
    if (badge.requirement.type === 'lessonsCompleted') {
      earned = state.completedLessons.length >= badge.requirement.value;
    } else if (badge.requirement.type === 'streak') {
      earned = state.streak >= badge.requirement.value;
    }
    return { ...badge, earned };
  });
}

/**
 * Dipanggil saat Lesson Complete: menandai lesson selesai,
 * menambah XP, dan membuka lesson berikutnya.
 */
export function completeLesson(lessonId, correctCount, totalQuestions) {
  const state = getState();

  if (!state.completedLessons.includes(lessonId)) {
    state.completedLessons.push(lessonId);
  }

  const earnedXP = correctCount * 10;
  state.xp += earnedXP;

  const lessonOrder = UNIT1.lessons.find((l) => l.id === lessonId)?.order;
  const nextPlayableLesson = UNIT1.lessons.find((l) => l.order > lessonOrder && l.playable);
  if (nextPlayableLesson) {
    state.currentLessonId = nextPlayableLesson.id;
  }
  // Kalau tidak ada lesson playable berikutnya (mis. baru selesai Lesson 3),
  // currentLessonId sengaja TIDAK diubah — biarkan tetap menunjuk ke lesson
  // playable terakhir yang sudah completed, supaya Learning Path tidak salah
  // menandai lesson locked (mis. Lesson 4) sebagai "current".

  writeState(state);

  return {
    earnedXP,
    totalXP: state.xp,
    unitProgress: getUnitProgress(),
    nextLessonId: state.currentLessonId,
  };
}
