/*
  lesson.js
  Lesson player — satu-satunya tempat alur inti BahasaKoe dijalankan:
  Learning Content -> Question -> Feedback -> ... -> Lesson Complete.

  Prinsip: Question SELALU diikuti Feedback dengan explanation.
  Context dan Culture Insight hanya dirender kalau memang ada di data
  lesson (lihat data/unit1.js) — tidak dipaksakan di setiap soal.

  State per-sesi (step, index pertanyaan, jumlah benar) disimpan sebagai
  variabel lokal di closure ini, BUKAN di LocalStorage. LocalStorage
  (lewat appState.js) hanya disentuh sekali, saat lesson benar-benar
  selesai (completeLesson).
*/

import { getLessonById } from '../data/unit1.js';
import { completeLesson, isLessonCompleted } from '../state/appState.js';

export function renderLesson(container, { navigateTo }, params = {}) {
  const lesson = getLessonById(params.lessonId);

  if (!lesson || !lesson.playable) {
    // Jaga-jaga kalau renderLesson dipanggil dengan id yang tidak valid/belum playable.
    navigateTo('learn');
    return;
  }

  const session = {
    step: 'content', // 'content' | 'question' | 'feedback' | 'complete'
    questionIndex: 0,
    correctCount: 0,
    lastSelectedIndex: null,
  };

  function sessionHeader(progressPercent) {
    return `
      <div class="lesson-session__header">
        <button class="lesson-session__exit" data-action="exit" aria-label="Keluar dari lesson">✕</button>
        <div class="progress-track lesson-session__progress">
          <div class="progress-fill" style="width:${progressPercent}%"></div>
        </div>
      </div>
    `;
  }

  function bindExit() {
    const exitBtn = container.querySelector('[data-action="exit"]');
    if (exitBtn) exitBtn.addEventListener('click', () => navigateTo('learn'));
  }

  function renderContentStep() {
    const itemsHtml = lesson.learningContent
      .map(
        (item) => `
          <li class="learning-item">
            <div class="learning-item__jawa">${item.jawa}</div>
            <div class="learning-item__arti">${item.arti}</div>
          </li>
        `
      )
      .join('');

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(0)}
        <div class="lesson-session__title">${lesson.title}</div>
        <p class="lesson-session__objective">${lesson.objective}</p>
        <ul class="learning-content-list">${itemsHtml}</ul>
        <button class="btn btn-primary lesson-session__cta" data-action="start-questions">Mulai Latihan</button>
      </div>
    `;

    bindExit();
    container.querySelector('[data-action="start-questions"]').addEventListener('click', () => {
      session.step = 'question';
      renderCurrentStep();
    });
  }

  function renderQuestionStep() {
    const question = lesson.questions[session.questionIndex];
    const totalQuestions = lesson.questions.length;

    const optionsHtml = question.options
      .map((opt, i) => `<button class="question-option" data-index="${i}">${opt}</button>`)
      .join('');

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader((session.questionIndex / totalQuestions) * 100)}
        <div class="question-prompt">${question.prompt}</div>
        <div class="question-options">${optionsHtml}</div>
      </div>
    `;

    bindExit();
    container.querySelectorAll('.question-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedIndex = Number(btn.dataset.index);
        session.lastSelectedIndex = selectedIndex;
        if (selectedIndex === question.correctIndex) {
          session.correctCount += 1;
        }
        session.step = 'feedback';
        renderCurrentStep();
      });
    });
  }

  function renderFeedbackStep() {
    const question = lesson.questions[session.questionIndex];
    const isCorrect = session.lastSelectedIndex === question.correctIndex;
    const totalQuestions = lesson.questions.length;

    container.innerHTML = `
      <div class="lesson-session">
        ${sessionHeader(((session.questionIndex + 1) / totalQuestions) * 100)}
        <div class="feedback-panel ${isCorrect ? 'is-correct' : 'is-gentle-wrong'}">
          <div class="feedback-panel__status">${isCorrect ? 'Benar! 🎉' : 'Kurang tepat'}</div>
          <p class="feedback-panel__explanation">${question.explanation}</p>
          ${question.context ? `<div class="feedback-panel__context"><strong>Konteks:</strong> ${question.context}</div>` : ''}
          ${question.cultureInsight ? `<div class="feedback-panel__culture"><strong>Wawasan Budaya:</strong> ${question.cultureInsight}</div>` : ''}
        </div>
        <button class="btn btn-primary lesson-session__cta" data-action="continue">Lanjut</button>
      </div>
    `;

    bindExit();
    container.querySelector('[data-action="continue"]').addEventListener('click', () => {
      const isLastQuestion = session.questionIndex >= lesson.questions.length - 1;
      if (isLastQuestion) {
        session.step = 'complete';
      } else {
        session.questionIndex += 1;
        session.step = 'question';
      }
      renderCurrentStep();
    });
  }

  function renderCompleteStep() {
    // Kalau lesson ini sedang di-review (sudah completed sebelumnya), progress
    // dan XP TIDAK ditulis ulang — supaya review tidak menggandakan XP.
    const wasAlreadyCompleted = isLessonCompleted(lesson.id);
    const earnedXP = wasAlreadyCompleted ? 0 : completeLesson(lesson.id, session.correctCount, lesson.questions.length).earnedXP;

    container.innerHTML = `
      <div class="lesson-session lesson-complete">
        <div class="lesson-complete__icon">🎉</div>
        <div class="lesson-complete__title">Lesson Selesai!</div>
        <p class="lesson-complete__stats">
          ${session.correctCount}/${lesson.questions.length} benar
          ${wasAlreadyCompleted ? '&middot; (mode review)' : `&middot; +${earnedXP} XP`}
        </p>
        <button class="btn btn-primary lesson-session__cta" data-action="finish">Lanjutkan</button>
      </div>
    `;

    container.querySelector('[data-action="finish"]').addEventListener('click', () => navigateTo('learn'));
  }

  function renderCurrentStep() {
    if (session.step === 'content') return renderContentStep();
    if (session.step === 'question') return renderQuestionStep();
    if (session.step === 'feedback') return renderFeedbackStep();
    if (session.step === 'complete') return renderCompleteStep();
  }

  renderCurrentStep();
}
