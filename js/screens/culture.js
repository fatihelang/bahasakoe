/*
  culture.js
  Tab Budaya — exploratory learning, TIDAK wajib jadi bagian lesson flow.
  Alur: daftar topik -> detail topik -> kembali ke daftar.

  STEP 4: konten sekarang mengikuti selectedLanguage (lewat
  getSelectedLanguage() dari appState.js, pola yang sama dipakai
  Home/Learning Path) -- BUKAN lagi satu CULTURE_TOPICS global yang selalu
  Jawa. Data diambil generik lewat getCultureTopics(languageId)/
  getCultureTopicById(languageId, topicId) dari js/data/culture/index.js;
  screen ini tidak pernah tahu ada file jawa.js/sunda.js secara langsung.

  Seperti sebelumnya, state list/detail disimpan lokal di closure ini
  (bukan LocalStorage) karena hanya untuk navigasi tampilan, bukan progress.
*/

import { getCultureTopics, getCultureTopicById } from '../data/culture/index.js';
import { getSelectedLanguage } from '../state/appState.js';
import { icons } from '../ui/icons.js';

export function renderCulture(container) {
  const language = getSelectedLanguage();
  const topics = getCultureTopics(language.id);

  const view = {
    mode: 'list', // 'list' | 'detail'
    topicId: null,
  };

  function renderList() {
    const cardsHtml = topics
      .map(
        (topic) => `
          <button class="culture-card" data-topic-id="${topic.id}">
            <span class="culture-card__icon icon-chip icon-chip--accent icon-chip--md">${icons[topic.icon]}</span>
            <span class="culture-card__text">
              <span class="culture-card__title">${topic.title}</span>
              <span class="culture-card__description">${topic.description}</span>
            </span>
          </button>
        `
      )
      .join('');

    container.innerHTML = `
      <div class="culture-header">
        <div class="culture-header__title">Budaya ${language.name.replace('Bahasa ', '')}</div>
        <p class="culture-header__subtitle">Jelajahi konteks di balik bahasa yang kamu pelajari.</p>
      </div>
      <div class="culture-list">${cardsHtml}</div>
    `;

    container.querySelectorAll('.culture-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        view.mode = 'detail';
        view.topicId = btn.dataset.topicId;
        renderCurrentView();
      });
    });
  }

  function renderDetail() {
    const topic = getCultureTopicById(language.id, view.topicId);

    if (!topic) {
      // Jaga-jaga kalau topicId tidak valid — kembali ke daftar daripada layar kosong.
      view.mode = 'list';
      renderCurrentView();
      return;
    }

    container.innerHTML = `
      <div class="culture-detail">
        <button class="culture-detail__back" data-action="back">${icons.chevronLeft} Budaya</button>
        <div class="culture-detail__icon icon-chip icon-chip--accent icon-chip--lg">${icons[topic.icon]}</div>
        <h2 class="culture-detail__title">${topic.title}</h2>
        <p class="culture-detail__content">${topic.content}</p>
      </div>
    `;

    container.querySelector('[data-action="back"]').addEventListener('click', () => {
      view.mode = 'list';
      renderCurrentView();
    });
  }

  function renderCurrentView() {
    if (view.mode === 'detail') return renderDetail();
    return renderList();
  }

  renderCurrentView();
}
