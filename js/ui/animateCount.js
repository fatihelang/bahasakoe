/*
  animateCount.js
  REVISI UI "seperti game" -- angka statistik (XP, streak) dihitung naik
  dari 0 ke nilai akhir alih-alih langsung muncul statis, mirip counter XP
  di game. Murni requestAnimationFrame, tidak ada dependency baru.

  Menghormati prefers-reduced-motion: kalau direduksi, angka langsung
  ditulis final tanpa animasi (fungsi tetap memanggil onDone).
*/

/**
 * @param {HTMLElement} el - elemen teks yang isinya akan diganti.
 * @param {number} to - nilai akhir (integer).
 * @param {object} [options]
 * @param {string} [options.prefix] - teks sebelum angka, mis. "+".
 * @param {string} [options.suffix] - teks sesudah angka, mis. " XP".
 * @param {number} [options.duration] - durasi ms.
 * @param {() => void} [options.onDone] - dipanggil setelah animasi selesai.
 */
export function animateCount(el, to, options = {}) {
  const { prefix = '', suffix = '', duration = 700, onDone } = options;
  if (!el) return;

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || to <= 0) {
    el.textContent = `${prefix}${to}${suffix}`;
    if (onDone) onDone();
    return;
  }

  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out kubik -- melambat mendekati akhir, senada dengan --ease-pop
    // yang dipakai animasi lain di app ini (bukan linear datar).
    const eased = 1 - (1 - progress) ** 3;
    const current = Math.round(eased * to);
    el.textContent = `${prefix}${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else if (onDone) {
      onDone();
    }
  }

  requestAnimationFrame(tick);
}
