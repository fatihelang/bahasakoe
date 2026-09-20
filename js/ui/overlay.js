/*
  overlay.js
  Wadah dialog/sheet bersama (Language Sheet, Confirm Dialog): scrim, tutup
  lewat klik di luar atau Esc, fokus dipindahkan ke dalam dialog dan
  dikembalikan ke pemicu saat ditutup, Tab tidak keluar dari dialog.
  Satu implementasi supaya perilaku aksesibilitasnya identik di semua dialog.
*/

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function openOverlay(contentEl, { center = false, label = '' } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = `overlay${center ? ' overlay--center' : ''}`;

  contentEl.setAttribute('role', 'dialog');
  contentEl.setAttribute('aria-modal', 'true');
  if (label) contentEl.setAttribute('aria-label', label);

  backdrop.appendChild(contentEl);
  document.body.appendChild(backdrop);

  const previouslyFocused = document.activeElement;

  function close() {
    document.removeEventListener('keydown', onKeyDown);
    backdrop.remove();
    if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...contentEl.querySelectorAll(FOCUSABLE)];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener('keydown', onKeyDown);

  // Fokus awal: elemen bertanda data-autofocus, atau elemen interaktif pertama.
  const initial = contentEl.querySelector('[data-autofocus]') || contentEl.querySelector(FOCUSABLE);
  if (initial) initial.focus();

  return { close, backdrop };
}
