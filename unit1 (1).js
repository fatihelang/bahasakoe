/*
  unit1.js
  Data murni untuk Unit 1 — Dasar Bahasa Jawa.
  Tidak ada logic di sini, supaya menambah/mengubah lesson cukup edit file ini.

  Struktur:
  lesson = { id, order, title, playable, objective, learningContent[], questions[] }

  question umum = { id, type, prompt, explanation, context?, cultureInsight?, needsValidation? }
  type menentukan field tambahan yang dipakai:
  - 'multiple-choice' (default kalau type tidak diisi): options[], correctIndex
  - 'translate': correctAnswers[] (jawaban valid, dicocokkan case-insensitive), placeholder?
  - 'arrange': words[] — urutan kata yang BENAR; UI yang mengacak tampilannya
  - 'matching': pairs[] — array {jawa, arti}; UI mengacak & mencocokkan
  - 'true-false': correctAnswer (boolean) — prompt berisi pernyataan yang dinilai

  Setiap lesson playable ditarget minimal 10 soal, dengan tipe bervariasi
  TAPI tidak dipaksakan rata di setiap lesson — mis. Lesson 3 (Angka) tidak
  memakai tipe 'arrange' karena kosakatanya berupa angka tunggal, bukan
  frasa yang wajar disusun ulang. Sama seperti context/cultureInsight,
  variasi tipe soal mengikuti apa yang masuk akal untuk kontennya.

  Catatan: konten Lesson 1-3 mengikuti Phase 2 (revisi terakhir).
  needsValidation: true pada sebuah question berarti cultureInsight-nya belum
  dikonfirmasi native speaker/ahli Bahasa Jawa — field ini hanya dipakai
  secara internal (data/tracking), TIDAK ditampilkan ke user di UI.
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
          cultureInsight: 'Orang Jawa terbiasa menyapa sesuai waktu hari — kebiasaan ini mencerminkan cara masyarakat Jawa memperhatikan konteks situasi dalam berkomunikasi sehari-hari.',
          needsValidation: true,
        },
        {
          id: 'l1-q2',
          type: 'translate',
          prompt: "Ketik arti dari 'Sugeng dalu' dalam Bahasa Indonesia.",
          correctAnswers: ['selamat malam'],
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
        {
          id: 'l1-q4',
          type: 'multiple-choice',
          prompt: 'Kamu bertemu tetangga waktu tengah hari. Ucapan yang tepat adalah?',
          options: ['Sugeng siang', 'Sugeng enjing', 'Sugeng dalu', 'Matur nuwun'],
          correctIndex: 0,
          explanation: '"Siang" dalam Bahasa Jawa juga "siang", jadi "Sugeng siang" dipakai untuk menyapa di waktu itu.',
        },
        {
          id: 'l1-q5',
          type: 'translate',
          prompt: "Ketik arti dari 'Sugeng sonten' dalam Bahasa Indonesia.",
          correctAnswers: ['selamat sore'],
          explanation: '"Sonten" berarti sore.',
        },
        {
          id: 'l1-q6',
          type: 'arrange',
          prompt: 'Susun kata untuk menyapa seseorang di pagi hari.',
          words: ['Sugeng', 'enjing'],
          explanation: '"Sugeng" + "enjing" (pagi) = "Sugeng enjing", salam untuk pagi hari.',
        },
        {
          id: 'l1-q7',
          type: 'true-false',
          prompt: "Pernyataan: 'Matur nuwun' berarti 'Sama-sama'.",
          correctAnswer: false,
          explanation: '"Matur nuwun" berarti "terima kasih". Balasannya baru "Sami-sami" (sama-sama).',
        },
        {
          id: 'l1-q8',
          type: 'true-false',
          prompt: "Pernyataan: 'Sugeng dalu' dipakai untuk menyapa di malam hari.",
          correctAnswer: true,
          explanation: '"Dalu" berarti malam, jadi "Sugeng dalu" memang dipakai malam hari.',
        },
        {
          id: 'l1-q9',
          type: 'matching',
          prompt: 'Cocokkan ucapan dengan artinya.',
          pairs: [
            { jawa: 'Sugeng enjing', arti: 'Selamat pagi' },
            { jawa: 'Sugeng sonten', arti: 'Selamat sore' },
            { jawa: 'Matur nuwun', arti: 'Terima kasih' },
          ],
          explanation: 'Tiap salam punya waktu pemakaiannya sendiri, dan "Matur nuwun" khusus untuk berterima kasih.',
        },
        {
          id: 'l1-q10',
          type: 'multiple-choice',
          prompt: "Bu Guru berkata 'Matur nuwun' setelah kamu membantu beres-beres kelas. Balasan yang tepat?",
          options: ['Sami-sami', 'Sugeng enjing', 'Sugeng sonten', 'Sugeng dalu'],
          correctIndex: 0,
          explanation: '"Sami-sami" tetap jadi balasan yang tepat untuk ucapan terima kasih, ke siapa pun.',
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
          type: 'arrange',
          prompt: "Susun kata berikut menjadi kalimat yang benar (artinya: Namaku Dimas.)",
          words: ['Jenengku', 'Dimas'],
          explanation: '"Jenengku" = "namaku", diikuti nama diri — jadi susunannya "Jenengku Dimas."',
        },
        {
          id: 'l2-q3',
          type: 'multiple-choice',
          prompt: 'Kamu sedang berbicara santai dengan teman baru bernama Dimas. Bagaimana kamu menanyakan namanya?',
          options: ['Jenengku Dimas.', 'Sopo jenengmu?', 'Matur nuwun.', 'Sugeng dalu.'],
          correctIndex: 1,
          explanation: 'Dalam situasi berkenalan, kalimat ini berfungsi untuk membuka perkenalan dengan menanyakan nama lawan bicara — bukan sekadar terjemahan kata per kata.',
          context: 'Dipakai ke teman sebaya atau orang yang sudah akrab; bentuk yang lebih sopan/halus akan dipelajari di Unit 2 (Unggah-Ungguh).',
          cultureInsight: 'Bahasa ngoko terasa akrab dan santai, sehingga lebih umum dipakai ke teman sebaya — bukan ke orang yang lebih tua atau baru dikenal dalam situasi formal.',
          needsValidation: true,
        },
        {
          id: 'l2-q4',
          type: 'translate',
          prompt: "Ketik arti dari 'Jenengmu' dalam Bahasa Indonesia.",
          correctAnswers: ['namamu'],
          explanation: '"Jenengmu" = "namamu".',
        },
        {
          id: 'l2-q5',
          type: 'multiple-choice',
          prompt: "Bagaimana bilang 'Aku' dalam Bahasa Jawa ngoko?",
          options: ['Aku', 'Kowe', 'Sopo', 'Jenengku'],
          correctIndex: 0,
          explanation: '"Aku" dipakai sama seperti Bahasa Indonesia, untuk menyebut diri sendiri dalam level ngoko.',
        },
        {
          id: 'l2-q6',
          type: 'translate',
          prompt: "Ketik arti dari 'Kowe' dalam Bahasa Indonesia (level ngoko).",
          correctAnswers: ['kamu'],
          explanation: '"Kowe" berarti "kamu" dalam level ngoko.',
        },
        {
          id: 'l2-q7',
          type: 'arrange',
          prompt: "Susun kata untuk menanyakan 'Siapa namamu?' secara santai (ngoko).",
          words: ['Sopo', 'jenengmu'],
          explanation: '"Sopo jenengmu?" tersusun dari "Sopo" (siapa) + "jenengmu" (namamu).',
        },
        {
          id: 'l2-q8',
          type: 'true-false',
          prompt: "Pernyataan: 'Kowe' dipakai untuk menyebut diri sendiri.",
          correctAnswer: false,
          explanation: '"Kowe" artinya "kamu" — untuk menyebut diri sendiri dipakai "Aku".',
        },
        {
          id: 'l2-q9',
          type: 'true-false',
          prompt: "Pernyataan: 'Jenengku' dipakai untuk memperkenalkan nama sendiri.",
          correctAnswer: true,
          explanation: '"Jenengku" = "namaku", dipakai untuk memperkenalkan nama sendiri.',
        },
        {
          id: 'l2-q10',
          type: 'matching',
          prompt: 'Cocokkan kata dengan artinya.',
          pairs: [
            { jawa: 'Jenengku', arti: 'Namaku' },
            { jawa: 'Sopo', arti: 'Siapa' },
            { jawa: 'Kowe', arti: 'Kamu (ngoko)' },
          ],
          explanation: 'Kata-kata dasar perkenalan ini jadi bekal utama membuka percakapan santai.',
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
          type: 'translate',
          prompt: 'Ketik angka 5 dalam Bahasa Jawa.',
          correctAnswers: ['lima'],
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
        {
          id: 'l3-q4',
          type: 'multiple-choice',
          prompt: "'Wolu' adalah sebutan untuk angka berapa?",
          options: ['6', '7', '8', '9'],
          correctIndex: 2,
          explanation: '"Wolu" = 8.',
        },
        {
          id: 'l3-q5',
          type: 'translate',
          prompt: 'Ketik angka 10 dalam Bahasa Jawa.',
          correctAnswers: ['sepuluh'],
          explanation: '"Sepuluh" adalah sebutan untuk angka 10 (sama seperti Bahasa Indonesia).',
        },
        {
          id: 'l3-q6',
          type: 'translate',
          prompt: 'Ketik angka 1 dalam Bahasa Jawa.',
          correctAnswers: ['siji'],
          explanation: '"Siji" adalah sebutan untuk angka 1.',
        },
        {
          id: 'l3-q7',
          type: 'true-false',
          prompt: "Pernyataan: 'Enem' berarti angka 7.",
          correctAnswer: false,
          explanation: '"Enem" = 6. Angka 7 adalah "Pitu".',
        },
        {
          id: 'l3-q8',
          type: 'true-false',
          prompt: "Pernyataan: 'Pitu' adalah sebutan untuk angka 7.",
          correctAnswer: true,
          explanation: '"Pitu" memang berarti 7.',
        },
        {
          id: 'l3-q9',
          type: 'matching',
          prompt: 'Cocokkan angka Jawa dengan angkanya.',
          pairs: [
            { jawa: 'Loro', arti: '2' },
            { jawa: 'Papat', arti: '4' },
            { jawa: 'Enem', arti: '6' },
          ],
          explanation: 'Angka genap 2, 4, 6 dalam Bahasa Jawa: Loro, Papat, Enem.',
        },
        {
          id: 'l3-q10',
          type: 'multiple-choice',
          prompt: 'Kamu mau beli 2 apel di warung. Sebutkan angka 2 dalam Bahasa Jawa.',
          options: ['Loro', 'Telu', 'Papat', 'Lima'],
          correctIndex: 0,
          explanation: '"Loro" adalah sebutan untuk angka 2.',
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
