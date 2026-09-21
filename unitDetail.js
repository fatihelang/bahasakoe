/*
  unitDetail.js
  Jembatan antara Belajar dan Lesson. Menampilkan satu Unit: judul,
  deskripsi, progress, SATU primary CTA ("Mulai" / "Lanjutkan" / "Ulas
  Lagi"), lalu daftar lesson dengan status yang sama persis dengan
  Learning Path (satu sumber kebenaran: appState.js).

  Urutan lesson tetap sesuai kurikulum: completed tidak dipindah, current
  paling menonjol, locked netral. Lesson completed tetap bisa dibuka
  untuk review. Menerima { languageId, unitId } lewat params navigasi;
  tanpa params, fallback ke unit "sekarang" Bahasa Jawa.

  CTA membuka screen "lesson", yang selalu mulai dari Lesson Intro.
*/

import { getUnit } from '../data/curriculum.js';
import { DEFAULT_LANGUAGE_ID } from '../data/languages.js';
import { getUnitProgress, isLessonCompleted, getCurrentLessonId, getCurrentUnit } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { pageHeader } from '../ui/pageHeader.js';

function getLessonStatus(lesson, languageId, unitId, currentLessonId) {
  if (isLessonCompleted(languageId, unitId, lesson.id)) return 'completed';
  if (lesson.id === currentLessonId) return 'current';
  return 'locked';
}

function lessonCardHtml(lesson, status, index) {
  const bubbleClass = status === 'completed' ? 'icon-bubble--success' : status === 'locked' ? 'icon-bubble--locked' : '';
  const bubbleContent = status === 'completed' ? icons.check : status === 'locked' ? icons.lock : `<b>${lesson.order}</b>`;

  let badgeLabel;
  let badgeIcon = '';
  if (status === 'completed') {
    badgeLabel = 'Selesai';
    badgeIcon = icons.check;
  } else if (status === 'current') {
    badgeLabel = 'Sedang dipelajari';
  } else {
    badgeLabel = lesson.playable ? 'Terkunci' : 'Segera hadir';
    badgeIcon = icons.lock;
  }

  const subtitle =
    status === 'completed'
      ? 'Ketuk untuk review'
      : status === 'current'
      ? 'Lanjutkan lesson ini'
      : lesson.playable
      ? 'Selesaikan lesson sebelumnya'
      : 'Belum tersedia di prototype ini';

  const inner = `
    <span class="card-top">
      <span class="icon-bubble ${bubbleClass}" aria-hidden="true">${bubbleContent}</span>
      <span class="card-body">
        <span class="card-meta"><span class="card-badge is-${status}">${badgeIcon}${badgeLabel}</span></span>
        <span class="card-title">${lesson.title}</span>
        <span class="card-text">${subtitle}</span>
      </span>
    </span>
  `;

  const stateClass = `card card--learning path-item is-${status}`;
  const stagger = `style="--stagger:${index}"`;

  return status === 'locked'
    ? `<li class="stagger-in" ${stagger}><div class="${stateClass}">${inner}</div></li>`
    : `<li class="stagger-in" ${stagger}><button class="${stateClass} card-clickable" data-lesson-id="${lesson.id}">${inner}</button></li>`;
}

// Urutan tone sama dengan kartu unit di tab Belajar (accents.css), supaya unit terasa punya warna sendiri.
const UNIT_TONES = ['sky', 'pink', 'teal', 'violet', 'orange', 'gold'];

export function renderUnitDetail(container, { navigateTo }, params = {}) {
  let languageId = params.languageId;
  let unit = languageId ? getUnit(languageId, params.unitId) : null;

  if (!unit) {
    languageId = DEFAULT_LANGUAGE_ID;
    unit = getCurrentUnit(DEFAULT_LANGUAGE_ID);
  }

  const progress = getUnitProgress(languageId, unit.id);
  const currentLessonId = getCurrentLessonId(languageId, unit.id);
  const currentLesson = unit.lessons.find((l) => l.id === currentLessonId);
  const isReviewing = currentLesson ? isLessonCompleted(languageId, unit.id, currentLesson.id) : false;
  const isFirstTime = progress.completed === 0;
  const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const lessonsHtml = unit.lessons
    .map((lesson, index) => lessonCardHtml(lesson, getLessonStatus(lesson, languageId, unit.id, currentLessonId), index))
    .join('');

  container.innerHTML = `
    <div class="screen unit-detail">
      ${pageHeader({ title: unit.title, subtitle: `Unit ${unit.order}`, backLabel: 'Kembali ke Belajar' })}

      <div class="unit-intro" data-tone="${UNIT_TONES[(unit.order - 1) % UNIT_TONES.length]}">
        <p class="unit-intro__description">${unit.description}</p>
        <div class="unit-progress">
          <div class="unit-progress__label">
            <span>${progress.completed} dari ${progress.total} lesson</span>
            <span class="unit-progress__value">${Math.round(percent)}%</span>
          </div>
          <div class="progress-track ${progress.completed >= progress.total ? 'is-complete' : ''}" role="progressbar" aria-label="Progress unit" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.completed}">
            <div class="progress-fill" style="width:${percent}%"></div>
          </div>
        </div>
        ${
          currentLesson
            ? `<button class="btn btn-primary btn-lg btn-block" data-action="continue">${isReviewing ? 'Ulas Lagi' : isFirstTime ? 'Mulai' : 'Lanjutkan'}</button>`
            : ''
        }
      </div>

      <div class="stack stack--section">
        <h2 class="section-title">Lesson</h2>
        <ul class="path-list">${lessonsHtml}</ul>
      </div>
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

  // Lesson yang bisa dibuka (current & completed) berupa <button>; locked
  // dan "segera hadir" berupa elemen non-interaktif, alasannya tertulis di kartu.
  container.querySelectorAll('[data-lesson-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateTo('lesson', { languageId, unitId: unit.id, lessonId: btn.dataset.lessonId });
    });
  });
}
