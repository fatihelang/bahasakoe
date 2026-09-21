/*
  home.js
  Layar Home: menjawab satu pertanyaan, "Apa yang harus saya lakukan sekarang?"

  Urutan (lihat Screen Composition di brand guide):
  1. Lesson sekarang + satu CTA utama (kartu merah, elemen paling menonjol)
  2. Progress unit (ringkas, di dalam kartu yang sama)
  3. Pendukung yang ringan, sengaja bukan dashboard:
     - pemilih bahasa (pil kecil di bawah header)
     - XP & streak (chip di header)
     - "Kata hari ini" dan "Pencapaian berikutnya"
  Di antaranya: maskot + gelembung ucapan singkat, dan kartu "Ulas kata yang
  salah" (hanya muncul bila ada soal yang perlu diulas).

  Semua isi dibangun dari data yang sudah ada (curriculum, badges, appState);
  Home tidak menyimpan state sendiri. Unit & lesson "sekarang" selalu
  mengikuti bahasa yang sedang dipilih.
*/

import {
  getState, getUnitProgress, isLessonCompleted, getCurrentLessonId,
  getSelectedLanguage, setSelectedLanguage, getCurrentUnit, getBadgesWithStatus,
} from '../state/appState.js';
import { getLesson } from '../data/curriculum.js';
import { getReviewSummary } from './review.js';
import { mascotHtml } from '../ui/mascot.js';
import { icons } from '../ui/icons.js';
import { pageHeader } from '../ui/pageHeader.js';
import { showLanguageSheet, languageInitial } from '../ui/languageSheet.js';

function statChips(state) {
  return `
    <span class="chip ${state.streak > 0 ? '' : 'is-inactive'}" role="img" aria-label="Streak ${state.streak} hari">${icons.flame}<span>${state.streak}</span></span>
    <span class="chip" role="img" aria-label="${state.xp} XP">${icons.zap}<span>${state.xp}</span></span>
  `;
}

/**
 * Kata hari ini: satu kata dari lesson yang SUDAH kamu selesaikan di unit ini
 * (atau dari lesson pertama bila belum ada yang selesai). Pilihannya tetap
 * sepanjang hari (berdasarkan nomor hari), lalu berganti keesokan harinya.
 */
function pickWordOfTheDay(languageId, unit) {
  const playable = unit.lessons.filter((l) => l.playable && l.learningContent && l.learningContent.length > 0);
  if (playable.length === 0) return null;

  const completed = playable.filter((l) => isLessonCompleted(languageId, unit.id, l.id));
  const source = completed.length > 0 ? completed : [playable[0]];
  const pool = source.flatMap((l) => l.learningContent);

  const dayNumber = Math.floor(Date.now() / 86400000);
  return pool[dayNumber % pool.length];
}

// Kalimat singkat maskot, hanya Bahasa Indonesia (tidak membuat klaim kebahasaan).
function mascotMessage({ isFirstTime, hasReview, streak }) {
  if (isFirstTime) return 'Yuk, mulai lesson pertamamu!';
  if (hasReview) return 'Ada soal yang bisa kamu ulas. Yuk!';
  if (streak >= 3) return 'Streak-mu keren! Terus lanjut ya.';
  return 'Lanjut belajar yuk!';
}

export function renderHome(container, { navigateTo }) {
  const state = getState();
  const language = getSelectedLanguage();

  const activeUnit = language.available ? getCurrentUnit(language.id) : null;
  const progress = activeUnit ? getUnitProgress(language.id, activeUnit.id) : { completed: 0, total: 0 };
  const nextLesson = activeUnit
    ? getLesson(language.id, activeUnit.id, getCurrentLessonId(language.id, activeUnit.id)) || activeUnit.lessons[0]
    : null;

  const isFirstTime = activeUnit ? progress.completed === 0 : true;
  // Semua lesson playable sudah selesai: currentLessonId menunjuk lesson
  // terakhir, jadi CTA-nya berubah dari "lanjutkan" jadi "ulas".
  const isReviewing =
    !isFirstTime && activeUnit && nextLesson ? isLessonCompleted(language.id, activeUnit.id, nextLesson.id) : false;

  const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const heroHtml =
    language.available && activeUnit
      ? `
      <button class="card card--featured card-clickable home-hero" data-action="continue-learning">
        <span class="home-hero__head">
          <span class="t-eyebrow">${language.name} · Unit ${activeUnit.order}</span>
          <span class="card-title">${
            isFirstTime
              ? 'Mulai lesson pertamamu'
              : isReviewing
              ? `Ulas kembali: ${nextLesson.title}`
              : `Lanjutkan: ${nextLesson.title}`
          }</span>
          <span class="card-text">${activeUnit.title}</span>
        </span>
        <span class="home-hero__progress">
          <span class="card-progress-track" role="progressbar" aria-label="Progress unit" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.completed}">
            <span class="card-progress-fill" style="display:block;width:${percent}%"></span>
          </span>
          <span class="card-progress-label">${progress.completed} dari ${progress.total} lesson selesai</span>
        </span>
        <span class="card-cta" aria-hidden="true">${isFirstTime ? 'Mulai Belajar' : isReviewing ? 'Ulas Lagi' : 'Lanjutkan Belajar'}${icons.chevronRight}</span>
      </button>
    `
      : `
      <div class="card card--featured home-hero">
        <span class="home-hero__head">
          <span class="t-eyebrow">${language.name}</span>
          <span class="card-title">${language.name} segera hadir</span>
        </span>
        <button class="btn btn-secondary" data-action="go-jawa">Belajar Bahasa Jawa</button>
      </div>
    `;

  // ---- Ulas kata yang salah (hanya bila ada) ----
  const review = language.available ? getReviewSummary(language.id) : { count: 0, words: [] };
  const reviewHtml =
    review.count > 0
      ? `
      <button class="card card-clickable home-review stagger-in" data-tone="violet" style="--stagger:0" data-action="start-review">
        <span class="card-top">
          <span class="icon-bubble" aria-hidden="true">${icons.repeat}</span>
          <span class="card-body">
            <span class="card-meta">
              <span class="t-eyebrow">Ulas</span>
              <span class="card-badge is-current">${review.count} soal</span>
            </span>
            <span class="card-title">Ulas kata yang salah</span>
            <span class="card-text">${review.words.length > 0 ? review.words.join(', ') : 'Coba lagi soal yang belum tepat'}</span>
          </span>
        </span>
      </button>`
      : '';

  // ---- Pendukung ringan (bukan dashboard) ----
  const word = activeUnit ? pickWordOfTheDay(language.id, activeUnit) : null;
  const wordHtml = word
    ? `
      <div class="card card--static home-row stagger-in" data-tone="sky" style="--stagger:1">
        <span class="icon-bubble" aria-hidden="true">${icons.book}</span>
        <span class="card-body">
          <span class="t-eyebrow">Kata hari ini</span>
          <span class="home-row__native">${word.native}</span>
          <span class="home-row__support">${word.arti}</span>
        </span>
      </div>`
    : '';

  const nextBadge = getBadgesWithStatus().find((b) => !b.earned);
  const badgeHtml = nextBadge
    ? `
      <div class="card card--static home-row stagger-in" data-tone="pink" style="--stagger:2">
        <span class="icon-bubble" aria-hidden="true">${icons[nextBadge.icon]}</span>
        <span class="card-body">
          <span class="t-eyebrow">Pencapaian berikutnya</span>
          <span class="card-title">${nextBadge.title}</span>
          <span class="card-text">${nextBadge.description}</span>
        </span>
      </div>`
    : '';

  container.innerHTML = `
    <div class="screen home">
      ${pageHeader({ title: 'Halo!', action: statChips(state) })}
      <div class="home-mascot">
        ${mascotHtml({ mood: 'wave', size: 'md' })}
        <p class="speech-bubble">${mascotMessage({ isFirstTime, hasReview: review.count > 0, streak: state.streak })}</p>
      </div>
      <button class="chip chip--button home-lang" data-action="switch-language" aria-label="Ganti bahasa. Sekarang: ${language.name}">
        <span class="lang-flag" aria-hidden="true">${languageInitial(language)}</span>
        <span>${language.name}</span>
        ${icons.chevronDown}
      </button>
      ${heroHtml}
      ${reviewHtml}
      ${wordHtml}
      ${badgeHtml}
    </div>
  `;

  const continueBtn = container.querySelector('[data-action="continue-learning"]');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (nextLesson.playable) {
        navigateTo('lesson', { languageId: language.id, unitId: activeUnit.id, lessonId: nextLesson.id });
      } else {
        navigateTo('learn');
      }
    });
  }

  const reviewBtn = container.querySelector('[data-action="start-review"]');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => navigateTo('lesson', { mode: 'review', languageId: language.id }));
  }

  // Ganti bahasa dari Home: tetap di Home setelah memilih.
  container.querySelector('[data-action="switch-language"]').addEventListener('click', () => {
    showLanguageSheet({ navigateTo, destination: 'home' });
  });

  const goJawaBtn = container.querySelector('[data-action="go-jawa"]');
  if (goJawaBtn) {
    goJawaBtn.addEventListener('click', () => {
      setSelectedLanguage('jawa');
      navigateTo('home');
    });
  }
}
