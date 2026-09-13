/*
  unitDetail.js
  Jembatan antara Learning Path dan Lesson. Menampilkan ringkasan sebuah
  Unit (judul, deskripsi, progress) + CTA utama "Lanjutkan Belajar", lalu
  daftar lesson dengan status yang SAMA PERSIS dengan Learning Path
  (completed/current/locked) — satu sumber kebenaran progress yang sama
  (appState.js), cuma disajikan sebagai halaman "unit", bukan peta jalur
  penuh.

  STEP 1: menerima { languageId, unitId } lewat params navigasi (dikirim
  dari learningPath.js), lalu mengambil unit-nya dari curriculum.js --
  TIDAK hardcode UNIT1 lagi. Kalau dibuka tanpa params (mis. akses langsung
  yang tidak terduga), fallback ke unit "sekarang" Bahasa Jawa (STEP 1.5:
  getCurrentUnit, bukan lagi selalu Unit 1) supaya layar tidak kosong/error.

  Catatan implementasi (disengaja, bukan lupa):
  - Helper getLessonStatus/markerContent DIDUPLIKASI kecil dari
    learningPath.js, bukan diekstrak ke modul bersama — supaya perubahan di
    sini tidak berisiko menyentuh mekanisme timeline Learning Path yang
    sudah diperbaiki. Kalau nanti mau disatukan jadi satu helper module,
    itu refactor kecil terpisah yang aman dilakukan kapan saja karena
    keduanya membaca appState yang sama dan hasilnya identik.
  - CTA "Lanjutkan Belajar" untuk sekarang langsung ke Lesson (bukan Lesson
    Intro dulu), karena Lesson Intro belum dibangun. Tinggal ganti target
    navigateTo di satu tempat begitu Lesson Intro ada.
*/

import { getUnit } from '../data/curriculum.js';
import { DEFAULT_LANGUAGE_ID } from '../data/languages.js';
import { getUnitProgress, isLessonCompleted, getCurrentLessonId, getCurrentUnit } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { showToast } from '../ui/toast.js';

function getLessonStatus(lesson, languageId, unitId, currentLessonId) {
  if (isLessonCompleted(languageId, unitId, lesson.id)) return 'completed';
  if (lesson.id === currentLessonId) return 'current';
  return 'locked';
}

function markerContent(status, order) {
  if (status === 'completed') return icons.check;
  if (status === 'locked') return icons.lock;
  return order; // current: tampilkan nomor lesson
}

export function renderUnitDetail(container, { navigateTo }, params = {}) {
  let languageId = params.languageId;
  let unit = languageId ? getUnit(languageId, params.unitId) : null;

  if (!unit) {
    // Fallback aman kalau layar ini dibuka tanpa context unit yang valid --
    // pakai unit "sekarang" (bukan selalu Unit 1) supaya konsisten dengan
    // Home/Learning Path.
    languageId = DEFAULT_LANGUAGE_ID;
    unit = getCurrentUnit(DEFAULT_LANGUAGE_ID);
  }

  const progress = getUnitProgress(languageId, unit.id);
  const currentLessonId = getCurrentLessonId(languageId, unit.id);
  const currentLesson = unit.lessons.find((l) => l.id === currentLessonId);
  const isReviewingCompleted = currentLesson ? isLessonCompleted(languageId, unit.id, currentLesson.id) : false;

  const stepsHtml = unit.lessons
    .map((lesson) => {
      const status = getLessonStatus(lesson, languageId, unit.id, currentLessonId);
      // BUG FIX (audit STEP 6): lesson preview/locked (playable: false, mis.
      // Lesson 4-10) sebelumnya SELALU dapat subtitle "Selesaikan lesson
      // sebelumnya", bahkan setelah semua lesson playable di unit ini sudah
      // selesai -- padahal alasan sebenarnya adalah lesson itu belum dibuat,
      // bukan menunggu prasyarat. Sekarang dibedakan lewat lesson.playable.
      const subtitle =
        status === 'completed'
          ? 'Selesai — ketuk untuk review'
          : status === 'current'
          ? 'Lanjutkan lesson ini'
          : lesson.playable
          ? 'Selesaikan lesson sebelumnya'
          : 'Segera hadir di prototype ini';

      return `
        <li class="lesson-step-wrapper">
          <button class="lesson-step" data-lesson-id="${lesson.id}" data-status="${status}">
            <span class="lesson-step__timeline" aria-hidden="true">
              <span class="lesson-step__line lesson-step__line--top"></span>
              <span class="lesson-step__marker is-${status}">${markerContent(status, lesson.order)}</span>
              <span class="lesson-step__line lesson-step__line--bottom"></span>
            </span>
            <span class="lesson-step__body">
              <div class="lesson-step__title ${status === 'locked' ? 'is-locked' : ''}">${lesson.order}. ${lesson.title}</div>
              <div class="lesson-step__subtitle">${subtitle}</div>
            </span>
          </button>
        </li>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="unit-detail">
      <button class="unit-detail__back" data-action="back">${icons.chevronLeft}<span>Belajar</span></button>

      <div class="unit-detail__header">
        <div class="unit-detail__eyebrow">Unit ${unit.order}</div>
        <h1 class="unit-detail__title">${unit.title}</h1>
        <p class="unit-detail__description">${unit.description}</p>
      </div>

      <div class="unit-detail__progress">
        <div class="unit-detail__progress-label">${progress.completed} dari ${progress.total} lesson</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${(progress.completed / progress.total) * 100}%"></div>
        </div>
      </div>

      ${
        currentLesson
          ? `<button class="btn btn-primary unit-detail__cta" data-action="continue">${isReviewingCompleted ? 'Ulas Lagi' : 'Lanjutkan Belajar'}</button>`
          : ''
      }

      <ul class="path-list unit-detail__list">${stepsHtml}</ul>
    </div>
  `;

  container.querySelector('[data-action="back"]').addEventListener('click', () => {
    navigateTo('learn');
  });

  const ctaBtn = container.querySelector('[data-action="continue"]');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      navigateTo('lesson', { languageId, unitId: unit.id, lessonId: currentLesson.id });
    });
  }

  // Perilaku klik per lesson SENGAJA identik dengan Learning Path
  // (locked/coming-soon/playable) — tidak ada logic unlock baru di sini.
  container.querySelectorAll('.lesson-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lessonId = btn.dataset.lessonId;
      const status = btn.dataset.status;
      const lesson = unit.lessons.find((l) => l.id === lessonId);

      // BUG FIX (audit STEP 6): cek !lesson.playable LEBIH DULU. Sebelumnya
      // status === 'locked' dicek duluan, jadi lesson preview (playable:
      // false) ikut kena toast "Selesaikan lesson sebelumnya dulu ya" --
      // pesan yang salah/membingungkan karena lesson itu memang belum
      // dibuat, bukan menunggu lesson lain selesai.
      if (!lesson.playable) {
        showToast(`${icons.star} Lesson ini masih "Coming Soon" di prototype ini`);
        return;
      }
      if (status === 'locked') {
        showToast(`${icons.lock} Selesaikan lesson sebelumnya dulu ya`);
        return;
      }
      navigateTo('lesson', { languageId, unitId: unit.id, lessonId: lesson.id });
    });
  });
}
