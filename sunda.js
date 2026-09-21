/*
  sunda.js (js/data/culture/)
  Data budaya Bahasa Sunda untuk tab Budaya -- pola & schema identik
  js/data/culture/jawa.js.

  STEP 6: Isi "content" ditulis ulang supaya punya suara sendiri, bukan
  terjemahan kata-per-kata dari jawa.js (sebelumnya kedua file ini punya
  kalimat generik yang nyaris identik -- ciri khas ringkasan otomatis).

  VALIDASI (WAJIB DIBACA): konten ditulis ringan & umum untuk kebutuhan
  prototype, bukan klaim antropologis final -- bukan hasil validasi native
  speaker/pakar budaya Sunda. needsValidation: true menandai topik yang
  sebaiknya dicek ulang sebelum dipakai di luar konteks prototype (field
  ini tidak ditampilkan ke user). Tidak ada klaim absolut ("selalu",
  "pasti", "semua masyarakat...").

  CULTURE EXPERIENCE OVERHAUL: sama seperti jawa.js, tiap topic sekarang
  juga punya "activities" + "takeaway" -- lihat komentar lengkap di
  jawa.js dan skema di js/data/culture/index.js.

  CATATAN KHUSUS "tatakrama-basa": kurikulum Sunda (js/data/sunda/unit1.js)
  baru mengajarkan kosakata bentuk SOPAN (Abdi/Anjeun/Saha nami anjeun?),
  belum ada padanan loma yang tervalidasi. Supaya TIDAK mengarang kosakata
  loma yang belum ada, activity "compare" di topic ini sengaja hanya diisi
  "left"/"right" TANPA "items" (cuma label + description dari highlights
  yang sudah ada) -- culture.js otomatis fallback ke tampilan tap-to-reveal
  sederhana untuk kasus ini (lihat komentar renderCompareActivity di
  js/screens/culture.js).
*/

export const TOPICS = [
  {
    id: 'tatakrama-basa',
    title: 'Tatakrama Basa',
    icon: 'handsTogether', // key -> js/ui/icons.js
    description: 'Loma atau lemes? Tergantung siapa yang diajak bicara',
    content:
      'Mirip seperti unggah-ungguh di Bahasa Jawa, Basa Sunda juga punya tingkatan kehalusan bicara. Ada loma, versi yang lebih santai dan biasa dipakai di percakapan sehari-hari, dan ada lemes, versi yang lebih sopan buat lawan bicara yang lebih dihormati atau baru dikenal. Bedanya bukan cuma soal kata yang "lebih bagus", lebih ke rasa sopan-santun yang ditunjukkan lewat pilihan kata. Topik ini bakal kita kupas lebih jauh di unit-unit berikutnya, karena aturannya cukup kaya untuk dijelaskan sekilas saja.',
    highlights: [
      { label: 'Loma', text: 'Santai, biasa dipakai di percakapan sehari-hari.' },
      { label: 'Lemes', text: 'Lebih sopan, dipakai ke lawan bicara yang dihormati atau baru dikenal.' },
    ],
    needsValidation: true,
    activities: [
      {
        type: 'scenario',
        situation: 'Kamu ketemu orang yang baru kamu kenal, dan mau nanya namanya.',
        prompt: 'Ucapan mana yang paling pas buat situasi ini?',
        options: ['Saha nami anjeun?', 'Hatur nuhun', 'Wilujeng wengi'],
        correctIndex: 0,
        feedback: '"Saha nami anjeun?" memang dipakai buat nanya nama, apalagi ke orang yang baru dikenal.',
        explanation: '"Hatur nuhun" artinya terima kasih, "Wilujeng wengi" itu sapaan malam -- dua-duanya bukan buat nanya nama.',
        needsValidation: true,
      },
      {
        // Sengaja TANPA "items" (lihat catatan berkas di atas) -- culture.js
        // fallback ke dua kartu tap-to-reveal berisi label + description ini.
        type: 'compare',
        left: { label: 'LOMA', description: 'Santai, biasa dipakai di percakapan sehari-hari.' },
        right: { label: 'LEMES', description: 'Lebih sopan, dipakai ke lawan bicara yang dihormati atau baru dikenal.' },
        needsValidation: true,
      },
      {
        type: 'quiz',
        questions: [
          {
            prompt: 'Kamu ngobrol sama orang yang lebih tua (sepuh). Mana yang lebih sesuai?',
            options: ['Loma', 'Lemes'],
            correctIndex: 1,
            feedback: 'Ke yang lebih dihormati, lemes umumnya lebih dipilih.',
          },
        ],
        needsValidation: true,
      },
    ],
    takeaway: {
      body: 'Basa Sunda juga punya tingkatan kehalusan. Loma buat yang udah akrab, lemes buat yang lebih dihormati atau baru dikenal.',
    },
  },
  {
    id: 'sapaan',
    title: 'Sapaan',
    icon: 'wave',
    description: 'Wilujeng, sapaan yang berubah mengikuti jam',
    content:
      'Ingat Wilujeng Enjing dan Wilujeng Siang yang sudah kamu pelajari di Unit 1? Sapaan dalam Basa Sunda memang punya kebiasaan mengikuti waktu: pagi, siang, sore, sampai malam masing-masing punya sapaannya. Dipakainya pun cukup luwes, baik ke orang yang sudah akrab maupun yang baru ketemu, sebagai cara sederhana untuk terdengar ramah dalam obrolan sehari-hari.',
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Wilujeng Enjing', back: 'Selamat pagi' },
          { front: 'Wilujeng Siang', back: 'Selamat siang' },
          { front: 'Wilujeng Sonten', back: 'Selamat sore' },
          { front: 'Wilujeng Wengi', back: 'Selamat malam' },
        ],
      },
      {
        type: 'scenario',
        situation: 'Kamu papasan sama tetangga waktu sore hari.',
        prompt: 'Sapaan yang paling pas buat situasi ini?',
        options: ['Wilujeng Enjing', 'Wilujeng Siang', 'Wilujeng Sonten', 'Wilujeng Wengi'],
        correctIndex: 2,
        feedback: '"Sonten" berarti sore, jadi ini yang paling pas.',
        explanation: 'Sapaan dalam Basa Sunda juga biasa mengikuti jam, sama seperti yang sudah dipelajari di Unit 1.',
      },
    ],
    takeaway: {
      body: 'Wilujeng Enjing, Siang, Sonten, sampai Wengi -- sapaan Sunda berubah sesuai jam, dipakai luwes ke siapa saja.',
    },
  },
  {
    id: 'kehidupan-sehari-hari',
    title: 'Kehidupan Sehari-hari',
    icon: 'house',
    description: 'Hal-hal kecil yang ikut mewarnai cara bicara sehari-hari',
    content:
      'Kalau diperhatikan, cukup banyak kebiasaan sehari-hari masyarakat Sunda yang akhirnya menempel di bahasanya, mulai dari cara menyapa tetangga, cara mengucap terima kasih, sampai cara memilih kata ke orang yang lebih tua. Prototype ini baru mengenalkan sebagian lewat kosakata dasar, konteks kehidupan sehari-hari yang lebih lengkap akan terus ditambahkan seiring unit-unit selanjutnya digarap.',
    needsValidation: true,
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Nyapa Tatangga', back: 'Sapaan kayak Wilujeng Enjing/Siang biasa dipakai waktu papasan sama tetangga.' },
          { front: 'Nganuhunkeun', back: '"Hatur Nuhun" dipakai buat bilang terima kasih ke siapa saja.' },
        ],
      },
    ],
    takeaway: {
      body: 'Kebiasaan kecil sehari-hari ikut mewarnai cara masyarakat Sunda berbahasa, mulai dari nyapa sampai nganuhunkeun.',
    },
  },
  {
    id: 'tradisi',
    title: 'Tradisi',
    icon: 'candle',
    description: 'Tradisi yang bentuknya berbeda-beda tiap daerah',
    content:
      'Beberapa tradisi di lingkungan masyarakat Sunda masih berjalan sampai hari ini, walau intensitas dan bentuknya bisa berbeda dari satu daerah atau keluarga ke keluarga lain. Basa Sunda biasanya turut hadir dalam momen-momen itu, misalnya lewat ucapan-ucapan khas di acara adat. Topik ini masih akan terus dikembangkan lagi ke depannya, karena satu paragraf jelas belum cukup untuk merangkumnya.',
    needsValidation: true,
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Tradisi & Basa', back: 'Basa Sunda sering hadir dalam momen adat, misalnya lewat ucapan-ucapan khas.' },
        ],
      },
    ],
    takeaway: {
      body: 'Tradisi Sunda bentuknya beda-beda tiap daerah atau keluarga, dan bahasa sering jadi bagian dari momen itu.',
    },
  },
  {
    id: 'kesenian',
    title: 'Kesenian',
    icon: 'mask',
    description: 'Wayang golek, kacapi suling, dan bahasa yang mengalun',
    content:
      'Salah satu cara asyik mendengar Basa Sunda "hidup" adalah lewat wayang golek atau alunan kacapi suling. Di situ bahasa bukan cuma dipakai buat ngobrol, tapi juga jadi bagian dari cerita dan musiknya sendiri. Kalau kamu penasaran sama budayanya, kesenian semacam ini lumayan jadi jalan masuk yang enak, sambil belajar bahasa, sambil menikmati pertunjukannya.',
    needsValidation: true,
    activities: [
      {
        type: 'reveal',
        cards: [
          { front: 'Wayang Golek', back: 'Basa Sunda hidup lewat cerita di pertunjukan wayang golek.' },
          { front: 'Kacapi Suling', back: 'Alunan kacapi suling bikin Basa Sunda kedengaran lewat musik & lirik.' },
        ],
      },
    ],
    takeaway: {
      body: 'Kesenian kayak wayang golek dan kacapi suling jadi cara asyik buat dengar Basa Sunda hidup.',
    },
  },
];
