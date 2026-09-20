/*
  confetti.js
  Celebration terkontrol: ledakan confetti singkat murni DOM + CSS, dipicu
  HANYA untuk milestone besar (unit selesai, achievement baru), bukan untuk
  setiap jawaban benar atau setiap lesson biasa.

  Warna keping hanya dari token brand. Menghormati prefers-reduced-motion:
  tidak menambah elemen apa pun jika motion dikurangi.
*/

const CONFETTI_COLORS = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-culture)',
  'var(--color-primary-tint)',
];

/**
 * @param {HTMLElement} hostEl - elemen ber-position:relative tempat confetti jatuh.
 * @param {{ pieces?: number }} [options]
 */
export function burstConfetti(hostEl, { pieces = 18 } = {}) {
  if (!hostEl) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const stage = document.createElement('div');
  stage.className = 'confetti-stage';
  stage.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = `${Math.random() * 200}ms`;
    piece.style.setProperty('--confetti-duration', `${900 + Math.random() * 500}ms`);
    piece.style.setProperty('--confetti-spin', `${200 + Math.random() * 260}deg`);
    piece.style.setProperty('--confetti-drop', `${hostEl.clientHeight || 260}px`);
    stage.appendChild(piece);
  }

  hostEl.appendChild(stage);
  setTimeout(() => stage.remove(), 2000);
}
