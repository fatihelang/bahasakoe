/*
  questionHelpers.js
  Fungsi kecil yang dipakai bersama oleh lesson player (lesson.js) dan Home
  (kartu "Ulas kata yang salah"): jawaban benar dalam bentuk teks, dan kata
  kosakata yang terkait sebuah soal. Murni fungsi data, tanpa DOM/state.
*/

/** Jawaban benar sebuah soal dalam bentuk teks (untuk panel "Belum tepat"). */
export function correctAnswerText(question) {
  if (question.type === 'translate') return question.correctAnswers[0];
  if (question.type === 'arrange') return question.words.join(' ');
  if (question.type === 'true-false') return question.correctAnswer ? 'Benar' : 'Salah';
  if (question.type === 'matching') return '';
  return question.options[question.correctIndex];
}

/**
 * Kata kosakata (dari learningContent lesson-nya) yang terkait sebuah soal.
 * Best-effort: soal tidak menyimpan referensi eksplisit ke kata, jadi kata
 * dianggap terkait bila muncul di pertanyaan atau di jawaban yang benar.
 * Hanya dipakai untuk TAMPILAN (chip di kartu Ulas), bukan untuk logika.
 */
export function relatedWords(lesson, question) {
  const haystack = `${question.prompt} ${correctAnswerText(question)}`.toLowerCase();
  const words = (lesson.learningContent || [])
    .map((item) => item.native)
    .filter((native) => haystack.includes(native.toLowerCase().replace(/\?$/, '')));
  return [...new Set(words)];
}
