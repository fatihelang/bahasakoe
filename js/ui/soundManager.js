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
// REVISI (selaraskan brand guide, bagian "Efek Suara" -> "Tap Tombol"):
// square wave 880Hz, klik pendek nyaris tak terdengar -- sebelumnya sine
// 440Hz yang lebih terasa seperti nada, bukan "klik".
export function playTap() {
  playTone({ frequency: 880, duration: 0.05, type: 'square', startGain: 0.06 });
}

// REVISI (selaraskan brand guide -> "Jawaban Benar"): arpeggio 3 nada
// mayor naik (C5-E5-G5), gelombang triangle (lebih bulat/ceria drpd sine
// polos), staggered 70ms -- sebelumnya cuma 2 nada sine.
export function playCorrect() {
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((frequency, i) => {
    playTone({ frequency, duration: 0.16, type: 'triangle', startGain: 0.14, delay: i * 0.07 });
  });
}

// REVISI (selaraskan brand guide -> "Kurang Tepat"): dua nada TURUN
// lembut (G4 -> E4), sine, volume rendah -- sengaja tidak menghukum/
// tidak terdengar seperti alarm, sesuai prinsip non-punitive BahasaKoe.
// Sebelumnya cuma satu nada rendah tunggal.
export function playWrong() {
  playTone({ frequency: 392.0, duration: 0.16, type: 'sine', startGain: 0.09 });
  playTone({ frequency: 329.63, duration: 0.18, type: 'sine', startGain: 0.07, delay: 0.09 });
}

// Kenaikan streak -- 4 nada naik + satu kilau nada tinggi di akhir,
// persis preset "Naik Streak" di brand guide. Belum ada pemicu otomatis
// di alur aplikasi saat ini (streak baru dihitung ulang sekali per hari
// saat app dibuka, bukan di momen lesson selesai), jadi fungsi ini
// disediakan supaya siap dipanggil begitu ada momen UI yang secara
// eksplisit merayakan kenaikan streak.
export function playStreak() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, i) => {
    playTone({ frequency, duration: 0.14, type: 'triangle', startGain: 0.13, delay: i * 0.06 });
  });
  playTone({ frequency: 1568, duration: 0.25, type: 'sine', startGain: 0.08, delay: 0.28 });
}

// REVISI (selaraskan brand guide -> "Lesson Selesai"): fanfare 5 nada
// (C5-C5-E5-G5-C6), gelombang triangle -- momen paling meriah, dipakai
// hemat (cuma sekali di akhir lesson). Sebelumnya cuma 3 nada sine.
export function playComplete() {
  const notes = [523.25, 523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, i) => {
    playTone({ frequency, duration: 0.22, type: 'triangle', startGain: 0.13, delay: i * 0.11 });
  });
}
