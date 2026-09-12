/*
  learningPath.js
  Merender peta belajar Unit 1: daftar 10 lesson dengan status
  completed / current / locked.
*/

import { UNIT1 } from '../data/unit1.js';
import { getState, isLessonCompleted } from '../state/appState.js';
import { icons } from '../ui/icons.js';
import { showToast } from '../ui/toast.js';
import { showLanguageSheet } from '../ui/languageSheet.js';

function getLessonStatus(lesson, state) {
  if (isLessonCompleted(lesson.id)) return 'completed';
  if (lesson.id === state.currentLessonId) return 'current';
  return 'locked';
}

function markerContent(status, order) {
  if (status === 'completed') return icons.check;
  if (status === 'locked') return icons.lock;
  return order; // current: tampilkan nomor lesson
}

export function renderLearningPath(container, { navigateTo }) {
  const state = getState();

  const stepsHtml = UNIT1.lessons
    .map((lesson) => {
      const status = getLessonStatus(lesson, state);
      const subtitle =
        status === 'completed'
          ? 'Selesai — ketuk untuk review'
          : status === 'current'
          ? 'Lanjutkan lesson ini'
          : 'Selesaikan lesson sebelumnya';

      return `
        <li class="lesson-step-wrapper">
          <button class="lesson-step" data-lesson-id="${lesson.id}" data-status="${status}">
            <span class="lesson-step__marker is-${status}">${markerContent(status, lesson.order)}</span>
            <span>
              <div class="lesson-step__title ${status === 'locked' ? 'is-locked' : ''}">${lesson.order}. ${lesson.title}</div>
              <div class="lesson-step__subtitle">${subtitle}</div>
            </span>
          </button>
        </li>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="path-header">
      <button class="path-language-select" data-action="switch-language">
        <span>Bahasa: ${UNIT1.language}</span>
        ${icons.chevronDown}
      </button>
      <div class="path-header__title">${UNIT1.title}</div>
      <div class="path-header__subtitle">Ikuti urutan lesson untuk membangun fondasi Bahasa Jawa.</div>
    </div>
    <ul class="path-list">${stepsHtml}</ul>
  `;

  container.querySelector('[data-action="switch-language"]').addEventListener('click', () => {
    showLanguageSheet({ navigateTo });
  });

  container.querySelectorAll('.lesson-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lessonId = btn.dataset.lessonId;
      const status = btn.dataset.status;
      const lesson = UNIT1.lessons.find((l) => l.id === lessonId);

      if (status === 'locked') {
        showToast(`${icons.lock} Selesaikan lesson sebelumnya dulu ya`);
        return;
      }
      if (!lesson.playable) {
        showToast(`${icons.star} Lesson ini masih "Coming Soon" di prototype ini`);
        return;
      }
      navigateTo('lesson', { lessonId: lesson.id });
    });
  });
}
