/*
  unit1.js (js/data/sunda/)
  Data murni untuk Unit 1 -- Dasar Bahasa Sunda: HANYA daftar lesson.
  Metadata unit (id, title, description, order) ada di js/data/sunda/units.js
  -- pola persis sama dengan js/data/jawa/unit1.js + units.js.

  VALIDASI KOSAKATA (WAJIB DIBACA):
  Kosakata & ungkapan di bawah ini memakai bentuk Bahasa Sunda yang umum
  dipakai/diajarkan (bukan karangan), TAPI ini bukan proses validasi oleh
  native speaker/pakar Bahasa Sunda -- item yang register/kelaziman
  penggunaannya kurang saya yakini 100% ditandai needsValidation: true,
  baik di learningContent (lihat item.needsValidation) maupun di question
  yang relevan. Semua nomor 1-10 di Lesson 3 adalah bentuk baku yang sudah
  sangat umum/pasti, jadi tidak ditandai.

  Struktur lesson & question: lihat komentar lengkap di js/data/curriculum.js.
  Field kosakata sengaja bernama "native" (bukan "jawa"/"sunda") supaya satu
  lesson player (js/screens/lesson.js) generik untuk semua bahasa.
*/

export const LESSONS = [
  {
    id: 'sl1',
    order: 1,
    title: 'Salam',
    playable: true,
    objective: 'Mengucapkan salam sesuai waktu dan merespons ucapan terima kasih secara dasar.',
    learningContent: [
      { native: 'Wilujeng enjing', arti: 'Selamat pagi' },
      { native: 'Wilujeng siang', arti: 'Selamat siang' },
      { native: 'Wilujeng sonten', arti: 'Selamat sore' },
      { native: 'Wilujeng wengi', arti: 'Selamat malam' },
      { native: 'Hatur nuhun', arti: 'Terima kasih' },
      { native: 'Sawangsulna', arti: 'Sama-sama', needsValidation: true },
    ],
    questions: [
      {
        id: 'sl1-q1',
        type: 'multiple-choice',
        prompt: 'Kamu ketemu tetangga pagi-pagi di jalan. Ucapan yang tepat adalah?',
        options: ['Wilujeng enjing', 'Wilujeng wengi', 'Hatur nuhun', 'Sawangsulna'],
        correctIndex: 0,
        explanation: '"Enjing" berarti pagi, jadi "Wilujeng enjing" dipakai untuk menyapa di pagi hari.',
        context: 'Salam ini bisa dipakai untuk siapa saja dalam percakapan sehari-hari.',
      },
      {
        id: 'sl1-q2',
        type: 'multiple-choice',
        prompt: "Apa arti dari 'Wilujeng wengi'?",
        options: ['Selamat pagi', 'Selamat siang', 'Selamat malam', 'Terima kasih'],
        correctIndex: 2,
        explanation: '"Wengi" berarti malam.',
      },
      {
        id: 'sl1-q3',
        type: 'multiple-choice',
        prompt: "Seseorang bilang 'Hatur nuhun' ke kamu. Respons yang tepat?",
        options: ['Sawangsulna', 'Wilujeng enjing', 'Saha', 'Abdi'],
        correctIndex: 0,
        explanation: '"Sawangsulna" dipakai untuk membalas ucapan terima kasih.',
        needsValidation: true,
      },
    ],
  },
  {
    id: 'sl2',
    order: 2,
    title: 'Perkenalan',
    playable: true,
    objective: 'Memperkenalkan diri dan menanyakan nama orang lain secara dasar.',
    learningContent: [
      { native: 'Abdi', arti: 'Saya (sopan)' },
      { native: 'Nami abdi', arti: 'Nama saya' },
      { native: 'Saha', arti: 'Siapa' },
      { native: 'Anjeun', arti: 'Kamu (sopan)' },
      { native: 'Saha nami anjeun?', arti: 'Siapa nama kamu?' },
    ],
    questions: [
      {
        id: 'sl2-q1',
        type: 'multiple-choice',
        prompt: 'Kamu mau menanyakan nama teman baru. Kalimat yang tepat?',
        options: ['Saha nami anjeun?', 'Nami abdi Rina.', 'Hatur nuhun.', 'Wilujeng enjing.'],
        correctIndex: 0,
        explanation: '"Saha nami anjeun?" dipakai untuk menanyakan nama lawan bicara secara sopan.',
        context: 'Bentuk ini memakai kata ganti sopan ("anjeun"); bentuk yang lebih santai akan dipelajari di unit berikutnya.',
      },
      {
        id: 'sl2-q2',
        type: 'multiple-choice',
        prompt: "Apa arti dari 'Abdi'?",
        options: ['Kamu', 'Saya', 'Siapa', 'Terima kasih'],
        correctIndex: 1,
        explanation: '"Abdi" adalah bentuk sopan untuk "saya".',
      },
      {
        id: 'sl2-q3',
        type: 'arrange',
        prompt: "Susun kata untuk memperkenalkan nama sendiri (artinya: 'Nama saya ...').",
        words: ['Nami', 'abdi'],
        explanation: '"Nami" (nama) + "abdi" (saya) = "Nami abdi", diikuti nama diri.',
      },
    ],
  },
  {
    id: 'sl3',
    order: 3,
    title: 'Angka',
    playable: true,
    objective: 'Mengenal angka dasar 1-10 dalam Bahasa Sunda.',
    learningContent: [
      { native: 'Hiji', arti: '1' },
      { native: 'Dua', arti: '2' },
      { native: 'Tilu', arti: '3' },
      { native: 'Opat', arti: '4' },
      { native: 'Lima', arti: '5' },
      { native: 'Genep', arti: '6' },
      { native: 'Tujuh', arti: '7' },
      { native: 'Dalapan', arti: '8' },
      { native: 'Salapan', arti: '9' },
      { native: 'Sapuluh', arti: '10' },
    ],
    questions: [
      {
        id: 'sl3-q1',
        type: 'multiple-choice',
        prompt: 'Kamu mau beli 3 pisang di warung. Sebutkan angka 3 dalam Bahasa Sunda.',
        options: ['Tilu', 'Opat', 'Dua', 'Lima'],
        correctIndex: 0,
        explanation: '"Tilu" adalah sebutan untuk angka 3.',
      },
      {
        id: 'sl3-q2',
        type: 'translate',
        prompt: 'Ketik angka 10 dalam Bahasa Sunda.',
        correctAnswers: ['sapuluh'],
        explanation: '"Sapuluh" adalah sebutan untuk angka 10.',
      },
      {
        id: 'sl3-q3',
        type: 'true-false',
        prompt: "Pernyataan: 'Genep' berarti angka 7.",
        correctAnswer: false,
        explanation: '"Genep" = 6. Angka 7 adalah "Tujuh".',
      },
    ],
  },
  { id: 'sl4', order: 4, title: 'Keluarga', playable: false },
  { id: 'sl5', order: 5, title: 'Kata Kerja Dasar', playable: false },
  { id: 'sl6', order: 6, title: 'Benda Sehari-hari', playable: false },
  { id: 'sl7', order: 7, title: 'Tempat', playable: false },
  { id: 'sl8', order: 8, title: 'Waktu', playable: false },
  { id: 'sl9', order: 9, title: 'Kalimat Sederhana', playable: false },
  { id: 'sl10', order: 10, title: 'Review Dasar', playable: false },
];
