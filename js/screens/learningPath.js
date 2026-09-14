/*
  learningPath.js
  Merender daftar UNIT untuk bahasa yang sedang aktif (bukan langsung daftar
  lesson satu unit tertentu).

  BUG FIX (setelah Unit 2 ditambahkan): versi sebelumnya file ini langsung
  me-resolve SATU unit lewat getCurrentUnit() lalu merender lesson-list milik
  unit itu saja. Begitu semua lesson playable Unit 1 selesai, getCurrentUnit
  mengembalikan Unit 2 -- sehingga layar ini (satu-satunya jalan masuk ke
  Unit Detail) cuma pernah menunjuk ke Unit 2, dan Unit 1 jadi tidak
  ter-reach dari UI manapun. getCurrentUnit() TIDAK BOLEH dipakai untuk
  menentukan unit mana yang BOLEH dibuka -- ia cuma menjawab "unit mana yang
  jadi fokus belajar berikutnya" (dipakai Home untuk CTA "Lanjutkan
  Belajar"). Di sini currentUnit hanya dipakai untuk MENANDAI salah satu
  unit sebagai "current" secara visual, bukan untuk memfilter unit mana yang
  ditampilkan/bisa diklik.

  Status per unit:
  - 'completed': semua lesson playable di unit itu sudah completed. Unit
    completed TETAP clickable (lihat unitDetail.js -- tidak ada perubahan
    di sana, ia sudah generik menerima unitId apa pun).
  - 'current': unit yang sama dengan getCurrentUnit(languageId).
  - 'locked': selain dua kondisi di atas (unit yang belum waktunya, karena
    unit sebelumnya belum selesai).

  Reuse komponen .lesson-step/.lesson-step-wrapper yang sudah ada (dipakai
  juga oleh unitDetail.js untuk daftar lesson) -- TIDAK ADA CSS BARU yang
  ditambahkan, komponen itu sudah generik ("item bertimeline dengan marker +
  judul + subtitle"), cuma sekarang isinya Unit, bukan Lesson.
*/

import { getSelectedLanguage, getCurrentUnit, isLessonCompleted } from '../state/appState.js';
import { getUnitsForLanguage } from '../data/curriculum.js';
import { DEFAULT_LANGUAGE_ID } from '../data/languages.js';
import { icons } from '../ui/icons.js';
import { showToast } from '../ui/toast.js';
import { showLanguageSheet } from '../ui/languageSheet.js';

// Bahasa yang belum punya unit sama sekali (mis. Sunda saat ini) -- fallback
// ke daftar unit Bahasa Jawa. SENGAJA MEREPLIKASI PERILAKU LAMA (file ini
// sebelum bug fix juga fallback ke Jawa dengan cara yang sama), bukan
// perilaku baru.
function resolveContentLanguageId(language) {
  const units = getUnitsForLanguage(language.id);
  return units.length > 0 ? language.id : DEFAULT_LANGUAGE_ID;
}

function getUnitStatus(unit, contentLanguageId, currentUnit) {
  const playableLessons = unit.lessons.filter((l) => l.playable);
  const isCompleted =
    playableLessons.length > 0 &&
    playableLessons.every((l) => isLessonCompleted(contentLanguageId, unit.id, l.id));

  if (isCompleted) return 'completed';
  if (currentUnit && unit.id === currentUnit.id) return 'current';
  return 'locked';
}

export function renderLearningPath(container, { navigateTo }) {
  const language = getSelectedLanguage();
  const contentLanguageId = resolveContentLanguageId(language);
  const units = getUnitsForLanguage(contentLanguageId);
  const currentUnit = getCurrentUnit(contentLanguageId);

  const stepsHtml = units
    .map((unit) => {
      const status = getUnitStatus(unit, contentLanguageId, currentUnit);
      const subtitle =
        status === 'completed'
          ? 'Selesai, ketuk untuk review'
          : status === 'current'
          ? 'Lanjutkan unit ini'
          : 'Selesaikan unit sebelumnya';
      const marker = status === 'completed' ? icons.check : status === 'locked' ? icons.lock : unit.order;

      return `
        <li class="lesson-step-wrapper">
          <button class="lesson-step" data-unit-id="${unit.id}" data-status="${status}">
            <span class="lesson-step__timeline" aria-hidden="true">
              <span class="lesson-step__line lesson-step__line--top"></span>
              <span class="lesson-step__marker is-${status}">${marker}</span>
              <span class="lesson-step__line lesson-step__line--bottom"></span>
            </span>
            <span class="lesson-step__body">
              <div class="lesson-step__title ${status === 'locked' ? 'is-locked' : ''}">Unit ${unit.order}: ${unit.title}</div>
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
        <span>Bahasa: ${language.name}</span>
        ${icons.chevronDown}
      </button>
      <div class="path-header__title">Belajar</div>
      <div class="path-header__subtitle">Ikuti urutan unit untuk membangun fondasi ${language.name}.</div>
    </div>
    <ul class="path-list">${stepsHtml}</ul>
  `;

  container.querySelector('[data-action="switch-language"]').addEventListener('click', () => {
    showLanguageSheet({ navigateTo });
  });

  container.querySelectorAll('.lesson-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const unitId = btn.dataset.unitId;
      const status = btn.dataset.status;

      if (status === 'locked') {
        showToast(`${icons.lock} Selesaikan unit sebelumnya dulu ya`);
        return;
      }
      navigateTo('unitDetail', { languageId: contentLanguageId, unitId });
    });
  });
}
