/*
  learningPath.js
  Layar Belajar: daftar UNIT untuk bahasa yang sedang aktif, dalam urutan
  kurikulum yang TETAP (Unit 1 -> 2 -> 3, tidak pernah diurutkan ulang
  berdasarkan status). Visual: Learning Card dari brand guide.

  Status per unit:
  - 'completed': semua lesson playable selesai. Tetap bisa dibuka (review).
  - 'current'  : unit yang sama dengan getCurrentUnit() -> paling menonjol.
  - 'locked'   : belum waktunya. Netral & tidak interaktif (bukan <button>),
                 alasannya tertulis langsung di kartu.

  getCurrentUnit() hanya dipakai untuk MENANDAI unit current secara visual,
  bukan untuk memfilter unit mana yang ditampilkan/boleh diklik.
*/

import { getSelectedLanguage, getCurrentUnit, getUnitProgress, isLessonCompleted } from '../state/appState.js';
import { getUnitsForLanguage } from '../data/curriculum.js';
import { DEFAULT_LANGUAGE_ID } from '../data/languages.js';
import { icons } from '../ui/icons.js';
import { pageHeader } from '../ui/pageHeader.js';
import { showLanguageSheet, languageInitial } from '../ui/languageSheet.js';

// Bahasa yang belum punya unit sama sekali jatuh ke daftar unit Bahasa Jawa
// (perilaku lama dipertahankan).
function resolveContentLanguageId(language) {
  return getUnitsForLanguage(language.id).length > 0 ? language.id : DEFAULT_LANGUAGE_ID;
}

function getUnitStatus(unit, contentLanguageId, currentUnit) {
  const playableLessons = unit.lessons.filter((l) => l.playable);
  const isCompleted =
    playableLessons.length > 0 && playableLessons.every((l) => isLessonCompleted(contentLanguageId, unit.id, l.id));

  if (isCompleted) return 'completed';
  if (currentUnit && unit.id === currentUnit.id) return 'current';
  return 'locked';
}

const BADGE_LABEL = { completed: 'Selesai', current: 'Sedang dipelajari', locked: 'Terkunci' };
const BADGE_ICON = { completed: icons.check, current: '', locked: icons.lock };

function unitCardHtml(unit, status, progress, index) {
  const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const bubbleClass = status === 'completed' ? 'icon-bubble--success' : status === 'locked' ? 'icon-bubble--locked' : '';
  const bubbleContent = status === 'completed' ? icons.check : status === 'locked' ? icons.lock : `<b>${unit.order}</b>`;

  const inner = `
    <span class="card-top">
      <span class="icon-bubble ${bubbleClass}" aria-hidden="true">${bubbleContent}</span>
      <span class="card-body">
        <span class="card-meta">
          <span class="t-eyebrow">Unit ${unit.order}</span>
          <span class="card-badge is-${status}">${BADGE_ICON[status]}${BADGE_LABEL[status]}</span>
        </span>
        <span class="card-title">${unit.title}</span>
      </span>
    </span>
    ${
      status === 'locked'
        ? `<span class="card-text">Selesaikan unit sebelumnya untuk membuka.</span>`
        : `<span class="stack stack--tight">
            <span class="card-progress-track" role="progressbar" aria-label="Progress Unit ${unit.order}" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.completed}">
              <span class="card-progress-fill" style="display:block;width:${percent}%"></span>
            </span>
            <span class="card-progress-label">${progress.completed} dari ${progress.total} lesson selesai${status === 'completed' ? ' · ketuk untuk review' : ''}</span>
          </span>`
    }
  `;

  const stateClass = `card card--learning path-item is-${status}`;
  const stagger = `style="--stagger:${index}"`;

  return status === 'locked'
    ? `<li class="stagger-in" ${stagger}><div class="${stateClass}">${inner}</div></li>`
    : `<li class="stagger-in" ${stagger}><button class="${stateClass} card-clickable" data-unit-id="${unit.id}">${inner}</button></li>`;
}

export function renderLearningPath(container, { navigateTo }) {
  const language = getSelectedLanguage();
  const contentLanguageId = resolveContentLanguageId(language);
  const units = getUnitsForLanguage(contentLanguageId);
  const currentUnit = getCurrentUnit(contentLanguageId);

  const cardsHtml = units
    .map((unit, index) =>
      unitCardHtml(unit, getUnitStatus(unit, contentLanguageId, currentUnit), getUnitProgress(contentLanguageId, unit.id), index)
    )
    .join('');

  container.innerHTML = `
    <div class="screen path">
      ${pageHeader({ title: 'Belajar', subtitle: `Ikuti urutan unit untuk membangun fondasi ${language.name}.` })}

      <div class="lang-selector">
        <div>
          <p class="lang-selector__label">Bahasa yang sedang dipelajari</p>
          <p class="lang-selector__current"><span class="lang-flag" aria-hidden="true">${languageInitial(language)}</span>${language.name}</p>
        </div>
        <button class="btn btn-secondary btn-sm" data-action="switch-language">Ganti Bahasa</button>
      </div>

      <ul class="path-list">${cardsHtml}</ul>
    </div>
  `;

  container.querySelector('[data-action="switch-language"]').addEventListener('click', () => {
    showLanguageSheet({ navigateTo });
  });

  container.querySelectorAll('[data-unit-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateTo('unitDetail', { languageId: contentLanguageId, unitId: btn.dataset.unitId });
    });
  });
}
