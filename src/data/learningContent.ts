import {
  MatchingDescription,
  MatchingItem,
  ShapeLearningItem,
  TangramPieceSpec,
  TangramPoint,
  TangramPuzzleSpec,
} from '../types/app';

export const YOUTUBE_LEARNING_VIDEO = {
  videoId: 'EB2rOeSnheY',
  embedUrl: 'https://www.youtube.com/embed/EB2rOeSnheY?rel=0',
  watchUrl: 'https://youtu.be/EB2rOeSnheY?si=mdQxT7sp07mfL8EB',
  title: 'Video Pembelajaran: Mengenal Komposisi Bangun Datar',
  subtitle: 'Matematika Fase B — Kelas 4 Sekolah Dasar',
  description:
    'Mari simak video pembelajaran interaktif tentang bentuk-bentuk bangun datar di sekitar kita, ciri-ciri sisi serta titik sudutnya, dan bagaimana beberapa bangun datar dapat disusun (komposisi) menjadi bentuk baru!',
  preWatchInstructions: [
    'Pastikan volume perangkatmu terdengar jelas dan duduklah dengan nyaman.',
    'Perhatikan bentuk bangun datar dan contoh benda nyata yang muncul di dalam video.',
    'Catat atau ingat berapa jumlah sisi dan titik sudut pada setiap bangun datar.',
    'Setelah selesai menonton, klik tombol "Lanjut ke Materi Bangun Datar" untuk eksplorasi interaktif!',
  ],
  teacherScenario: [
    'Guru mengarahkan siswa untuk menekan tombol Putar (Play) pada pemutar video.',
    'Sesuai Prinsip Segmentasi Mayer, guru dapat menjeda (pause) video pada bagian penting untuk bertanya kepada siswa tentang contoh benda di kelas.',
    'Guru dan siswa mendiskusikan isi video sebelum beralih ke eksplorasi Materi Bangun Datar.',
  ],
};

export const SHAPES_LEARNING_DATA: ShapeLearningItem[] = [
  {
    id: 'persegi',
    order: 1,
    name: 'Persegi',
    realObjectName: 'Ubin keramik (lantai)',
    realObjectShortLabel: 'Ubin keramik (lantai)',
    sidesCount: 4,
    verticesCount: 4,
    keyCharacteristics: [
      'Memiliki 4 titik sudut siku-siku.',
      'Memiliki 4 sisi yang semuanya sama panjang.',
      'Contoh benda nyata di sekitar kita adalah ubin keramik lantai.',
    ],
    sideHighlightNote: 'Keempat garis sisi menyala bersamaan — semuanya sama panjang!',
    vertexHighlightNote: 'Keempat titik sudut di pojok menyala — berjumlah 4 titik sudut!',
    screenText: '“Persegi” dan “Ubin keramik (lantai)”',
    narrationText:
      'Pertama, Persegi. Ciri utamanya: punya empat titik sudut dan empat sisi yang semuanya sama panjang. Contoh bendanya adalah ubin lantai.',
    mayerPrincipleNote:
      'Signaling & Spatial Contiguity: Teks kunci berada tepat di samping gambar. Garis sisi menyala bersamaan dan setiap titik sudut menyala untuk menegaskan ciri utama persegi.',
    teacherStudentScenario: [
      'Guru diam menyimak penjelasan bersama siswa di depan kelas (agar fokus siswa tidak terpecah karena dua orang bersuara).',
      'Guru dapat menunjuk lantai kelas dan bertanya: "Coba lihat ubin lantai di bawah kaki kita, apakah keempat sisinya sama panjang?"',
    ],
  },
  {
    id: 'persegi_panjang',
    order: 2,
    name: 'Persegi Panjang',
    realObjectName: 'Papan tulis',
    realObjectShortLabel: 'Papan tulis',
    sidesCount: 4,
    verticesCount: 4,
    keyCharacteristics: [
      'Memiliki 2 pasang sisi yang berhadapan sama panjang (atas-bawah dan kiri-kanan).',
      'Memiliki 4 titik sudut.',
      'Contoh benda nyata di kelas kita adalah papan tulis.',
    ],
    sideHighlightNote: 'Pasangan sisi berhadapan (atas-bawah & kiri-kanan) menyala bersamaan!',
    vertexHighlightNote: 'Keempat titik sudut pada pojok persegi panjang menyala!',
    screenText: '“Persegi panjang” dan “Papan tulis”',
    narrationText:
      'Kedua, Persegi Panjang. Sisi yang berhadapan sama panjang. Persegi panjang juga memiliki empat titik sudut. Contoh benda di sekitar kita adalah papan tulis.',
    mayerPrincipleNote:
      'Signaling & Spatial Contiguity: Teks kunci berada tepat di samping gambar. Garis sisi berhadapan menyala bersamaan dan setiap titik sudut menyala untuk menegaskan ciri utama persegi panjang.',
    teacherStudentScenario: [
      'Guru menyimak tayangan bersama siswa.',
      'Guru menunjuk papan tulis di depan kelas: "Lihat papan tulis kita, sisi atas dan bawahnya sama panjang, sisi kiri dan kanannya juga sama panjang!"',
    ],
  },
  {
    id: 'segitiga',
    order: 3,
    name: 'Segitiga',
    realObjectName: 'Atap rumah',
    realObjectShortLabel: 'Atap rumah',
    sidesCount: 3,
    verticesCount: 3,
    keyCharacteristics: [
      'Memiliki 3 sisi lurus yang saling bertemu.',
      'Memiliki 3 titik sudut.',
      'Contoh benda nyata di sekitar kita adalah bagian depan atap rumah.',
    ],
    sideHighlightNote: 'Ketiga garis sisi segitiga menyala bersamaan!',
    vertexHighlightNote: 'Ketiga titik sudut segitiga menyala jelas!',
    screenText: '“Segitiga” dan “Atap rumah”',
    narrationText:
      'Ketiga, Segitiga. Bangun ini punya tiga sisi dan tiga titik sudut. Contohnya atap rumah.',
    mayerPrincipleNote:
      'Signaling & Spatial Contiguity: Teks kunci berada tepat di samping gambar. Garis setiap sisi menyala bersamaan dan setiap titik sudut menyala untuk menegaskan ciri utama segitiga.',
    teacherStudentScenario: [
      'Guru menyimak bersama siswa agar fokus visual dan auditori tetap terjaga.',
      'Siswa diajak menghitung bersama-sama: 1, 2, 3 sisi dan 1, 2, 3 titik sudut.',
    ],
  },
  {
    id: 'trapesium',
    order: 4,
    name: 'Trapesium',
    realObjectName: 'Atap rumah Joglo',
    realObjectShortLabel: 'Atap rumah Joglo',
    sidesCount: 4,
    verticesCount: 4,
    keyCharacteristics: [
      'Hanya memiliki 1 pasang sisi yang sejajar (sisi atas dan sisi bawah).',
      'Pada trapesium sama kaki (seperti pada LKM), kedua sisi miringnya sama panjang.',
      'Memiliki 4 titik sudut. Contoh bendanya adalah bentuk atap rumah Joglo.',
    ],
    sideHighlightNote:
      'Sepasang sisi sejajar (atas & bawah) menyala merah, dan kedua sisi miring menyala hijau!',
    vertexHighlightNote: 'Keempat titik sudut trapesium menyala!',
    screenText: '“Trapesium” dan “Atap rumah Joglo”',
    narrationText:
      'Keempat, Trapesium. Hati-hati ya, trapesium hanya punya satu pasang sisi yang sejajar dan kedua sisi yang miring sama panjang. Contohnya bentuk atap rumah joglo.',
    mayerPrincipleNote:
      'Signaling & Spatial Contiguity: Teks kunci berada tepat di samping gambar. Garis sepasang sisi sejajar menyala, kedua sisi miring sama panjang, dan setiap titik sudut menyala untuk menegaskan ciri utama trapesium.',
    teacherStudentScenario: [
      'Guru menyimak tayangan bersama siswa di kelas.',
      'Guru membantu siswa membedakan sisi yang sejajar (atas-bawah) dengan sisi yang miring (kiri-kanan).',
    ],
    academicValidationNote:
      'CATATAN VALIDASI AKADEMIK UNTUK PENGAJAR: Dalam naskah LKM Slide 8 tertulis bahwa "trapesium hanya punya satu pasang sisi yang sejajar dan kedua sisi yang miring sama panjang". Secara geometri matematika, definisi umum Trapesium adalah segi empat yang memiliki tepat satu pasang sisi sejajar. Sifat "kedua sisi miring sama panjang" secara spesifik berlaku pada jenis Trapesium Sama Kaki (seperti bentuk atap rumah Joglo pada ilustrasi LKM), sedangkan pada Trapesium Siku-siku atau Trapesium Sembarang panjang kedua sisi miringnya tidak sama. Teks asli LKM tetap dipertahankan sesuai aturan ketepatan sumber, disertai catatan ini untuk konfirmasi pengajar.',
  },
  {
    id: 'jajar_genjang',
    order: 5,
    name: 'Jajar Genjang',
    realObjectName: 'Kue wajik',
    realObjectShortLabel: 'Kue wajik',
    sidesCount: 4,
    verticesCount: 4,
    keyCharacteristics: [
      'Memiliki 2 pasang sisi miring/berhadapan yang sejajar dan sama panjang.',
      'Memiliki 4 titik sudut.',
      'Contoh benda nyata di sekitar kita adalah potongan kue wajik.',
    ],
    sideHighlightNote: 'Dua pasang sisi berhadapan yang sejajar menyala!',
    vertexHighlightNote: 'Keempat titik sudut jajar genjang menyala!',
    screenText: '“Jajar genjang” dan “Kue wajik”',
    narrationText:
      'Kelima, Jajar Genjang. Punya dua pasang sisi miring yang sejajar. Contohnya kue wajik.',
    mayerPrincipleNote:
      'Signaling & Spatial Contiguity: Teks kunci berada tepat di samping gambar. Garis sisi miring yang menyala untuk menegaskan ciri utama jajar genjang.',
    teacherStudentScenario: [
      'Guru menyimak bersama siswa.',
      'Guru menanyakan apakah siswa pernah melihat atau mencicipi kue tradisional wajik yang dipotong miring berbentuk jajar genjang.',
    ],
  },
  {
    id: 'belah_ketupat',
    order: 6,
    name: 'Belah Ketupat',
    realObjectName: 'Ketupat Lebaran',
    realObjectShortLabel: 'Ketupat',
    sidesCount: 4,
    verticesCount: 4,
    keyCharacteristics: [
      'Keempat sisinya sama panjang, tetapi posisinya miring (berbentuk seperti berlian/ketupat).',
      'Memiliki 4 titik sudut.',
      'Contoh benda nyata yang populer adalah ketupat Lebaran.',
    ],
    sideHighlightNote: 'Keempat sisi miring yang sama panjang menyala bersamaan!',
    vertexHighlightNote: 'Keempat titik sudut belah ketupat menyala!',
    screenText: '“Belah ketupat” dan “Ketupat”',
    narrationText:
      'Keenam, Belah Ketupat. Keempat sisinya sama panjang, tetapi bentuknya miring. Contoh populernya adalah ketupat Lebaran.',
    mayerPrincipleNote:
      'Signaling & Spatial Contiguity: Teks kunci berada tepat di samping gambar. Empat sisi sama panjang menyala untuk menegaskan ciri utama belah ketupat.',
    teacherStudentScenario: [
      'Guru menyimak bersama siswa.',
      'Guru mengajak siswa membandingkan Persegi dan Belah Ketupat: sama-sama punya 4 sisi sama panjang, tetapi Belah Ketupat posisinya miring seperti ketupat.',
    ],
  },
];

export const MATERI_QUIZ_CHALLENGE = {
  question: 'Mana benda yang berbentuk TRAPESIUM?',
  narrationIntro:
    'Nah, setelah kalian belajar macam-macam bangun datar, ciri-ciri, dan contoh bendanya. Sekarang, coba tebak! Mana benda di bawah ini yang bentuknya Trapesium?',
  narrationSuccess: 'Tepat sekali! Jawabannya adalah B. Atap rumah Joglo.',
  timerSeconds: 10,
  options: [
    {
      id: 'A',
      label: 'A. Ketupat',
      objectType: 'ketupat' as const,
      shapeName: 'Belah Ketupat',
      isCorrect: false,
    },
    {
      id: 'B',
      label: 'B. Atap rumah Joglo',
      objectType: 'atap_joglo' as const,
      shapeName: 'Trapesium',
      isCorrect: true,
    },
    {
      id: 'C',
      label: 'C. Kue wajik',
      objectType: 'kue_wajik' as const,
      shapeName: 'Jajar Genjang',
      isCorrect: false,
    },
  ],
  teacherScenario: [
    'Detik 10–6 (Masa Berpikir): Guru dapat memandu: "Coba amati gambarnya baik-baik... mana yang cuma punya sepasang sisi sejajar?"',
    'Detik 5–1 (Pengumpulan Jawaban): Guru meminta: "Yuk, sebutkan hurufnya bersama-sama!" Siswa menjawab serentak: "B!"',
    'Saat jawaban muncul: Guru memberi apresiasi "Wah kalian hebat! Jawabannya benar!"',
  ],
};

export const MATCHING_GAME_SHAPES: MatchingItem[] = [
  {
    id: 'segitiga',
    name: 'Segitiga',
    correctDescriptionId: 'desc_segitiga',
  },
  {
    id: 'persegi',
    name: 'Persegi',
    correctDescriptionId: 'desc_persegi',
  },
  {
    id: 'persegi_panjang',
    name: 'Persegi Panjang',
    correctDescriptionId: 'desc_persegi_panjang',
  },
];

export const MATCHING_GAME_DESCRIPTIONS: MatchingDescription[] = [
  {
    id: 'desc_persegi',
    text: 'Memiliki empat sudut dan empat sisi sama panjang',
    matchesShapeId: 'persegi',
  },
  {
    id: 'desc_persegi_panjang',
    text: 'Sisi yang berhadapan sama panjang',
    matchesShapeId: 'persegi_panjang',
  },
  {
    id: 'desc_segitiga',
    text: 'Memiliki tiga sisi dan tiga titik sudut',
    matchesShapeId: 'segitiga',
  },
];

/**
 * Canonical Tangram Geometric Scale System:
 * Let unit leg of Small Triangle & Square side = a = d * sqrt(2), where d = 35 SVG units.
 * - Small Right-Isosceles Triangle leg:  L_small  = a          = 35 * sqrt(2) ≈ 49.497475 (Ratio = 1)
 * - Medium Right-Isosceles Triangle leg: L_medium = a * sqrt(2)= 70.000000    (Ratio = sqrt(2))
 * - Large Right-Isosceles Triangle leg:  L_large  = 2 * a      = 70 * sqrt(2) ≈ 98.994949 (Ratio = 2)
 * - Square: 4 equal sides of length a and four 90° right angles.
 * - Parallelogram: opposite parallel sides of lengths a (45° diagonal) and a*sqrt(2) = 70 (vertical), angles 45° & 135°.
 * Every piece's local polygon vertices are centered at its true geometric centroid (0,0).
 */
export const TANGRAM_UNIT_D = 35;
export const TANGRAM_UNIT_A = TANGRAM_UNIT_D * Math.SQRT2;
export const TANGRAM_LEG_SMALL = TANGRAM_UNIT_A;
export const TANGRAM_LEG_MEDIUM = 2 * TANGRAM_UNIT_D;
export const TANGRAM_LEG_LARGE = 2 * TANGRAM_UNIT_A;

function createRightIsoscelesTriangleVertices(leg: number): TangramPoint[] {
  return [
    { x: -leg / 3, y: leg / 3 },
    { x: (2 * leg) / 3, y: leg / 3 },
    { x: -leg / 3, y: (-2 * leg) / 3 },
  ];
}

function createSquareVertices(side: number): TangramPoint[] {
  const half = side / 2;
  return [
    { x: -half, y: -half },
    { x: half, y: -half },
    { x: half, y: half },
    { x: -half, y: half },
  ];
}

function createParallelogramVertices(d: number): TangramPoint[] {
  return [
    { x: -d / 2, y: -1.5 * d },
    { x: d / 2, y: -0.5 * d },
    { x: d / 2, y: 1.5 * d },
    { x: -d / 2, y: 0.5 * d },
  ];
}

function transformVertices(
  localVertices: TangramPoint[],
  cx: number,
  cy: number,
  rotationDeg: number
): TangramPoint[] {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return localVertices.map((pt) => ({
    x: Number((cx + pt.x * cos - pt.y * sin).toFixed(4)),
    y: Number((cy + pt.x * sin + pt.y * cos).toFixed(4)),
  }));
}

function formatPointsString(vertices: TangramPoint[]): string {
  return vertices.map((pt) => `${pt.x.toFixed(3)},${pt.y.toFixed(3)}`).join(' ');
}

const CANONICAL_LOCAL_VERTICES: Record<TangramPieceSpec['kind'], TangramPoint[]> = {
  large_triangle_1: createRightIsoscelesTriangleVertices(TANGRAM_LEG_LARGE),
  large_triangle_2: createRightIsoscelesTriangleVertices(TANGRAM_LEG_LARGE),
  medium_triangle: createRightIsoscelesTriangleVertices(TANGRAM_LEG_MEDIUM),
  small_triangle_1: createRightIsoscelesTriangleVertices(TANGRAM_LEG_SMALL),
  small_triangle_2: createRightIsoscelesTriangleVertices(TANGRAM_LEG_SMALL),
  square: createSquareVertices(TANGRAM_UNIT_A),
  parallelogram: createParallelogramVertices(TANGRAM_UNIT_D),
};

const CANONICAL_TRAY_LAYOUT: Record<
  TangramPieceSpec['kind'],
  { color: string; initialX: number; initialY: number; initialRotation: number; rotationSymmetry: number }
> = {
  large_triangle_1: {
    color: '#EF4444', // Red (Segitiga Besar 1 — LKM Slide 23)
    initialX: 505,
    initialY: 112,
    initialRotation: 135,
    rotationSymmetry: 360,
  },
  large_triangle_2: {
    color: '#7C3AED', // Purple (Segitiga Besar 2 — LKM Slide 23)
    initialX: 700,
    initialY: 112,
    initialRotation: 135,
    rotationSymmetry: 360,
  },
  medium_triangle: {
    color: '#10B981', // Green (Segitiga Sedang — LKM Slide 23)
    initialX: 492,
    initialY: 225,
    initialRotation: 135,
    rotationSymmetry: 360,
  },
  square: {
    color: '#06B6D4', // Cyan (Persegi — LKM Slide 23)
    initialX: 615,
    initialY: 220,
    initialRotation: 0,
    rotationSymmetry: 90,
  },
  parallelogram: {
    color: '#F97316', // Orange (Jajar Genjang — LKM Slide 23)
    initialX: 730,
    initialY: 220,
    initialRotation: 90,
    rotationSymmetry: 180,
  },
  small_triangle_1: {
    color: '#2563EB', // Blue (Segitiga Kecil 1 — LKM Slide 23)
    initialX: 535,
    initialY: 332,
    initialRotation: 45,
    rotationSymmetry: 360,
  },
  small_triangle_2: {
    color: '#FACC15', // Yellow (Segitiga Kecil 2 — LKM Slide 23)
    initialX: 685,
    initialY: 332,
    initialRotation: 315,
    rotationSymmetry: 360,
  },
};

function buildTangramPiece(params: {
  id: string;
  name: string;
  kind: TangramPieceSpec['kind'];
  targetX: number;
  targetY: number;
  targetRotation: number;
}): TangramPieceSpec {
  const localVertices = CANONICAL_LOCAL_VERTICES[params.kind];
  const tray = CANONICAL_TRAY_LAYOUT[params.kind];
  const targetX = Number(params.targetX.toFixed(4));
  const targetY = Number(params.targetY.toFixed(4));
  const targetVertices = transformVertices(localVertices, targetX, targetY, params.targetRotation);

  return {
    id: params.id,
    name: params.name,
    kind: params.kind,
    color: tray.color,
    points: formatPointsString(localVertices),
    vertices: localVertices,
    targetVertices,
    targetX,
    targetY,
    targetRotation: params.targetRotation,
    initialX: tray.initialX,
    initialY: tray.initialY,
    initialRotation: tray.initialRotation,
    rotationSymmetry: tray.rotationSymmetry,
  };
}

// Anchor coordinates for LKM Slide 23 Swan (Bayangan Angsa):
const SWAN_XS = 148;
const SWAN_YS = 165;
const SWAN_XM = SWAN_XS - TANGRAM_UNIT_D + TANGRAM_UNIT_A;
const SWAN_YM = SWAN_YS + 3 * TANGRAM_UNIT_D - TANGRAM_UNIT_A;

// Anchor coordinates for Bonus 1 Sitting Cat (Bayangan Kucing):
const CAT_XS = 135;
const CAT_YS = 115;
const CAT_XM = CAT_XS - TANGRAM_UNIT_D + TANGRAM_UNIT_A;
const CAT_YM = CAT_YS + 3 * TANGRAM_UNIT_D - TANGRAM_UNIT_A;

export const TANGRAM_PUZZLES: TangramPuzzleSpec[] = [
  {
    id: 'angsa',
    title: 'Bayangan Angsa (Utama — LKM)',
    subtitle: 'Tantangan Utama Komposisi 7 Bangun Datar',
    isPrimaryLkm: true,
    instruction: 'Ambil bangun datar lalu letakkan pada bayangan gambar angsa!',
    pieces: [
      buildTangramPiece({
        id: 'large_tri_1',
        name: 'Segitiga Besar 1 (Badan Bawah)',
        kind: 'large_triangle_1',
        targetX: SWAN_XM + (2 * TANGRAM_UNIT_A) / 3,
        targetY: SWAN_YM + (4 * TANGRAM_UNIT_A) / 3,
        targetRotation: 0,
      }),
      buildTangramPiece({
        id: 'large_tri_2',
        name: 'Segitiga Besar 2 (Sayap & Ekor Atas)',
        kind: 'large_triangle_2',
        targetX: SWAN_XM + 2 * TANGRAM_UNIT_D,
        targetY: SWAN_YM + (2 * TANGRAM_UNIT_D) / 3,
        targetRotation: 315,
      }),
      buildTangramPiece({
        id: 'medium_tri',
        name: 'Segitiga Sedang (Perut Angsa)',
        kind: 'medium_triangle',
        targetX: SWAN_XM - TANGRAM_UNIT_A / 3,
        targetY: SWAN_YM + TANGRAM_UNIT_A,
        targetRotation: 45,
      }),
      buildTangramPiece({
        id: 'square',
        name: 'Persegi (Leher Bawah)',
        kind: 'square',
        targetX: SWAN_XS,
        targetY: SWAN_YS + TANGRAM_UNIT_D,
        targetRotation: 45,
      }),
      buildTangramPiece({
        id: 'parallelogram',
        name: 'Jajar Genjang (Leher Atas)',
        kind: 'parallelogram',
        targetX: SWAN_XS + TANGRAM_UNIT_D / 2,
        targetY: SWAN_YS - TANGRAM_UNIT_D / 2,
        targetRotation: 0,
      }),
      buildTangramPiece({
        id: 'small_tri_1',
        name: 'Segitiga Kecil 1 (Kepala & Paruh)',
        kind: 'small_triangle_1',
        targetX: SWAN_XS - TANGRAM_UNIT_A / 3,
        targetY: SWAN_YS - 2 * TANGRAM_UNIT_D + (2 * TANGRAM_UNIT_A) / 3,
        targetRotation: 270,
      }),
      buildTangramPiece({
        id: 'small_tri_2',
        name: 'Segitiga Kecil 2 (Dada Depan)',
        kind: 'small_triangle_2',
        targetX: SWAN_XS - (2 * TANGRAM_UNIT_D) / 3,
        targetY: SWAN_YS + 2 * TANGRAM_UNIT_D,
        targetRotation: 225,
      }),
    ],
  },
  {
    id: 'kucing',
    title: 'Bayangan Kucing (Bonus 1)',
    subtitle: 'Tantangan Pengayaan Komposisi Bangun Datar',
    isPrimaryLkm: false,
    instruction: 'Susun ketujuh bangun datar menjadi siluet kucing yang sedang duduk!',
    pieces: [
      buildTangramPiece({
        id: 'large_tri_1',
        name: 'Segitiga Besar 1 (Badan Bawah)',
        kind: 'large_triangle_1',
        targetX: CAT_XM + (2 * TANGRAM_UNIT_A) / 3,
        targetY: CAT_YM + (4 * TANGRAM_UNIT_A) / 3,
        targetRotation: 0,
      }),
      buildTangramPiece({
        id: 'large_tri_2',
        name: 'Segitiga Besar 2 (Punggung Kucing)',
        kind: 'large_triangle_2',
        targetX: CAT_XM + (4 * TANGRAM_UNIT_A) / 3,
        targetY: CAT_YM + (2 * TANGRAM_UNIT_A) / 3,
        targetRotation: 180,
      }),
      buildTangramPiece({
        id: 'medium_tri',
        name: 'Segitiga Sedang (Dada Kucing)',
        kind: 'medium_triangle',
        targetX: CAT_XM - TANGRAM_UNIT_A / 3,
        targetY: CAT_YM + TANGRAM_UNIT_A,
        targetRotation: 45,
      }),
      buildTangramPiece({
        id: 'square',
        name: 'Persegi (Wajah Kucing)',
        kind: 'square',
        targetX: CAT_XS,
        targetY: CAT_YS + TANGRAM_UNIT_D,
        targetRotation: 45,
      }),
      buildTangramPiece({
        id: 'small_tri_1',
        name: 'Segitiga Kecil 1 (Telinga Kiri)',
        kind: 'small_triangle_1',
        targetX: CAT_XS - (2 * TANGRAM_UNIT_D) / 3,
        targetY: CAT_YS,
        targetRotation: 225,
      }),
      buildTangramPiece({
        id: 'small_tri_2',
        name: 'Segitiga Kecil 2 (Telinga Kanan)',
        kind: 'small_triangle_2',
        targetX: CAT_XS + (2 * TANGRAM_UNIT_D) / 3,
        targetY: CAT_YS,
        targetRotation: 45,
      }),
      buildTangramPiece({
        id: 'parallelogram',
        name: 'Jajar Genjang (Ekor Kucing)',
        kind: 'parallelogram',
        targetX: CAT_XM + 2 * TANGRAM_UNIT_A + TANGRAM_UNIT_D / 2,
        targetY: CAT_YM + 2 * TANGRAM_UNIT_A - 1.5 * TANGRAM_UNIT_D,
        targetRotation: 0,
      }),
    ],
  },
  {
    id: 'ikan',
    title: 'Bayangan Ikan (Bonus 2)',
    subtitle: 'Tantangan Pengayaan Komposisi Bangun Datar',
    isPrimaryLkm: false,
    instruction: 'Susun ketujuh bangun datar menjadi siluet ikan berenang!',
    pieces: [
      buildTangramPiece({
        id: 'large_tri_1',
        name: 'Segitiga Besar 1 (Badan Atas)',
        kind: 'large_triangle_1',
        targetX: 145,
        targetY: 186.6667,
        targetRotation: 135,
      }),
      buildTangramPiece({
        id: 'large_tri_2',
        name: 'Segitiga Besar 2 (Badan Bawah)',
        kind: 'large_triangle_2',
        targetX: 145,
        targetY: 233.3333,
        targetRotation: 315,
      }),
      buildTangramPiece({
        id: 'medium_tri',
        name: 'Segitiga Sedang (Sirip Punggung)',
        kind: 'medium_triangle',
        targetX: 191.6667,
        targetY: 163.3333,
        targetRotation: 180,
      }),
      buildTangramPiece({
        id: 'parallelogram',
        name: 'Jajar Genjang (Sirip Perut)',
        kind: 'parallelogram',
        targetX: 197.5,
        targetY: 262.5,
        targetRotation: 90,
      }),
      buildTangramPiece({
        id: 'square',
        name: 'Persegi (Pangkal Ekor)',
        kind: 'square',
        targetX: 250,
        targetY: 210,
        targetRotation: 45,
      }),
      buildTangramPiece({
        id: 'small_tri_1',
        name: 'Segitiga Kecil 1 (Sirip Ekor Atas)',
        kind: 'small_triangle_1',
        targetX: 285,
        targetY: 186.6667,
        targetRotation: 315,
      }),
      buildTangramPiece({
        id: 'small_tri_2',
        name: 'Segitiga Kecil 2 (Sirip Ekor Bawah)',
        kind: 'small_triangle_2',
        targetX: 285,
        targetY: 233.3333,
        targetRotation: 135,
      }),
    ],
  },
];

export const LKM_TEAM_INFO = {
  courseName: 'Desain Pesan dan Komunikasi Pembelajaran',
  assignmentTitle:
    'Rekayasa Ulang (Redesain) Multimedia Pembelajaran Berbasis Prinsip Mayer dan Komunikasi Dua Arah',
  moduleTitle: 'Komposisi Bangun Datar',
  subjectGrade: 'Matematika / Fase B / Kelas 4 SD',
  members: [
    { name: 'Ammara Dila Fahmida', nim: '2501022652' },
    { name: 'Hanifah Alfiya Rahma', nim: '2501022658' },
    { name: 'Bramantio Binangkit', nim: '2501022665' },
    { name: 'Sabrina Agustin Salsadira', nim: '2501022670' },
    { name: 'M. Luqni Maulana Rahman', nim: '2501022678' },
  ],
  mayerPrinciplesSummary: [
    {
      name: '1. Prinsip Multimedia (Multimedia Principle)',
      description:
        'Siswa belajar lebih baik dari kombinasi kata-kata dan gambar visual bangun datar beserta contoh bendanya daripada kata-kata saja.',
    },
    {
      name: '2. Prinsip Koherensi (Coherence Principle)',
      description:
        'Menghilangkan musik latar dekoratif atau elemen visual yang tidak berkaitan dengan materi agar tidak menimbulkan extraneous cognitive load.',
    },
    {
      name: '3. Prinsip Kedekatan Spasial (Spatial Contiguity Principle)',
      description:
        'Menempatkan label nama bangun datar, ciri sisi/sudut, dan contoh benda nyata tepat berdampingan dengan objek visualnya (mencegah split-attention effect).',
    },
    {
      name: '4. Prinsip Redundansi (Redundancy Principle)',
      description:
        'Teks di layar disajikan ringkas dan fokus pada kata kunci sehingga tidak membebani saluran visual dan auditori secara berlebihan.',
    },
    {
      name: '5. Prinsip Segmentasi (Segmenting Principle)',
      description:
        'Materi dibagi menjadi segmen bertahap per bangun datar yang kecepatannya dapat dikontrol langsung oleh siswa dan guru.',
    },
    {
      name: '6. Prinsip Penandaan (Signaling Principle)',
      description:
        'Menggunakan sorotan warna (highlight) pada garis sisi dan titik sudut serta ikon fungsional yang jelas untuk mengarahkan fokus siswa.',
    },
  ],
};
