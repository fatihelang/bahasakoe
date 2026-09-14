/*
  jawa.js (js/data/culture/)
  Data budaya Bahasa Jawa untuk tab Budaya.

  STEP 6: Isi "content" ditulis ulang dari gaya ringkasan-ensiklopedia
  (kalimat generik, template sama persis dengan sunda.js) jadi lebih
  mengalir & personal -- seolah dijelaskan orang, bukan dirangkum robot.
  needsValidation masih dipertahankan apa adanya: konten tetap ringan &
  umum untuk kebutuhan prototype, belum divalidasi native speaker/pakar.

  CULTURE EXPERIENCE OVERHAUL: setiap topic sekarang juga punya
  "activities" (array activity interaktif, dirender generik oleh
  culture.js lewat activity.type -- lihat komentar lengkap skema di
  js/data/culture/index.js) dan "takeaway" (kesimpulan singkat di akhir
  topic). "content"/"highlights" LAMA tetap dipertahankan apa adanya
  (dipakai sebagai fallback kalau suatu topic ternyata tidak listnya
  activities sama sekali, dan tetap jadi sumber teks yang activities-nya
  turunkan -- tidak ada fakta baru yang dikarang di luar apa yang sudah
  ada di content/highlights/data lesson Unit 1 & 2).

  Semua kosakata & contoh kalimat di dalam activities SENGAJA diambil
  APA ADANYA dari js/data/jawa/unit1.js & unit2.js (Sugeng Enjing/Siang/
  Sonten/Dalu, Matur Nuwun/Sami-sami, Sopo jenengmu?/Nami panjenengan
  sinten?, Tulung/Nyuwun tulung) -- bukan kosakata baru yang dikarang
  khusus untuk Budaya.

  Struktur: lihat komentar lengkap di js/data/culture/index.js.
*/

export const TOPICS = [
  {
    id: 'unggah-ungguh',
    title: 'Unggah-Ungguh',
    icon: 'handsTogether', // key -> js/ui/icons.js
    description: 'Kenapa cara ngomongmu bisa berubah tergantung lawan bicara',
    content:
      'Ini salah satu hal pertama yang bikin orang kaget belajar Bahasa Jawa: kamu nggak cuma belajar satu cara ngomong, tapi beberapa "level" sekaligus. Ke teman sebaya, wajar pakai ngoko yang santai. Tapi begitu lawan bicaramu orang yang lebih tua, atasan, atau orang yang baru kamu kenal, biasanya orang beralih ke krama yang lebih halus. Bukan soal sok formal, ini lebih ke cara menunjukkan hormat lewat pilihan kata. Unggah-ungguh, begitu sebutannya. Nanti bakal dibahas lebih detail pas Unit 2, karena topik ini memang cukup dalam untuk satu pembahasan singkat.',
    highlights: [
      { label: 'Ngoko', text: 'Santai, dipakai ke teman sebaya atau orang yang sudah akrab.' },
      { label: 'Krama', text: 'Lebih halus, dipakai ke orang yang lebih tua, atasan, atau baru dikenal.' },
    ],
    needsValidation: true,
    activities: [
      {
        type: 'scenario',
        situation: 'Kamu ketemu teman sebaya di kampus. Kamu mau nanya namanya.',
        prompt: 'Ucapan mana yang paling pas buat situasi ini?',
        options: ['Sopo jenengmu?', 'Nami panjenengan sinten?'],
        correctIndex: 0,
        feedback: 'Situasinya santai, ke teman sebaya, jadi bentuk ngoko kayak gini lebih umum dipakai.',
        explanation: 'Kalau lawan bicaranya orang yang lebih tua atau baru dikenal, bentuk krama biasanya lebih dipilih.',
        needsValidation: true,
      },
      {
        type: 'compare',
        left: {
          label: 'NGOKO',
          description: 'Santai, dipakai ke teman sebaya atau yang sudah akrab.',
          items: [
            { native: 'Sopo jenengmu?', arti: 'Siapa namamu?' },
            { native: 'Tulung', arti: 'Tolong' },
          ],
        },
        right: {
          label: 'KRAMA',
          description: 'Lebih halus, dipakai ke orang yang lebih tua atau baru dikenal.',
          items: [
            { native: 'Nami panjenengan sinten?', arti: 'Siapa nama Anda?' },
            { native: 'Nyuwun tulung', arti: 'Minta tolong' },
          ],
        },
        needsValidation: true,
      },
      {
        type: 'quiz',
        questions: [
          {
            prompt: 'Kamu ngobrol sama Bu Guru di sekolah. Mana yang lebih sesuai?',
            options: ['Ngoko', 'Krama'],
            correctIndex: 1,
            feedback: 'Ke orang yang lebih dihormati, krama umumnya lebih dipilih.',
          },
        ],
        needsValidation: true,
      },
    ],
    takeaway: {
      body: 'Bahasa Jawa bukan cuma soal arti kata. Siapa lawan bicaramu ikut nentuin bentuk yang biasa dipakai -- dan ini bukan aturan mati buat semua orang.',
    },
  },
  {
    id: 'sapaan',
    title: 'Sapaan',
    icon: 'wave',
    description: 'Kenapa Sugeng Enjing beda dari Sugeng Siang',
    content:
      'Kamu pasti sudah ketemu Sugeng Enjing dan Sugeng Siang di Unit 1, nah, itu bukan kebetulan ada beberapa versi. Sapaan dalam Bahasa Jawa memang biasa mengikuti jam: pagi, siang, sore, sampai malam masing-masing punya sapaannya sendiri. Kelihatannya detail kecil, tapi ini cukup melekat dalam keseharian, dipakai ke siapa saja (tetangga yang sudah akrab maupun orang yang baru berpapasan di jalan). Semacam cara kecil untuk menunjukkan kalau kita memperhatikan orang lain.',
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Sugeng Enjing', back: 'Selamat pagi' },
          { front: 'Sugeng Siang', back: 'Selamat siang' },
          { front: 'Sugeng Sonten', back: 'Selamat sore' },
          { front: 'Sugeng Dalu', back: 'Selamat malam' },
        ],
      },
      {
        type: 'scenario',
        situation: 'Kamu papasan sama tetangga waktu sore hari.',
        prompt: 'Sapaan yang paling pas buat situasi ini?',
        options: ['Sugeng Enjing', 'Sugeng Siang', 'Sugeng Sonten', 'Sugeng Dalu'],
        correctIndex: 2,
        feedback: '"Sonten" berarti sore, jadi ini sapaan yang pas buat waktu itu.',
        explanation: 'Sapaan dalam Bahasa Jawa memang biasa mengikuti jam -- pagi, siang, sore, sampai malam masing-masing punya sapaannya sendiri.',
      },
    ],
    takeaway: {
      body: 'Sapaan Jawa berubah sesuai jam, dari Sugeng Enjing di pagi hari sampai Sugeng Dalu waktu malam. Detail kecil ini kepakai tiap hari.',
    },
  },
  {
    id: 'kehidupan-sehari-hari',
    title: 'Kehidupan Sehari-hari',
    icon: 'house',
    description: 'Kebiasaan kecil yang ikut kebawa ke cara berbahasa',
    content:
      'Coba perhatikan, banyak hal kecil dalam keseharian orang Jawa yang akhirnya ikut membentuk bahasanya: cara menyapa tetangga waktu lewat depan rumah, cara bilang terima kasih, sampai cara memilih kata waktu ngobrol sama orang yang lebih tua. Di prototype ini kita baru sempat kenalan lewat kosakata dasarnya saja, konteks kehidupan sehari-hari yang lebih luas rencananya bakal terus ditambahkan seiring unit-unit berikutnya berkembang.',
    needsValidation: true,
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Nyapa Tetangga', back: 'Sapaan kayak Sugeng Enjing/Siang biasa dipakai waktu papasan sama tetangga.' },
          { front: 'Bilang Terima Kasih', back: '"Matur Nuwun" dipakai buat terima kasih, dibalas dengan "Sami-sami".' },
        ],
      },
    ],
    takeaway: {
      body: 'Kebiasaan kecil sehari-hari, cara nyapa, cara bilang terima kasih, ikut kebawa ke cara orang Jawa berbahasa.',
    },
  },
  {
    id: 'tradisi',
    title: 'Tradisi',
    icon: 'candle',
    description: 'Tradisi yang masih hidup, dengan caranya masing-masing',
    content:
      'Beberapa tradisi di lingkungan masyarakat Jawa masih dijalankan sampai sekarang, meski wajar kalau bentuknya sudah tidak sama persis di tiap daerah atau keluarga, tergantung seberapa kental adatnya dipegang. Bahasa Jawa sendiri sering muncul di momen-momen itu, misalnya lewat ucapan atau doa tertentu dalam acara adat. Ini topik yang sebenarnya luas banget, jadi kontennya akan terus dilengkapi ke depannya.',
    needsValidation: true,
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Tradisi & Bahasa', back: 'Bahasa Jawa sering muncul di momen adat, misalnya lewat ucapan atau doa tertentu.' },
        ],
      },
    ],
    takeaway: {
      body: 'Tradisi Jawa bentuknya beda-beda tiap daerah atau keluarga, dan bahasa sering jadi bagian dari momen itu.',
    },
  },
  {
    id: 'kesenian',
    title: 'Kesenian',
    icon: 'mask',
    description: 'Wayang, tembang, dan bahasa yang hidup lewat panggung',
    content:
      'Kalau mau dengar Bahasa Jawa dengan cara yang berbeda, coba tonton pertunjukan wayang atau dengarkan tembang (lagu tradisionalnya). Di situ, bahasa nggak cuma jadi alat komunikasi biasa, tapi juga medium bercerita, lengkap dengan iramanya sendiri. Buat yang penasaran sama budayanya, ini bisa jadi pintu masuk yang menyenangkan, karena kamu belajar bahasa sekaligus menikmati keseniannya.',
    needsValidation: true,
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Wayang', back: 'Bahasa Jawa jadi medium bercerita lewat pertunjukan wayang.' },
          { front: 'Tembang', back: 'Lagu tradisional (tembang) punya iramanya sendiri, lengkap dengan bahasanya.' },
        ],
      },
    ],
    takeaway: {
      body: 'Kesenian kayak wayang dan tembang jadi cara lain buat dengar Bahasa Jawa, sekalian belajar sambil menikmati.',
    },
  },
];
