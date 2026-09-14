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
  },
  {
    id: 'sapaan',
    title: 'Sapaan',
    icon: 'wave',
    description: 'Wilujeng, sapaan yang berubah mengikuti jam',
    content:
      'Ingat Wilujeng Enjing dan Wilujeng Siang yang sudah kamu pelajari di Unit 1? Sapaan dalam Basa Sunda memang punya kebiasaan mengikuti waktu: pagi, siang, sore, sampai malam masing-masing punya sapaannya. Dipakainya pun cukup luwes, baik ke orang yang sudah akrab maupun yang baru ketemu, sebagai cara sederhana untuk terdengar ramah dalam obrolan sehari-hari.',
  },
  {
    id: 'kehidupan-sehari-hari',
    title: 'Kehidupan Sehari-hari',
    icon: 'house',
    description: 'Hal-hal kecil yang ikut mewarnai cara bicara sehari-hari',
    content:
      'Kalau diperhatikan, cukup banyak kebiasaan sehari-hari masyarakat Sunda yang akhirnya menempel di bahasanya, mulai dari cara menyapa tetangga, cara mengucap terima kasih, sampai cara memilih kata ke orang yang lebih tua. Prototype ini baru mengenalkan sebagian lewat kosakata dasar, konteks kehidupan sehari-hari yang lebih lengkap akan terus ditambahkan seiring unit-unit selanjutnya digarap.',
    needsValidation: true,
  },
  {
    id: 'tradisi',
    title: 'Tradisi',
    icon: 'candle',
    description: 'Tradisi yang bentuknya berbeda-beda tiap daerah',
    content:
      'Beberapa tradisi di lingkungan masyarakat Sunda masih berjalan sampai hari ini, walau intensitas dan bentuknya bisa berbeda dari satu daerah atau keluarga ke keluarga lain. Basa Sunda biasanya turut hadir dalam momen-momen itu, misalnya lewat ucapan-ucapan khas di acara adat. Topik ini masih akan terus dikembangkan lagi ke depannya, karena satu paragraf jelas belum cukup untuk merangkumnya.',
    needsValidation: true,
  },
  {
    id: 'kesenian',
    title: 'Kesenian',
    icon: 'mask',
    description: 'Wayang golek, kacapi suling, dan bahasa yang mengalun',
    content:
      'Salah satu cara asyik mendengar Basa Sunda "hidup" adalah lewat wayang golek atau alunan kacapi suling. Di situ bahasa bukan cuma dipakai buat ngobrol, tapi juga jadi bagian dari cerita dan musiknya sendiri. Kalau kamu penasaran sama budayanya, kesenian semacam ini lumayan jadi jalan masuk yang enak, sambil belajar bahasa, sambil menikmati pertunjukannya.',
    needsValidation: true,
  },
];
