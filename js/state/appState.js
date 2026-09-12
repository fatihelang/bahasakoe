/*
  appState.js
  Satu-satunya file yang boleh baca/tulis LocalStorage.
  File lain (screens, router) hanya boleh memanggil fungsi di sini,
  supaya kalau nanti format penyimpanan berubah, cukup diubah di satu tempat.
*/

import { UNIT1 } from '../data/unit1.js';

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

export function getUnitProgress() {
  const state = getState();
  const totalLessons = UNIT1.lessons.length;
  return {
    completed: state.completedLessons.length,
    total: totalLessons,
  };
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
  const nextLesson = UNIT1.lessons.find((l) => l.order === lessonOrder + 1);
  if (nextLesson) {
    state.currentLessonId = nextLesson.id;
  }

  writeState(state);

  return {
    earnedXP,
    totalXP: state.xp,
    unitProgress: getUnitProgress(),
    nextLessonId: state.currentLessonId,
  };
}
