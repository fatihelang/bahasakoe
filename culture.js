/*
  culture.js (data)
  Data murni untuk tab Budaya — exploratory learning, terpisah dari
  lesson flow. Tidak ada logic di sini.

  Struktur:
  topic = { id, title, icon, description, content, needsValidation? }
  icon: key string yang merujuk ke js/ui/icons.js (bukan emoji) — diresolve
  di layer UI (screens/culture.js, screens/home.js), bukan di sini.

  Catatan konten: ditulis ringan & umum untuk kebutuhan prototype/pitching,
  bukan klaim antropologis final. needsValidation: true menandai topik yang
  isinya sebaiknya dicek ulang oleh native speaker/ahli budaya Jawa sebelum
  dipakai di luar konteks prototype. Field ini tidak ditampilkan ke user.
*/

export const CULTURE_TOPICS = [
  {
    id: 'unggah-ungguh',
    title: 'Unggah-Ungguh',
    icon: 'handsTogether', // key -> js/ui/icons.js
    description: 'Tata krama berbahasa sesuai lawan bicara',
    content:
      'Unggah-ungguh adalah konsep tata krama dalam masyarakat Jawa, termasuk dalam cara berbahasa. Secara umum, tingkat bahasa yang dipakai bisa berbeda tergantung siapa lawan bicara — misalnya lebih santai (ngoko) ke teman sebaya, dan lebih halus (krama) ke orang yang lebih tua atau baru dikenal. Konsep ini akan dibahas lebih dalam di Unit 2.',
    needsValidation: true,
  },
  {
    id: 'sapaan',
    title: 'Sapaan',
    icon: 'wave',
    description: 'Kebiasaan menyapa dalam keseharian',
    content:
      'Dalam percakapan sehari-hari, masyarakat Jawa umumnya punya kebiasaan menyapa yang menyesuaikan waktu dalam sehari — seperti yang sudah dipelajari di Unit 1 (Sugeng enjing, Sugeng siang, dan seterusnya). Sapaan semacam ini biasa dipakai baik ke orang yang dikenal maupun tidak, sebagai bentuk keramahan dalam interaksi sosial.',
  },
  {
    id: 'kehidupan-sehari-hari',
    title: 'Kehidupan Sehari-hari',
    icon: 'house',
    description: 'Sekilas kebiasaan dalam keseharian',
    content:
      'Banyak kebiasaan sehari-hari di lingkungan masyarakat Jawa yang tercermin dalam bahasanya — mulai dari cara menyapa tetangga, cara berterima kasih, hingga cara berbicara dengan orang yang lebih tua. Prototype ini baru menyentuh permukaannya lewat kosakata dasar; konteks yang lebih luas akan terus dikembangkan di unit-unit berikutnya.',
    needsValidation: true,
  },
  {
    id: 'tradisi',
    title: 'Tradisi',
    icon: 'candle',
    description: 'Sekilas tradisi yang masih dijalankan',
    content:
      'Beberapa tradisi di lingkungan masyarakat Jawa masih dijalankan hingga sekarang, meski bentuk dan intensitasnya bisa berbeda-beda antar daerah dan keluarga. Bahasa Jawa sering menjadi bagian penting dalam tradisi tersebut, misalnya dalam ucapan-ucapan tertentu pada acara adat. Topik ini akan diperkaya lebih lanjut seiring pengembangan konten.',
    needsValidation: true,
  },
  {
    id: 'kesenian',
    title: 'Kesenian',
    icon: 'mask',
    description: 'Sekilas seni pertunjukan & kerajinan khas',
    content:
      'Bahasa Jawa juga hidup lewat berbagai bentuk kesenian, seperti wayang, tembang (lagu tradisional), dan berbagai pertunjukan lain yang menggunakan Bahasa Jawa sebagai medium utamanya. Mengenal kesenian ini bisa jadi salah satu cara untuk lebih memahami bahasa dan budayanya secara bersamaan.',
    needsValidation: true,
  },
];

export function getCultureTopicById(topicId) {
  return CULTURE_TOPICS.find((topic) => topic.id === topicId) || null;
}
