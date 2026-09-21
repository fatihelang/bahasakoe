/*
  unit2.js (js/data/jawa/)
  Data murni untuk Unit 2 -- "Berbicara dengan Hormat" (UX REVISION 0;
  nama sebelumnya "Unggah-Ungguh", lihat units.js): HANYA daftar lesson.
  Mengikuti pola persis unit1.js (lihat komentar di sana) -- metadata unit
  (id, title, description, order) ada di units.js, file ini cuma isi lesson.
  Istilah "unggah-ungguh" sendiri TETAP dipakai di dalam konten lesson
  (cultureMoment/cultureInsight) sebagai konsep budaya yang dijelaskan,
  bukan lagi sebagai nama unit/destination.

  FOKUS UNIT 2 (beda dengan Unit 1 yang murni kosakata dasar):
  KATA -> KALIMAT -> KONTEKS -> BUDAYA. Pertanyaan di Lesson 1-3 sengaja
  situasional (siapa lawan bicara, situasi apa), bukan sekadar translation
  drill kosakata lepas.

  STATUS VALIDASI BAHASA:
  Beberapa ungkapan di sini (terutama bentuk krama/krama inggil di Lesson 2
  dan Lesson 3) BELUM divalidasi oleh penutur/pakar Bahasa Jawa -- ini
  output model, BUKAN validasi linguistik. Setiap question yang memuat
  kosakata/ungkapan yang belum bisa dipastikan 100% akurat ditandai
  `needsValidation: true` secara eksplisit (jangan dihapus/disamarkan
  sebelum ada validasi konten terpisah). Daftar lengkapnya ada di laporan
  akhir tugas ini (chat), bukan di file ini, supaya file data ini tetap
  murni konten.

  Sengaja TIDAK ada question yang menyatakan aturan mutlak semacam
  "ngoko hanya boleh ke X" atau "krama harus dipakai ke Y" -- ditekankan
  lewat context/explanation yang pakai bahasa hati-hati ("umumnya",
  "dalam banyak konteks"), sesuai instruksi agar tidak membuat klaim
  budaya yang terlalu luas/absolut.

  Lesson 4-10 SENGAJA cuma stub {id, order, title, playable:false} --
  belum ada objective/learningContent/questions, karena kontennya memang
  belum dikembangkan (bukan lupa/bug). Pola ini identik dengan Lesson 4-10
  di unit1.js.

  cultureMoment (UX overhaul, Phase G): field opsional per-lesson --
  { title, body, type }. Kalau ada, lesson.js menampilkan satu layar
  "Culture Moment" singkat SEKALI, tepat setelah Learning Content selesai
  dan sebelum Question dimulai (Language -> Context -> Culture). Lesson
  player membaca field ini generik lewat lesson.cultureMoment -- tidak ada
  daftar hardcode di lesson.js. Cuma dipasang di lesson yang memang relevan
  (di sini: semua lesson Unit 2, karena topik unit ini memang tentang
  unggah-ungguh). Unit 1 awalnya sengaja tanpa field ini; kini Lesson 1-3
  punya cultureMoment draf (lihat unit1.js).
*/

export const LESSONS = [
  {
    id: 'u2l1',
    order: 1,
    title: 'Berbicara dengan Teman',
    playable: true,
    objective: 'Memahami penggunaan bentuk ngoko dalam percakapan santai dengan teman sebaya, sesuai situasi yang dihadapi.',
    learningContent: [
      { native: 'Sopo jenengmu?', arti: 'Siapa namamu? (ngoko, santai)' },
      { native: 'Piye kabare?', arti: 'Bagaimana kabarnya? (ngoko, santai)' },
      { native: 'Arep menyang endi?', arti: 'Mau ke mana? (ngoko, santai)' },
    ],
    cultureMoment: {
      title: 'Tahukah kamu?',
      body: 'Di Bahasa Jawa, cara bicara bisa berubah tergantung siapa lawan bicaramu. Ngoko itu bentuk yang santai, biasanya dipakai ke teman sebaya.',
      type: 'context',
    },
    questions: [
      {
        id: 'u2l1-q1',
        type: 'multiple-choice',
        prompt: 'Kamu bertemu teman sebaya di jalan dan ingin bertanya kabarnya. Ucapan yang tepat adalah?',
        options: ['Piye kabare?', 'Sugeng enjing', 'Matur nuwun', 'Sopo jenengmu?'],
        correctIndex: 0,
        explanation: '"Piye kabare?" dipakai untuk menanyakan kabar secara santai (ngoko) ke teman sebaya.',
        context: 'Bentuk ini wajar dipakai ke teman sebaya atau orang yang sudah akrab. Ke orang yang lebih tua, pilihan ungkapan bisa berbeda, akan dibahas di lesson berikutnya.',
        cultureInsight: 'Secara umum, bentuk ngoko sering dipakai dalam percakapan santai sehari-hari, terutama dengan teman sebaya atau orang yang sudah akrab. Ini bisa bervariasi tergantung individu dan situasi, bukan aturan yang berlaku sama untuk semua orang.',
        needsValidation: true,
      },
      {
        id: 'u2l1-q2',
        type: 'multiple-choice',
        prompt: "Teman kamu bertanya 'Arep menyang endi?' Pertanyaan itu artinya kira-kira...?",
        options: ['Mau ke mana?', 'Siapa namamu?', 'Terima kasih', 'Selamat pagi'],
        correctIndex: 0,
        explanation: '"Arep menyang endi?" artinya "mau ke mana?", pertanyaan santai yang umum dipakai antar teman.',
        context: 'Dipakai dalam percakapan santai sehari-hari, misalnya saat berpapasan di jalan.',
        needsValidation: true,
      },
      {
        id: 'u2l1-q3',
        type: 'multiple-choice',
        prompt: 'Kamu bertemu teman sebaya dan ingin menanyakan namanya. Ucapan yang tepat adalah?',
        options: ['Sopo jenengmu?', 'Piye kabare?', 'Arep menyang endi?', 'Matur nuwun'],
        correctIndex: 0,
        explanation: '"Sopo jenengmu?" dipakai untuk menanyakan nama teman sebaya secara santai (ngoko), bentuk yang sama seperti yang dipelajari di Unit 1.',
        context: 'Ini bentuk yang wajar dipakai ke teman sebaya; bukan berarti ini satu-satunya cara menanyakan nama dalam Bahasa Jawa.',
      },
    ],
  },
  {
    id: 'u2l2',
    order: 2,
    title: 'Berbicara dengan Orang Lebih Tua',
    playable: true,
    objective: 'Memahami bahwa pilihan ungkapan dapat berbeda ketika berbicara dengan orang yang lebih tua, dibandingkan dengan teman sebaya. Ini soal situasi, bukan aturan mutlak.',
    learningContent: [
      { native: 'Sugeng enjing', arti: 'Selamat pagi (netral, sesuai konteks siapa pun)' },
      { native: 'Nami panjenengan sinten?', arti: 'Siapa nama Anda? (bentuk yang lebih halus)' },
    ],
    cultureMoment: {
      title: 'Tahukah kamu?',
      body: 'Semakin dihormati lawan bicaramu, kata-kata yang dipakai biasanya juga semakin halus. Krama adalah bentuk yang lebih sopan dari ngoko, dan sering dipakai ke orang yang lebih tua.',
      type: 'context',
    },
    questions: [
      {
        id: 'u2l2-q1',
        type: 'multiple-choice',
        prompt: 'Kamu bertemu Pak RT (tetangga yang lebih tua) di pagi hari dan ingin menyapa. Sapaan yang lebih sesuai untuk situasi ini adalah?',
        options: ['Sugeng enjing', 'Piye kabare?', 'Arep menyang endi?', 'Sopo jenengmu?'],
        correctIndex: 0,
        explanation: '"Sugeng enjing" adalah sapaan yang netral dan umum dipakai ke siapa saja, termasuk orang yang lebih tua. Ini beda dengan "Piye kabare?" yang terasa lebih santai/ngoko.',
        context: 'Dalam situasi dengan orang yang lebih tua, sapaan yang netral biasanya terasa lebih sesuai dibanding sapaan yang sangat santai. Ini bukan aturan mutlak dan bisa berbeda tergantung keakraban.',
        cultureInsight: 'Dalam banyak konteks, masyarakat Jawa mempertimbangkan usia dan hubungan sosial saat memilih cara berbicara. Ini bagian dari konsep unggah-ungguh yang akan terus dipelajari di unit ini.',
      },
      {
        id: 'u2l2-q2',
        type: 'multiple-choice',
        prompt: 'Kamu ingin menanyakan nama seseorang yang jauh lebih tua, dengan sopan. Salah satu bentuk yang lebih halus adalah?',
        options: ['Nami panjenengan sinten?', 'Sopo jenengmu?', 'Jenengku Dimas.', 'Arep menyang endi?'],
        correctIndex: 0,
        explanation: '"Nami panjenengan sinten?" adalah bentuk yang lebih halus untuk menanyakan nama, dibandingkan "Sopo jenengmu?" yang terasa santai/ngoko.',
        context: 'Bentuk yang lebih halus seperti ini umum dipertimbangkan ketika berbicara dengan orang yang jauh lebih tua atau dalam situasi yang lebih formal.',
        needsValidation: true,
      },
      {
        id: 'u2l2-q3',
        type: 'true-false',
        prompt: "Pernyataan: Bentuk ngoko seperti 'Sopo jenengmu?' tidak boleh dipakai sama sekali kepada siapa pun yang lebih tua, dalam situasi apa pun.",
        correctAnswer: false,
        explanation: 'Pemilihan bentuk bahasa dipengaruhi banyak hal seperti keakraban dan situasi, bukan aturan yang berlaku sama mutlak untuk semua orang yang lebih tua di semua situasi. Jadi pernyataan ini terlalu mutlak.',
      },
    ],
  },
  {
    id: 'u2l3',
    order: 3,
    title: 'Meminta Sesuatu',
    playable: true,
    objective: 'Memahami bahwa cara meminta sesuatu dapat menyesuaikan dengan lawan bicara dan situasi sosial.',
    learningContent: [
      { native: 'Tulung', arti: 'Tolong (ngoko, santai)' },
      { native: 'Nyuwun tulung', arti: 'Minta tolong (bentuk lebih halus)' },
    ],
    cultureMoment: {
      title: 'Tahukah kamu?',
      body: 'Cara meminta tolong juga ikut menyesuaikan lawan bicara. "Tulung" cukup buat teman dekat, tapi "Nyuwun tulung" terasa lebih pas kalau kamu minta bantuan orang yang lebih dihormati.',
      type: 'context',
    },
    questions: [
      {
        id: 'u2l3-q1',
        type: 'multiple-choice',
        prompt: 'Kamu ingin meminta tolong kepada teman sebaya dengan santai. Ucapan yang tepat adalah?',
        options: ['Tulung, ya.', 'Nyuwun pangapunten.', 'Matur nuwun.', 'Sugeng dalu.'],
        correctIndex: 0,
        explanation: '"Tulung" berarti "tolong", dipakai santai (ngoko) ke teman sebaya untuk meminta bantuan.',
        context: 'Bentuk sederhana seperti ini wajar dipakai dalam percakapan santai sehari-hari dengan teman.',
        needsValidation: true,
      },
      {
        id: 'u2l3-q2',
        type: 'multiple-choice',
        prompt: 'Kamu ingin meminta tolong kepada seorang guru (lebih tua). Pilihan yang lebih sesuai adalah?',
        options: ['Nyuwun tulung, Bu/Pak.', 'Tulung, ya.', 'Piye kabare?', 'Arep menyang endi?'],
        correctIndex: 0,
        explanation: '"Nyuwun tulung" terasa lebih halus dibanding "Tulung" saja, sehingga lebih sering dipertimbangkan saat meminta bantuan ke orang yang lebih tua atau dihormati.',
        context: 'Menambahkan sapaan seperti "Bu"/"Pak" juga umum dipakai bersamaan dengan ungkapan yang lebih sopan.',
        needsValidation: true,
      },
      {
        id: 'u2l3-q3',
        type: 'true-false',
        prompt: 'Pernyataan: Cara meminta sesuatu dalam Bahasa Jawa selalu sama, tidak peduli kepada siapa kita berbicara.',
        correctAnswer: false,
        explanation: 'Cara meminta sesuatu dapat menyesuaikan dengan lawan bicara dan situasi, bukan sesuatu yang selalu sama dalam semua kondisi.',
      },
    ],
  },
  { id: 'u2l4', order: 4, title: 'Meminta Izin', playable: false },
  { id: 'u2l5', order: 5, title: 'Mengucapkan Terima Kasih', playable: false },
  { id: 'u2l6', order: 6, title: 'Meminta Maaf', playable: false },
  { id: 'u2l7', order: 7, title: 'Berpamitan', playable: false },
  { id: 'u2l8', order: 8, title: 'Menjawab dengan Sopan', playable: false },
  { id: 'u2l9', order: 9, title: 'Situasi Formal', playable: false },
  { id: 'u2l10', order: 10, title: 'Review Unggah-Ungguh', playable: false },
];
