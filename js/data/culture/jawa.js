/*
  jawa.js (js/data/culture/)
  Data budaya Bahasa Jawa untuk tab Budaya.

  STEP 6: Isi "content" ditulis ulang dari gaya ringkasan-ensiklopedia
  (kalimat generik, template sama persis dengan sunda.js) jadi lebih
  mengalir & personal -- seolah dijelaskan orang, bukan dirangkum robot.
  needsValidation masih dipertahankan apa adanya: konten tetap ringan &
  umum untuk kebutuhan prototype, belum divalidasi native speaker/pakar.

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
  },
  {
    id: 'sapaan',
    title: 'Sapaan',
    icon: 'wave',
    description: 'Kenapa Sugeng Enjing beda dari Sugeng Siang',
    content:
      'Kamu pasti sudah ketemu Sugeng Enjing dan Sugeng Siang di Unit 1, nah, itu bukan kebetulan ada beberapa versi. Sapaan dalam Bahasa Jawa memang biasa mengikuti jam: pagi, siang, sore, sampai malam masing-masing punya sapaannya sendiri. Kelihatannya detail kecil, tapi ini cukup melekat dalam keseharian, dipakai ke siapa saja (tetangga yang sudah akrab maupun orang yang baru berpapasan di jalan). Semacam cara kecil untuk menunjukkan kalau kita memperhatikan orang lain.',
  },
  {
    id: 'kehidupan-sehari-hari',
    title: 'Kehidupan Sehari-hari',
    icon: 'house',
    description: 'Kebiasaan kecil yang ikut kebawa ke cara berbahasa',
    content:
      'Coba perhatikan, banyak hal kecil dalam keseharian orang Jawa yang akhirnya ikut membentuk bahasanya: cara menyapa tetangga waktu lewat depan rumah, cara bilang terima kasih, sampai cara memilih kata waktu ngobrol sama orang yang lebih tua. Di prototype ini kita baru sempat kenalan lewat kosakata dasarnya saja, konteks kehidupan sehari-hari yang lebih luas rencananya bakal terus ditambahkan seiring unit-unit berikutnya berkembang.',
    needsValidation: true,
  },
  {
    id: 'tradisi',
    title: 'Tradisi',
    icon: 'candle',
    description: 'Tradisi yang masih hidup, dengan caranya masing-masing',
    content:
      'Beberapa tradisi di lingkungan masyarakat Jawa masih dijalankan sampai sekarang, meski wajar kalau bentuknya sudah tidak sama persis di tiap daerah atau keluarga, tergantung seberapa kental adatnya dipegang. Bahasa Jawa sendiri sering muncul di momen-momen itu, misalnya lewat ucapan atau doa tertentu dalam acara adat. Ini topik yang sebenarnya luas banget, jadi kontennya akan terus dilengkapi ke depannya.',
    needsValidation: true,
  },
  {
    id: 'kesenian',
    title: 'Kesenian',
    icon: 'mask',
    description: 'Wayang, tembang, dan bahasa yang hidup lewat panggung',
    content:
      'Kalau mau dengar Bahasa Jawa dengan cara yang berbeda, coba tonton pertunjukan wayang atau dengarkan tembang (lagu tradisionalnya). Di situ, bahasa nggak cuma jadi alat komunikasi biasa, tapi juga medium bercerita, lengkap dengan iramanya sendiri. Buat yang penasaran sama budayanya, ini bisa jadi pintu masuk yang menyenangkan, karena kamu belajar bahasa sekaligus menikmati keseniannya.',
    needsValidation: true,
  },
];
