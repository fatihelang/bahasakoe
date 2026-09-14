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

  // Topik pertama ditampilkan sebagai "featured" (lebih besar, jadi pintu
  // masuk utama) -- sisanya jadi grid topic cards di bawahnya. Ini murni
  // presentasi; data topics tetap satu array yang sama dari
  // js/data/culture/index.js, tidak ada data baru yang dikarang.
  function renderList() {
    const [featured, ...rest] = topics;

    const featuredHtml = featured
      ? `
        <button class="culture-featured" data-topic-id="${featured.id}">
          <span class="culture-featured__icon icon-chip icon-chip--accent icon-chip--lg">${icons[featured.icon]}</span>
          <span class="culture-featured__text">
            <span class="culture-featured__eyebrow">Topik pilihan</span>
            <span class="culture-featured__title">${featured.title}</span>
            <span class="culture-featured__description">${featured.description}</span>
          </span>
          <span class="culture-featured__cta">Pelajari ${icons.chevronRight}</span>
        </button>
      `
      : '';

    const cardsHtml = rest
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
      ${featuredHtml}
      ${rest.length > 0 ? '<h2 class="section-title culture-list__title">Topik lainnya</h2>' : ''}
      <div class="culture-list">${cardsHtml}</div>
    `;

    container.querySelectorAll('[data-topic-id]').forEach((btn) => {
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

    // "highlights" opsional (lihat js/data/culture/index.js) -- kalau ada,
    // ditampilkan sebagai kartu kecil berdampingan SEBELUM paragraf penuh,
    // supaya detail tidak cuma satu blok teks panjang. Kalau tidak ada,
    // cukup lewati bagian ini; content tetap tampil seperti sebelumnya.
    const highlightsHtml = topic.highlights && topic.highlights.length
      ? `
        <div class="culture-detail__highlights">
          ${topic.highlights
            .map(
              (h) => `
                <div class="culture-highlight">
                  <span class="culture-highlight__label">${h.label}</span>
                  <p class="culture-highlight__text">${h.text}</p>
                </div>
              `
            )
            .join('')}
        </div>
      `
      : '';

    container.innerHTML = `
      <div class="culture-detail">
        <button class="culture-detail__back" data-action="back">${icons.chevronLeft} Budaya</button>
        <div class="culture-detail__icon icon-chip icon-chip--accent icon-chip--lg">${icons[topic.icon]}</div>
        <h2 class="culture-detail__title">${topic.title}</h2>
        <p class="culture-detail__lead">${topic.description}</p>
        ${highlightsHtml}
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
