/*
  toast.js
  Notifikasi kecil yang muncul sebentar di bawah layar,
  dipakai misalnya saat user tap lesson yang masih terkunci.
*/

let toastEl = null;
let hideTimeout = null;

function ensureToastElement() {
  if (toastEl) return toastEl;
  toastEl = document.createElement('div');
  toastEl.className = 'toast';
  document.body.appendChild(toastEl);
  return toastEl;
}

export function showToast(message, duration = 2200) {
  const el = ensureToastElement();
  el.textContent = message;

  // Trigger reflow supaya transisi CSS jalan meski toast dipanggil berkali-kali
  el.classList.remove('is-visible');
  void el.offsetWidth;
  el.classList.add('is-visible');

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    el.classList.remove('is-visible');
  }, duration);
}
