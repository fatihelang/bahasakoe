/*
  unit2.js (js/data/sunda/)
  Data murni untuk Unit 2 -- Berbicara dengan Hormat (Bahasa Sunda): HANYA
  daftar lesson. Metadata unit ada di js/data/sunda/units.js.

  Ini padanan Unit 2 Bahasa Jawa (ngoko & krama) untuk Bahasa Sunda:
  tingkat tutur LOMA (akrab, santai, ke teman sebaya) dan LEMES (halus,
  sopan, ke orang yang lebih tua/dihormati). Dalam istilah Sunda,
  pembagian tingkat tutur ini dikenal sebagai undak-usuk basa. Tingkat
  KASAR sengaja tidak diajarkan di prototype ini.

  Struktur lesson, question, dan cultureMoment: persis sama dengan
  js/data/jawa/unit2.js (dan komentar lengkap di js/data/curriculum.js),
  jadi lesson player (js/screens/lesson.js) tidak perlu diubah.

  CATATAN KOSAKATA (WAJIB DIBACA):
  Ungkapan di bawah ini memakai bentuk Bahasa Sunda yang umum diajarkan,
  tetapi ditulis tanpa validasi penutur asli/pakar. Item yang kelaziman
  penggunaannya kurang diyakini 100% ditandai needsValidation: true
  (penanda saja; tidak mempengaruhi tampilan). Penjelasan sengaja
  memakai kata hati-hati ("umumnya", "biasanya") karena pemilihan tingkat
  tutur bergantung pada keakraban, situasi, dan daerah -- bukan aturan
  mutlak.
*/

export const LESSONS = [
  {
    id: 'su2l1',
    order: 1,
    title: 'Berbicara dengan Teman',
    playable: true,
    objective: 'Memahami penggunaan bentuk loma dalam percakapan santai dengan teman sebaya, sesuai situasi yang dihadapi.',
    learningContent: [
      { native: 'Saha ngaran maneh?', arti: 'Siapa namamu? (loma, akrab)', needsValidation: true },
      { native: 'Kumaha, cageur?', arti: 'Apa kabar? (loma, akrab)', needsValidation: true },
      { native: 'Rék ka mana?', arti: 'Mau ke mana? (loma, akrab)' },
    ],
    cultureMoment: {
      title: 'Tahukah kamu?',
      body: 'Di Bahasa Sunda, cara bicara bisa berubah tergantung siapa lawan bicaramu. Loma itu bentuk yang akrab dan santai, biasanya dipakai ke teman sebaya.',
      type: 'context',
    },
    questions: [
      {
        id: 'su2l1-q1',
        type: 'multiple-choice',
        prompt: 'Kamu bertemu teman sebaya di jalan dan ingin menanyakan kabarnya dengan santai. Ucapan yang tepat adalah?',
        options: ['Kumaha, cageur?', 'Wilujeng enjing', 'Hatur nuhun', 'Saha ngaran maneh?'],
        correctIndex: 0,
        explanation: '"Kumaha, cageur?" dipakai untuk menanyakan kabar secara santai (loma) ke teman sebaya.',
        context: 'Bentuk ini wajar dipakai ke teman sebaya atau orang yang sudah akrab. Ke orang yang lebih tua, pilihan ungkapan bisa berbeda, akan dibahas di lesson berikutnya.',
        cultureInsight: 'Secara umum, bentuk loma sering dipakai dalam percakapan santai sehari-hari, terutama dengan teman sebaya atau orang yang sudah akrab. Ini bisa bervariasi tergantung individu, situasi, dan daerah, bukan aturan yang berlaku sama untuk semua orang.',
        needsValidation: true,
      },
      {
        id: 'su2l1-q2',
        type: 'multiple-choice',
        prompt: "Teman kamu bertanya 'Rék ka mana?' Pertanyaan itu artinya kira-kira...?",
        options: ['Mau ke mana?', 'Siapa namamu?', 'Terima kasih', 'Selamat pagi'],
        correctIndex: 0,
        explanation: '"Rék ka mana?" artinya "mau ke mana?", pertanyaan santai yang umum dipakai antar teman.',
        context: 'Dipakai dalam percakapan santai sehari-hari, misalnya saat berpapasan di jalan.',
      },
      {
        id: 'su2l1-q3',
        type: 'multiple-choice',
        prompt: 'Kamu bertemu teman sebaya dan ingin menanyakan namanya. Ucapan yang tepat adalah?',
        options: ['Saha ngaran maneh?', 'Kumaha, cageur?', 'Rék ka mana?', 'Hatur nuhun'],
        correctIndex: 0,
        explanation: '"Saha ngaran maneh?" dipakai untuk menanyakan nama teman sebaya secara santai (loma). "Saha" artinya "siapa", seperti yang dipelajari di Unit 1.',
        context: 'Ini bentuk yang wajar dipakai ke teman sebaya; bukan berarti ini satu-satunya cara menanyakan nama dalam Bahasa Sunda.',
        needsValidation: true,
      },
    ],
  },
  {
    id: 'su2l2',
    order: 2,
    title: 'Berbicara dengan Orang Lebih Tua',
    playable: true,
    objective: 'Memahami bahwa pilihan ungkapan dapat berbeda ketika berbicara dengan orang yang lebih tua, dibandingkan dengan teman sebaya. Ini soal situasi, bukan aturan mutlak.',
    learningContent: [
      { native: 'Wilujeng enjing', arti: 'Selamat pagi (netral, sesuai konteks siapa pun)' },
      { native: 'Saha nami Anjeun?', arti: 'Siapa nama Anda? (lemes, lebih halus)', needsValidation: true },
      { native: 'Kumaha damang?', arti: 'Apa kabar? (lemes, lebih halus)' },
    ],
    cultureMoment: {
      title: 'Tahukah kamu?',
      body: 'Semakin dihormati lawan bicaramu, kata-kata yang dipakai biasanya juga semakin halus. Lemes adalah bentuk yang lebih sopan dari loma, dan sering dipakai ke orang yang lebih tua.',
      type: 'context',
    },
    questions: [
      {
        id: 'su2l2-q1',
        type: 'multiple-choice',
        prompt: 'Kamu bertemu Pak RT (tetangga yang lebih tua) di pagi hari dan ingin menyapa. Sapaan yang lebih sesuai untuk situasi ini adalah?',
        options: ['Wilujeng enjing', 'Rék ka mana?', 'Saha ngaran maneh?', 'Kumaha, cageur?'],
        correctIndex: 0,
        explanation: '"Wilujeng enjing" adalah sapaan yang netral dan umum dipakai ke siapa saja, termasuk orang yang lebih tua. Ini beda dengan "Kumaha, cageur?" yang terasa lebih santai/loma.',
        context: 'Dalam situasi dengan orang yang lebih tua, sapaan yang netral biasanya terasa lebih sesuai dibanding sapaan yang sangat santai. Ini bukan aturan mutlak dan bisa berbeda tergantung keakraban.',
        cultureInsight: 'Dalam banyak konteks, masyarakat Sunda mempertimbangkan usia dan hubungan sosial saat memilih cara berbicara. Pembagian tingkat tutur ini dikenal dengan istilah undak-usuk basa.',
      },
      {
        id: 'su2l2-q2',
        type: 'multiple-choice',
        prompt: 'Kamu ingin menanyakan kabar seseorang yang jauh lebih tua dengan sopan. Salah satu bentuk yang lebih halus adalah?',
        options: ['Kumaha damang?', 'Kumaha, cageur?', 'Rék ka mana?', 'Saha ngaran maneh?'],
        correctIndex: 0,
        explanation: '"Kumaha damang?" adalah bentuk yang lebih halus untuk menanyakan kabar, dibandingkan "Kumaha, cageur?" yang terasa santai/loma.',
        context: 'Bentuk yang lebih halus seperti ini umum dipertimbangkan ketika berbicara dengan orang yang jauh lebih tua atau dalam situasi yang lebih formal.',
        needsValidation: true,
      },
      {
        id: 'su2l2-q3',
        type: 'true-false',
        prompt: "Pernyataan: Bentuk loma seperti 'Saha ngaran maneh?' tidak boleh dipakai sama sekali kepada siapa pun yang lebih tua, dalam situasi apa pun.",
        correctAnswer: false,
        explanation: 'Pemilihan bentuk bahasa dipengaruhi banyak hal seperti keakraban dan situasi, bukan aturan yang berlaku sama mutlak untuk semua orang yang lebih tua di semua situasi. Jadi pernyataan ini terlalu mutlak.',
      },
    ],
  },
  {
    id: 'su2l3',
    order: 3,
    title: 'Berterima Kasih dan Permisi',
    playable: true,
    objective: 'Memahami bahwa cara berterima kasih dan meminta jalan dapat menyesuaikan dengan lawan bicara dan situasi sosial.',
    learningContent: [
      { native: 'Nuhun', arti: 'Terima kasih (loma, akrab)' },
      { native: 'Hatur nuhun', arti: 'Terima kasih (lemes, lebih sopan)' },
      { native: 'Punten', arti: 'Permisi / maaf (sopan)' },
    ],
    cultureMoment: {
      title: 'Tahukah kamu?',
      body: 'Cara berterima kasih juga ikut menyesuaikan lawan bicara. "Nuhun" cukup buat teman dekat, tapi "Hatur nuhun" terasa lebih pas untuk orang yang lebih dihormati. "Punten" sering diucapkan saat permisi, misalnya sebelum lewat di depan orang.',
      type: 'context',
    },
    questions: [
      {
        id: 'su2l3-q1',
        type: 'multiple-choice',
        prompt: 'Kamu ingin berterima kasih kepada teman sebaya dengan santai. Ucapan yang tepat adalah?',
        options: ['Nuhun', 'Punten', 'Wilujeng enjing', 'Kumaha damang?'],
        correctIndex: 0,
        explanation: '"Nuhun" berarti "terima kasih", dipakai santai (loma) ke teman sebaya.',
        context: 'Bentuk singkat seperti ini wajar dipakai dalam percakapan santai sehari-hari dengan teman.',
      },
      {
        id: 'su2l3-q2',
        type: 'multiple-choice',
        prompt: 'Kamu ingin berterima kasih kepada seorang guru (lebih tua). Pilihan yang lebih sesuai adalah?',
        options: ['Hatur nuhun', 'Nuhun', 'Rék ka mana?', 'Saha ngaran maneh?'],
        correctIndex: 0,
        explanation: '"Hatur nuhun" terasa lebih halus dibanding "Nuhun" saja, sehingga lebih sering dipertimbangkan saat berterima kasih kepada orang yang lebih tua atau dihormati.',
        context: 'Menambahkan sapaan seperti "Bu"/"Pak" juga umum dipakai bersamaan dengan ungkapan yang lebih sopan.',
      },
      {
        id: 'su2l3-q3',
        type: 'true-false',
        prompt: "Pernyataan: Kata 'Punten' hanya dipakai untuk meminta maaf, tidak pernah untuk permisi.",
        correctAnswer: false,
        explanation: '"Punten" umum dipakai untuk permisi atau meminta izin, dan juga bisa dipakai untuk meminta maaf. Jadi pernyataan bahwa ia hanya untuk meminta maaf tidak tepat.',
        needsValidation: true,
      },
    ],
  },
  { id: 'su2l4', order: 4, title: 'Meminta Izin', playable: false },
  { id: 'su2l5', order: 5, title: 'Meminta Maaf', playable: false },
  { id: 'su2l6', order: 6, title: 'Berpamitan', playable: false },
  { id: 'su2l7', order: 7, title: 'Menjawab dengan Sopan', playable: false },
  { id: 'su2l8', order: 8, title: 'Situasi Formal', playable: false },
  { id: 'su2l9', order: 9, title: 'Review Loma dan Lemes', playable: false },
];
