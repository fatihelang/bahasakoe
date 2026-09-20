/*
  pathTrail.js
  Geometri untuk visual "jalur belajar" bergelombang -- dipakai bareng oleh
  Learning Path (daftar Unit) dan Unit Detail (daftar Lesson dalam satu
  Unit), supaya kedua layar itu terasa satu bahasa visual yang sama tanpa
  menduplikasi matematika kurva-nya dua kali.

  KENAPA BUKAN ZIGZAG ALA DUOLINGO:
  Zigzag klasik menaruh tiap node bergantian pas di kiri - tengah - kanan -
  tengah dengan jarak & amplitudo yang SAMA PERSIS tiap kali (satu gelombang
  periodik). Itu yang bikin polanya gampang dikenali sebagai "template
  duolingo-clone". Jalur di sini dibentuk dari DUA gelombang yang
  frekuensinya sengaja tidak senada satu sama lain (mirip kurva Lissajous),
  ditambah jitter kecil yang diturunkan dari id tiap item -- hasilnya jalur
  yang melengkung mengalir natural (seperti jalan setapak di peta), tidak
  pernah terasa mekanis meski daftarnya panjang, dan TIDAK PERNAH acak ulang
  di render berikutnya karena jitter-nya deterministik (dari id, bukan
  Math.random()).

  RUANG KOORDINAT:
  Sumbu X dihitung dalam PERSEN (0-100), sumbu Y dalam piksel. Pemanggil
  merender node sebagai elemen HTML posisi absolute (`left: X%; top: Ypx`)
  dan garis penghubung sebagai satu <svg> dengan
  `viewBox="0 0 100 <totalHeight>"` + `width: 100%`. Karena X selalu dalam
  basis yang sama (persen), garis svg & posisi node presisi sinkron di
  lebar container berapa pun (mobile ~360px atau desktop ~800px) TANPA
  perlu ResizeObserver atau kalkulasi ulang saat resize.

  Modul ini SENGAJA cuma menghitung geometri (angka), tidak menyentuh DOM
  sama sekali -- markup/isi tiap node (judul, subtitle, ikon marker, status
  klik) tetap jadi tanggung jawab masing-masing screen (learningPath.js /
  unitDetail.js), sama seperti duplikasi getLessonStatus/markerContent yang
  sudah didokumentasikan di unitDetail.js: dua layar itu punya aturan
  status & interaksi yang beda (unit vs lesson), jadi tidak digabung jadi
  satu fungsi generik yang justru bikin keduanya saling menyandera kalau
  salah satu perlu diubah nanti.
*/

const AMPLITUDE_PERCENT = 15; // kekuatan gelombang utama, dalam persen dari lebar container
const JITTER_PERCENT = 6; // variasi kecil per-item di atas gelombang, supaya tidak terlalu "rapi"
const X_MIN = 22; // batas aman kiri (persen) -- jaga label tidak kepotong tepi container
const X_MAX = 78; // batas aman kanan (persen)

const NODE_SPACING_PX = 152; // jarak vertikal antar node (cukup ruang utk judul 2 baris + subtitle)
// Padding atas/bawah harus menyisakan ruang untuk SETENGAH tinggi marker
// (marker 52px, lihat components.css) + label di bawahnya -- kalau tidak,
// node pertama/trofi akhir bisa "nabrak" konten di atas/bawah .path-trail
// karena posisinya absolute & di-translate ke tengah titik (x,y).
const TOP_PADDING_PX = 46;
const BOTTOM_PADDING_PX = 60;
const END_CAP_GAP_PX = NODE_SPACING_PX * 0.78; // jarak trofi akhir dari node terakhir

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Hash string -> pecahan 0..1. Dipakai sebagai jitter DETERMINISTIK per id
// (bukan Math.random()) supaya posisi tiap node stabil, tidak lompat-lompat
// setiap kali layar dirender ulang.
function hashToUnit(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000;
}

function xOffsetForIndex(index, id) {
  const wave =
    Math.sin(index * 0.7) * AMPLITUDE_PERCENT * 0.65 +
    Math.sin(index * 1.9 + 0.6) * AMPLITUDE_PERCENT * 0.35;
  const jitter = (hashToUnit(id) - 0.5) * JITTER_PERCENT;
  return clamp(50 + wave + jitter, X_MIN, X_MAX);
}

// Catmull-Rom -> kurva bezier kubik, supaya garis lewat semua titik dengan
// halus (bukan garis lurus patah-patah antar node).
function smoothPathD(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const d = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x} ${p2.y}`);
  }
  return d.join(' ');
}

/**
 * Hitung layout jalur untuk satu daftar item (Unit ATAU Lesson).
 *
 * @param items - array item apa pun (unit[] atau lesson[])
 * @param getId - (item) => string id stabil, sumber jitter deterministik
 * @param getStatus - (item) => 'completed' | 'current' | 'locked'
 * @param endCap - kalau true, tambahkan satu titik dekoratif (bukan item,
 *   tidak bisa diklik) di ujung bawah jalur -- dipakai Learning Path
 *   sebagai "tujuan akhir" (trofi) supaya jalur terasa punya arah/tujuan,
 *   bukan cuma berhenti begitu saja di node terakhir.
 *
 * @returns {
 *   points: [{ item, index, id, x, y, status }],
 *   pathD: string,           // path SVG penuh (semua node, warna netral)
 *   travelledPathD: string,  // path SVG dari awal s.d. progres sekarang (warna sukses)
 *   totalHeight: number,     // tinggi total dalam px, dipakai sbg height svg & container
 *   cap: { x, y, reached } | null,
 * }
 */
export function computeTrailLayout(items, { getId, getStatus, endCap = false } = {}) {
  const points = items.map((item, index) => ({
    item,
    index,
    id: getId(item),
    status: getStatus(item),
    x: xOffsetForIndex(index, getId(item)),
    y: TOP_PADDING_PX + index * NODE_SPACING_PX,
  }));

  // Progres "ditempuh" = deretan completed dari awal (kontigu), diperpanjang
  // sampai node 'current' kalau ada (supaya garis hijau terasa "menuju" ke
  // posisi user sekarang, bukan berhenti pas di node completed terakhir).
  let travelledEnd = -1;
  for (const p of points) {
    if (p.status === 'completed') travelledEnd = p.index;
    else break;
  }
  const currentIndex = points.findIndex((p) => p.status === 'current');
  if (currentIndex >= 0) travelledEnd = Math.max(travelledEnd, currentIndex);

  const allCompleted =
    points.length > 0 && travelledEnd === points.length - 1 && points[points.length - 1].status === 'completed';

  let curvePoints = points.map((p) => ({ x: p.x, y: p.y }));
  let cap = null;
  if (endCap && points.length > 0) {
    const last = points[points.length - 1];
    cap = { x: 50, y: last.y + END_CAP_GAP_PX, reached: allCompleted };
    curvePoints = [...curvePoints, { x: cap.x, y: cap.y }];
  }

  const pathD = smoothPathD(curvePoints);

  let travelledSliceEnd = travelledEnd >= 0 ? travelledEnd + 1 : 0;
  if (allCompleted && cap) travelledSliceEnd = curvePoints.length; // ikut tarik ke trofi
  const travelledPoints = curvePoints.slice(0, travelledSliceEnd);
  const travelledPathD = travelledPoints.length >= 2 ? smoothPathD(travelledPoints) : '';

  const lastY = cap ? cap.y : points.length > 0 ? points[points.length - 1].y : 0;
  const totalHeight = lastY + BOTTOM_PADDING_PX;

  return { points, pathD, travelledPathD, totalHeight, cap };
}
