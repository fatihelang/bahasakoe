/*
  cultureSource.js
  SATU aturan untuk semua konten budaya (Culture Moment di lesson.cultureMoment
  dan wawasan budaya di question.cultureInsight): apakah ia tervalidasi, dan
  bagaimana sumbernya ditampilkan.

  Data validasi (opsional) dipasang di item yang divalidasi:

    validation: {
      status: 'validated',            // HANYA nilai ini yang dianggap tervalidasi
      by: 'Nama validator',           // wajib
      role: 'Guru Bahasa Jawa',       // opsional: guru / penutur asli / akademisi
      date: '2026-10-05',             // opsional (YYYY-MM-DD), tampil sebagai "Okt 2026"
      source: 'Judul rujukan / catatan',  // opsional
    }

  Untuk cultureMoment: pasang di objek cultureMoment. Untuk cultureInsight:
  pasang di objek question. Item TANPA `validation` (atau status lain) dianggap
  DRAF. Tidak ada satu pun item yang otomatis dianggap valid.
*/

import { icons } from './icons.js';

/**
 * Perlakuan konten DRAF (belum tervalidasi):
 *   'label' -> tetap tampil dengan label "Draf · belum divalidasi"
 *   'hide'  -> disembunyikan sampai tervalidasi
 * Ganti satu nilai ini untuk mengubah perilaku seluruh aplikasi.
 */
export const DRAFT_POLICY = 'label';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function isCultureValidated(item) {
  return Boolean(item && item.validation && item.validation.status === 'validated' && item.validation.by);
}

/** Apakah konten budaya ini boleh tampil? */
export function shouldShowCulture(item) {
  if (!item) return false;
  return isCultureValidated(item) || DRAFT_POLICY === 'label';
}

function formatDate(iso) {
  const match = /^(\d{4})-(\d{2})/.exec(iso || '');
  if (!match) return '';
  const monthIndex = Number(match[2]) - 1;
  return monthIndex >= 0 && monthIndex < 12 ? `${MONTHS[monthIndex]} ${match[1]}` : '';
}

/** Label sumber: pil status + (bila tervalidasi) nama, peran, tanggal, rujukan. */
export function cultureSourceHtml(item) {
  if (isCultureValidated(item)) {
    const { by, role, date, source } = item.validation;
    const who = [by, role].filter(Boolean).join(', ');
    const when = formatDate(date);
    return `
      <div class="culture-source is-validated">
        <span class="card-badge is-completed">${icons.check}Divalidasi</span>
        <span class="culture-source__text">${who}${when ? ` · ${when}` : ''}</span>
        ${source ? `<span class="culture-source__text">Sumber: ${source}</span>` : ''}
      </div>`;
  }
  return `
    <div class="culture-source">
      <span class="card-badge is-locked">Draf · belum divalidasi</span>
    </div>`;
}
