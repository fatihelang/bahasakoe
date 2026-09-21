/*
  units.js (js/data/sunda/)
  Daftar Unit untuk Bahasa Sunda -- pola identik dengan js/data/jawa/units.js.
  Unit 1 (Dasar) dan Unit 2 (Berbicara dengan Hormat: tingkat tutur loma dan
  lemes, padanan ngoko/krama di Bahasa Jawa).
*/

import { LESSONS } from './unit1.js';
import { LESSONS as LESSONS_UNIT2 } from './unit2.js';

export const UNITS = [
  {
    id: 'unit1',
    order: 1,
    title: 'Dasar Bahasa Sunda',
    description: 'Kenali kosakata dan ungkapan dasar untuk membangun fondasi Bahasa Sunda.',
    lessons: LESSONS,
  },
  {
    id: 'unit2',
    order: 2,
    title: 'Berbicara dengan Hormat',
    description: 'Pelajari cara menyesuaikan Bahasa Sunda berdasarkan lawan bicara: bentuk loma (akrab) dan lemes (sopan).',
    lessons: LESSONS_UNIT2,
  },
];
