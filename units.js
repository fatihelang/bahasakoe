/*
  units.js (js/data/jawa/)
  Daftar Unit untuk Bahasa Jawa. STEP 2 menambahkan Unit 2 (sekarang
  bernama "Berbicara dengan Hormat", lihat UX REVISION 0 di bawah -- nama
  awalnya "Unggah-Ungguh") di sini -- cukup "tambah satu object + satu
  file lesson baru", tanpa
  menyentuh curriculum.js, appState.js, atau screen manapun (persis seperti
  yang dijelaskan di komentar bawah ini, ditulis sejak STEP 1).

  unit = { id, order, title, description, lessons[] }
  - id: dipakai sebagai key progress (progress[languageId][unitId], lihat
    state/appState.js) -- HARUS stabil, jangan diganti-ganti setelah dirilis
    karena progress user tersimpan berdasarkan id ini.
  - title: nama unit saja (mis. "Dasar Bahasa Jawa"), TANPA prefix "Unit 1 -- ".
    Prefix "Unit {order}" dirangkai di layer UI (lihat screens/learningPath.js,
    unitDetail.js) dari field "order", supaya tidak ada string gabungan yang
    harus di-parse ulang (unit1.title.split(' -- ') pada versi sebelumnya).
  - lessons: diimpor dari file lesson terpisah (unit1.js, unit2.js) -- isinya
    sendiri TIDAK diubah dari sebelumnya.
*/

import { LESSONS } from './unit1.js';
import { LESSONS as LESSONS_UNIT2 } from './unit2.js';

export const UNITS = [
  {
    id: 'unit1',
    order: 1,
    title: 'Dasar Bahasa Jawa',
    description: 'Kenali kosakata dan ungkapan dasar untuk membangun fondasi Bahasa Jawa.',
    lessons: LESSONS,
  },
  {
    id: 'unit2',
    order: 2,
    // UX REVISION 0: nama unit diubah dari "Unggah-Ungguh" -> "Berbicara
    // dengan Hormat" -- nama lama terlalu mudah tertukar dengan topik
    // budaya yang sebelumnya jadi tab Budaya terpisah. "Unggah-ungguh"
    // tetap boleh muncul SEBAGAI ISTILAH di dalam lesson (Culture Moment/
    // cultureInsight), bukan lagi sebagai nama destination/unit.
    title: 'Berbicara dengan Hormat',
    description: 'Pelajari cara menyesuaikan bahasa Jawa berdasarkan lawan bicara dan situasi.',
    lessons: LESSONS_UNIT2,
  },
];
