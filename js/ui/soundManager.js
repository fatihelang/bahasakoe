/*
  soundManager.js
  SFX ringan untuk lesson player, dibuat murni lewat Web Audio API
  (oscillator sederhana) -- TIDAK ada file audio yang diambil dari mana
  pun, jadi tidak nambah dependency atau request jaringan sama sekali.

  Preferensi ON/OFF disimpan di LocalStorage TERPISAH dari
  bahasakoe_state_v1 (lihat appState.js) -- sengaja begitu supaya
  soundManager tidak perlu tahu apa pun soal bentuk state/progress
  aplikasi, dan appState.js tetap satu-satunya pemilik data progress.

  Browser sering memblokir AudioContext sebelum ada interaksi user.
  Di sini AudioContext baru dibuat pas play*() pertama kali dipanggil --
  dan setiap pemanggil play*() di lesson.js selalu terjadi di dalam
  event handler klik/tap, jadi "izin" itu otomatis terpenuhi secara natural.
*/

const SOUND_PREF_KEY = 'bahasakoe_sound_pref_v1';

let audioCtx = null;

function getAudioContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

export function isSoundEnabled() {
  try {
    const raw = localStorage.getItem(SOUND_PREF_KEY);
    return raw === null ? true : raw === 'on'; // default ON
  } catch (err) {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? 'on' : 'off');
  } catch (err) {
    // LocalStorage tidak tersedia (mis. mode privat) -- diamkan saja,
    // preferensi cuma tidak akan bertahan lintas sesi.
  }
}

// Satu nada pendek sederhana -- amplop volume selalu fade out cepat supaya
// tidak ada "klik" kasar di ujung nada dan tetap terasa subtle.
function playTone({ frequency, duration = 0.12, type = 'sine', startGain = 0.09, delay = 0 }) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(startGain, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playSelect() {
  playTone({ frequency: 520, duration: 0.07, type: 'sine', startGain: 0.05 });
}

// Tap generik untuk button navigasi/CTA biasa (Home, Belajar, Unit, Culture,
// Profile, Language selector, Back, Forward, CTA) -- lebih pelan & lebih
// pendek dari playSelect() supaya terasa jelas beda "cuma pindah layar" vs
// "memilih jawaban". Dipanggil lewat satu listener global (lihat main.js),
// BUKAN dipanggil manual di tiap screen, supaya tidak ada kemungkinan lupa
// pasang di salah satu tombol.
export function playTap() {
  playTone({ frequency: 440, duration: 0.05, type: 'sine', startGain: 0.035 });
}

export function playCorrect() {
  playTone({ frequency: 660, duration: 0.11, type: 'sine', startGain: 0.08 });
  playTone({ frequency: 880, duration: 0.14, type: 'sine', startGain: 0.07, delay: 0.09 });
}

export function playWrong() {
  playTone({ frequency: 220, duration: 0.16, type: 'sine', startGain: 0.06 });
}

export function playComplete() {
  playTone({ frequency: 523, duration: 0.12, type: 'sine', startGain: 0.08 });
  playTone({ frequency: 659, duration: 0.12, type: 'sine', startGain: 0.08, delay: 0.1 });
  playTone({ frequency: 784, duration: 0.22, type: 'sine', startGain: 0.08, delay: 0.2 });
}
