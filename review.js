/*
  review.js
  Tab "Ulas": tempat khusus untuk melatih ulang soal yang belum tepat.
  Sebelumnya fitur ini hanya muncul sebagai kartu di Home (kalau ada).
  Data tetap dari appState.getMissedItems, tidak ada state baru.
*/

import { getSelectedLanguage, getMissedItems } from '../state/appState.js';
import { getLesson } from '../data/curriculum.js';
import { relatedWords } from '../data/questionHelpers.js';
import { mascotHtml } from '../ui/mascot.js';
import { icons } from '../ui/icons.js';
import { pageHeader } from '../ui/pageHeader.js';

/** Jumlah soal yang masih bisa diulas + kata-kata terkaitnya (dipakai Home & Ulas). */
export function getReviewSummary(languageId) {
  let count = 0;
  const words = [];
  for (const item of getMissedItems(languageId)) {
    const lesson = getLesson(item.languageId, item.unitId, item.lessonId);
    const question = lesson && lesson.questions ? lesson.questions.find((q) => q.id === item.questionId) : null;
    if (!question) continue;
    count += 1;
    relatedWords(lesson, question).forEach((w) => { if (!words.includes(w)) words.push(w); });
  }
  return { count, words };
}

export function renderReview(container, { navigateTo }) {
  const language = getSelectedLanguage();
  const review = language.available ? getReviewSummary(language.id) : { count: 0, words: [] };

  const bodyHtml =
    review.count > 0
      ? `
      <div class="card card--static stack">
        <span class="card-top">
          <span class="icon-bubble" aria-hidden="true">${icons.repeat}</span>
          <span class="card-body">
            <span class="card-title">${review.count} soal siap diulas</span>
            <span class="card-text">Soal yang belum tepat di ${language.name}</span>
          </span>
        </span>
        <div class="stack stack--tight">
          <span class="t-eyebrow">Kata terkait</span>
          <ul class="chip-list">${review.words.map((w) => `<li class="chip">${w}</li>`).join('')}</ul>
        </div>
      </div>
      <button class="btn btn-primary btn-lg btn-block" data-action="start-review">Mulai Ulas</button>`
      : `
      <div class="empty-state">
        ${mascotHtml({ mood: 'happy', size: 'md' })}
        <h2 class="section-title">Belum ada yang perlu diulas</h2>
        <p class="t-support">Soal yang belum tepat akan muncul di sini supaya bisa kamu latih lagi tanpa tekanan.</p>
        <button class="btn btn-secondary" data-action="go-learn">Lanjut Belajar</button>
      </div>`;

  container.innerHTML = `
    <div class="screen review">
      ${pageHeader({ title: 'Ulas', subtitle: 'Latih lagi kata yang masih kurang tepat' })}
      ${bodyHtml}
    </div>
  `;

  const startBtn = container.querySelector('[data-action="start-review"]');
  if (startBtn) startBtn.addEventListener('click', () => navigateTo('lesson', { mode: 'review', languageId: language.id }));

  const learnBtn = container.querySelector('[data-action="go-learn"]');
  if (learnBtn) learnBtn.addEventListener('click', () => navigateTo('learn'));
}
