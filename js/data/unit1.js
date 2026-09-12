/*
  unit1.js
  Data murni untuk Unit 1 — Dasar Bahasa Jawa.
  Tidak ada logic di sini, supaya menambah/mengubah lesson cukup edit file ini.

  Struktur:
  lesson = { id, order, title, playable, objective, learningContent[], questions[] }
  question = { id, type, prompt, options[], correctIndex, explanation, context?, cultureInsight? }

  Catatan: konten Lesson 1-3 mengikuti Phase 2 (revisi terakhir).
  Item yang ditandai needsValidation belum dikonfirmasi native speaker/ahli.
*/

export const UNIT1 = {
  id: 'unit-1',
  title: 'Unit 1 — Dasar Bahasa Jawa',
  language: 'Bahasa Jawa',
  lessons: [
    {
      id: 'l1',
      order: 1,
      title: 'Salam',
      playable: true,
      objective: 'Mengucapkan salam sesuai waktu dan merespons ucapan terima kasih secara dasar.',
      learningContent: [
        { jawa: 'Sugeng enjing', arti: 'Selamat pagi' },
        { jawa: 'Sugeng siang', arti: 'Selamat siang' },
        { jawa: 'Sugeng sonten', arti: 'Selamat sore' },
        { jawa: 'Sugeng dalu', arti: 'Selamat malam' },
        { jawa: 'Matur nuwun', arti: 'Terima kasih' },
        { jawa: 'Sami-sami', arti: 'Sama-sama' },
      ],
      questions: [
        {
          id: 'l1-q1',
          type: 'multiple-choice',
          prompt: 'Pagi hari kamu bertemu teman di sekolah. Ucapan yang tepat adalah?',
          options: ['Sugeng enjing', 'Sugeng dalu', 'Matur nuwun', 'Sami-sami'],
          correctIndex: 0,
          explanation: '"Enjing" berarti pagi, jadi "Sugeng enjing" dipakai untuk menyapa di pagi hari.',
          context: 'Salam ini bisa dipakai untuk siapa saja dalam percakapan sehari-hari; perbedaan tingkat kesopanan akan dibahas lebih lanjut di Unit 2.',
        },
        {
          id: 'l1-q2',
          type: 'multiple-choice',
          prompt: "Apa arti 'Sugeng dalu'?",
          options: ['Selamat pagi', 'Selamat siang', 'Selamat sore', 'Selamat malam'],
          correctIndex: 3,
          explanation: '"Dalu" berarti malam.',
        },
        {
          id: 'l1-q3',
          type: 'multiple-choice',
          prompt: "Rina membantu Dimas membawa buku. Dimas berkata, 'Matur nuwun.' Apa respons yang tepat?",
          options: ['Sami-sami', 'Sugeng enjing', 'Sugeng dalu', 'Sepuluh'],
          correctIndex: 0,
          explanation: '"Sami-sami" adalah balasan umum untuk ucapan terima kasih dalam percakapan.',
          context: 'Dipakai sebagai respons santai dalam percakapan sehari-hari, baik dengan teman maupun orang lain.',
        },
      ],
    },
    {
      id: 'l2',
      order: 2,
      title: 'Perkenalan',
      playable: true,
      objective: 'Memperkenalkan diri dan menanyakan nama orang lain dalam level ngoko.',
      learningContent: [
        { jawa: 'Jenengku', arti: 'Namaku' },
        { jawa: 'Jenengmu', arti: 'Namamu' },
        { jawa: 'Sopo', arti: 'Siapa' },
        { jawa: 'Aku', arti: 'Aku / saya (ngoko)' },
        { jawa: 'Kowe', arti: 'Kamu (ngoko)' },
      ],
      questions: [
        {
          id: 'l2-q1',
          type: 'multiple-choice',
          prompt: 'Bagaimana menanyakan nama orang lain dalam Bahasa Jawa (ngoko)?',
          options: ['Sopo jenengmu?', 'Jenengku sopo?', 'Matur nuwun', 'Sugeng enjing'],
          correctIndex: 0,
          explanation: '"Sopo" berarti siapa, jadi susunan ini dipakai untuk menanyakan nama lawan bicara.',
          context: 'Pertanyaan ini wajar dipakai antar teman sebaya (level ngoko).',
        },
        {
          id: 'l2-q2',
          type: 'multiple-choice',
          prompt: "Lengkapi kalimat: '___ Dimas.' (artinya: Namaku Dimas.)",
          options: ['Jenengku', 'Jenengmu', 'Sopo', 'Kowe'],
          correctIndex: 0,
          explanation: '"Jenengku" = "namaku", dipakai untuk memperkenalkan nama sendiri.',
        },
        {
          id: 'l2-q3',
          type: 'multiple-choice',
          prompt: 'Kamu sedang berbicara santai dengan teman baru bernama Dimas. Bagaimana kamu menanyakan namanya?',
          options: ['Jenengku Dimas.', 'Sopo jenengmu?', 'Matur nuwun.', 'Sugeng dalu.'],
          correctIndex: 1,
          explanation: 'Dalam situasi berkenalan, kalimat ini berfungsi untuk membuka perkenalan dengan menanyakan nama lawan bicara — bukan sekadar terjemahan kata per kata.',
          context: 'Dipakai ke teman sebaya atau orang yang sudah akrab; bentuk yang lebih sopan/halus akan dipelajari di Unit 2 (Unggah-Ungguh).',
        },
      ],
    },
    {
      id: 'l3',
      order: 3,
      title: 'Angka',
      playable: true,
      objective: 'Menyebutkan dan mengenali angka 1–10 dalam Bahasa Jawa.',
      learningContent: [
        { jawa: 'Siji', arti: '1' },
        { jawa: 'Loro', arti: '2' },
        { jawa: 'Telu', arti: '3' },
        { jawa: 'Papat', arti: '4' },
        { jawa: 'Lima', arti: '5' },
        { jawa: 'Enem', arti: '6' },
        { jawa: 'Pitu', arti: '7' },
        { jawa: 'Wolu', arti: '8' },
        { jawa: 'Sanga', arti: '9' },
        { jawa: 'Sepuluh', arti: '10' },
      ],
      questions: [
        {
          id: 'l3-q1',
          type: 'multiple-choice',
          prompt: 'Kamu melihat tiga apel di meja. Angka tiga dalam Bahasa Jawa adalah...?',
          options: ['Telu', 'Loro', 'Papat', 'Lima'],
          correctIndex: 0,
          explanation: '"Telu" adalah sebutan untuk angka 3, dipakai saat menyebut jumlah benda.',
        },
        {
          id: 'l3-q2',
          type: 'multiple-choice',
          prompt: 'Bagaimana menyebutkan angka 5 dalam Bahasa Jawa?',
          options: ['Lima', 'Papat', 'Enem', 'Pitu'],
          correctIndex: 0,
          explanation: '"Lima" adalah sebutan untuk angka 5.',
        },
        {
          id: 'l3-q3',
          type: 'multiple-choice',
          prompt: "'Sanga' adalah sebutan untuk angka berapa?",
          options: ['7', '8', '9', '10'],
          correctIndex: 2,
          explanation: '"Sanga" = 9.',
        },
      ],
    },
    { id: 'l4', order: 4, title: 'Keluarga', playable: false },
    { id: 'l5', order: 5, title: 'Kata Kerja Dasar', playable: false },
    { id: 'l6', order: 6, title: 'Benda Sehari-hari', playable: false },
    { id: 'l7', order: 7, title: 'Tempat', playable: false },
    { id: 'l8', order: 8, title: 'Waktu', playable: false },
    { id: 'l9', order: 9, title: 'Kalimat Sederhana', playable: false },
    { id: 'l10', order: 10, title: 'Review Dasar', playable: false },
  ],
};

export function getLessonById(lessonId) {
  return UNIT1.lessons.find((lesson) => lesson.id === lessonId) || null;
}

export function getLessonOrder(lessonId) {
  const lesson = getLessonById(lessonId);
  return lesson ? lesson.order : null;
}
