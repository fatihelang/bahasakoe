/*
  onboarding.js
  Layar Onboarding: tutorial singkat 4 slide untuk pemain yang BENAR-BENAR
  baru pertama kali membuka BahasaKoe, supaya tidak bingung dengan konsep
  lesson, filosofi "Mistakes Are Learning" (tanpa hearts/lives), dan
  XP/streak/achievement, sebelum masuk ke Home.

  Kapan tampil (diatur ONBOARDING_MODE di bawah, dibaca main.js):
  - 'always' (BAWAAN SEKARANG): muncul SETIAP kali aplikasi dibuka, juga
    untuk pemain yang sudah pernah berkunjung, supaya fitur onboarding
    selalu diperkenalkan. Bisa dilewati dengan "Lewati". Konsekuensinya,
    memuat ulang halaman (refresh) juga memunculkannya lagi.
  - 'once': hanya jika appState.hasSeenOnboarding() masih false. Setelah
    slide terakhir atau "Lewati" ditekan, markOnboardingSeen() dipanggil
    sehingga tidak muncul otomatis lagi.
  - Bisa dibuka ULANG kapan saja lewat Profil > Pengaturan > "Lihat
    tutorial lagi" (lihat profile.js), dengan params.replay = true. Dalam
    mode replay: tombol "Lewati"/selesai kembali ke Profil, BUKAN ke Home,
    dan tidak menyentuh status onboardingSeen (sudah true).

  Pola layar meniru "focused session" ala lesson.js (tanpa bottom nav,
  lihat NAV_SCREENS di router.js): header ringan + konten di tengah + dock
  CTA di bawah, supaya konsisten secara visual dengan Lesson Intro.

  Maskot: pakai size 'xl' (lihat js/ui/mascot.js & css/components.css) --
  sengaja diberi porsi visual besar karena maskot final kemungkinan berupa
  karakter orang (bukan ikon kecil), jadi Onboarding jadi tempat wajar
  untuk maskot tampil paling besar di seluruh aplikasi.
*/

import { markOnboardingSeen } from '../state/appState.js';

/**
 * 'always' = onboarding tampil di setiap pembukaan aplikasi (bawaan).
 * 'once'   = hanya untuk pemain yang belum pernah melihatnya.
 * Ganti satu nilai ini untuk mengubah perilaku seluruh aplikasi.
 */
export const ONBOARDING_MODE = 'always';
import { mascotHtml } from '../ui/mascot.js';
import { icons } from '../ui/icons.js';

const SLIDES = [
  {
    mood: 'wave',
    eyebrow: 'Sugeng rawuh',
    title: 'Selamat datang di BahasaKoe!',
    body: 'Belajar bahasa & budaya daerah Nusantara lewat lesson singkat yang langsung dipraktikkan. Aku akan menemanimu selama belajar.',
  },
  {
    mood: 'think',
    eyebrow: 'Cara belajarnya',
    title: 'Kata baru, lalu langsung latihan',
    body: 'Tiap lesson dibuka dengan beberapa kata atau kalimat baru, lalu langsung dipraktikkan lewat soal singkat. Kadang ada momen kecil mengenal budayanya juga.',
  },
  {
    mood: 'happy',
    eyebrow: 'Kalau salah?',
    title: 'Salah itu wajar, bukan hukuman',
    body: 'Tidak ada nyawa yang berkurang saat jawabanmu meleset. Soal yang salah otomatis masuk daftar "Ulas", jadi kamu bisa coba lagi kapan saja tanpa terburu-buru.',
  },
  {
    mood: 'cheer',
    eyebrow: 'Progressmu',
    title: 'Kumpulkan XP, jaga streak-mu',
    body: 'Tiap jawaban benar menambah XP, dan belajar tiap hari menjaga streak tetap menyala. Progress dan achievement selalu bisa dilihat di Profil.',
  },
];

export function renderOnboarding(container, { navigateTo }, params = {}) {
  const isReplay = Boolean(params.replay);
  let index = 0;

  function finish() {
    if (!isReplay) markOnboardingSeen();
    navigateTo(isReplay ? 'profile' : 'home');
  }

  function dotsHtml() {
    return `
      <div class="onboarding-dots" role="tablist" aria-label="Progress tutorial">
        ${SLIDES.map(
          (_, i) => `<span class="onboarding-dot ${i === index ? 'is-active' : ''}" role="presentation"></span>`
        ).join('')}
      </div>`;
  }

  function render() {
    const slide = SLIDES[index];
    const isLast = index === SLIDES.length - 1;
    const isFirst = index === 0;

    container.innerHTML = `
      <div class="onboarding-session">
        <div class="onboarding-header">
          <button class="icon-btn" data-action="onboarding-back" aria-label="Slide sebelumnya" ${isFirst ? 'disabled' : ''}>${icons.chevronLeft}</button>
          <button class="btn btn-tertiary btn-sm" data-action="onboarding-skip">Lewati</button>
        </div>
        <div class="onboarding-main">
          ${mascotHtml({ mood: slide.mood, size: 'xl', className: 'onboarding-mascot' })}
          <span class="t-eyebrow">${slide.eyebrow}</span>
          <h1 class="onboarding-title" tabindex="-1" data-focus-target>${slide.title}</h1>
          <p class="onboarding-body">${slide.body}</p>
        </div>
        <div class="onboarding-dock">
          ${dotsHtml()}
          <button class="btn btn-primary btn-lg btn-block" data-action="onboarding-next">${isLast ? 'Mulai Belajar' : 'Lanjut'}</button>
        </div>
      </div>`;

    const target = container.querySelector('[data-focus-target]');
    if (target) target.focus({ preventScroll: true });

    const backBtn = container.querySelector('[data-action="onboarding-back"]');
    if (backBtn && !isFirst) {
      backBtn.addEventListener('click', () => {
        index -= 1;
        render();
      });
    }

    container.querySelector('[data-action="onboarding-skip"]').addEventListener('click', finish);

    container.querySelector('[data-action="onboarding-next"]').addEventListener('click', () => {
      if (isLast) {
        finish();
        return;
      }
      index += 1;
      render();
    });
  }

  render();
}
