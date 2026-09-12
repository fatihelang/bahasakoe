/*
  badges.js (data)
  Definisi badge murni — tidak ada logic pengecekan status di sini.
  Logic "apakah badge ini sudah didapat" ada di appState.js (satu-satunya
  tempat yang boleh membaca progress), supaya file ini tetap murni data
  dan gampang ditambah/diubah tanpa menyentuh logic.

  requirement.type yang didukung:
  - 'lessonsCompleted': earned kalau completedLessons.length >= value
  - 'streak'          : earned kalau streak (hari) >= value
*/

export const BADGES = [
  {
    id: 'first-lesson',
    title: 'Langkah Pertama',
    description: 'Selesaikan lesson pertamamu',
    icon: 'seedling', // key -> js/ui/icons.js, diresolve di layer UI (profile.js)
    requirement: { type: 'lessonsCompleted', value: 1 },
  },
  {
    id: 'two-lessons',
    title: 'Semangat Belajar',
    description: 'Selesaikan 2 lesson',
    icon: 'flame',
    requirement: { type: 'lessonsCompleted', value: 2 },
  },
  {
    id: 'unit1-mvp',
    title: 'Unit 1 MVP Tuntas',
    description: 'Selesaikan semua lesson yang tersedia di prototype ini',
    icon: 'trophy',
    requirement: { type: 'lessonsCompleted', value: 3 },
  },
  {
    id: 'streak-3',
    title: 'Streak 3 Hari',
    description: 'Belajar 3 hari berturut-turut',
    icon: 'zap',
    requirement: { type: 'streak', value: 3 },
  },
];
