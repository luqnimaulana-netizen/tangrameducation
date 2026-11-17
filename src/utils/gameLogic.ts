import {
  MemoryCardItem,
  ShapeId,
  TangramPieceSpec,
  TangramPieceState,
  TangramPoint,
} from '../types/app';

export const SIX_SHAPES_LIST: { id: ShapeId; label: string }[] = [
  { id: 'persegi', label: 'Persegi' },
  { id: 'persegi_panjang', label: 'Persegi Panjang' },
  { id: 'segitiga', label: 'Segitiga' },
  { id: 'trapesium', label: 'Trapesium' },
  { id: 'jajar_genjang', label: 'Jajar Genjang' },
  { id: 'belah_ketupat', label: 'Belah Ketupat' },
];

/**
 * Generates the 12 memory cards (6 shape visual cards + 6 shape name cards).
 * Accepts an optional deterministic shuffle seed or uses Fisher-Yates.
 */
export function createMemoryDeck(deterministicOrder = false): MemoryCardItem[] {
  const deck: MemoryCardItem[] = [];
  for (const shape of SIX_SHAPES_LIST) {
    deck.push({
      uid: `${shape.id}-image`,
      shapeId: shape.id,
      cardType: 'image',
      label: shape.label,
      isFlipped: false,
      isMatched: false,
    });
    deck.push({
      uid: `${shape.id}-name`,
      shapeId: shape.id,
      cardType: 'name',
      label: shape.label,
      isFlipped: false,
      isMatched: false,
    });
  }

  if (deterministicOrder) {
    return deck;
  }

  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Checks whether two selected Memory Cards form a valid pair:
 * Same shapeId and complementary cardType ('image' vs 'name').
 */
export function isMemoryPairMatch(cardA: MemoryCardItem, cardB: MemoryCardItem): boolean {
  if (cardA.uid === cardB.uid) return false;
  return cardA.shapeId === cardB.shapeId && cardA.cardType !== cardB.cardType;
}

/**
 * Calculates star reward (1 to 3 stars) for completing the 6-pair Memory Game.
 * Following LKM 9/9 star target, completing the game awards 3 stars on normal completion
 * (<= 16 moves = 3 stars, <= 22 moves = 2 stars, > 22 moves = 1 star).
 */
export function calculateMemoryStars(moves: number, matchedPairs: number): number {
  if (matchedPairs < 6) return 0;
  if (moves <= 16) return 3;
  if (moves <= 22) return 2;
  return 1;
}

/**
 * Validates the Matching Game (Menjodohkan Bangun Datar) connections.
 * Expected matches from LKM Slide 20:
 * - persegi -> 'desc_persegi' ("Memiliki empat sudut dan empat sisi sama panjang")
 * - persegi_panjang -> 'desc_persegi_panjang' ("Sisi yang berhadapan sama panjang")
 * - segitiga -> 'desc_segitiga' ("Memiliki tiga sisi dan tiga titik sudut")
 */
export const EXPECTED_MATCHING_PAIRS: Record<'segitiga' | 'persegi' | 'persegi_panjang', string> = {
  persegi: 'desc_persegi',
  persegi_panjang: 'desc_persegi_panjang',
  segitiga: 'desc_segitiga',
};

export function evaluateMatchingConnections(
  connections: Partial<Record<'segitiga' | 'persegi' | 'persegi_panjang', string>>
): {
  correctCount: number;
  totalRequired: number;
  allCorrect: boolean;
  stars: number;
  resultsByShape: Record<'segitiga' | 'persegi' | 'persegi_panjang', boolean>;
} {
  const shapes: ('segitiga' | 'persegi' | 'persegi_panjang')[] = [
    'segitiga',
    'persegi',
    'persegi_panjang',
  ];
  const resultsByShape: Record<'segitiga' | 'persegi' | 'persegi_panjang', boolean> = {
    segitiga: false,
    persegi: false,
    persegi_panjang: false,
  };

  let correctCount = 0;
  for (const shape of shapes) {
    const chosen = connections[shape];
    const isCorrect = chosen === EXPECTED_MATCHING_PAIRS[shape];
    resultsByShape[shape] = isCorrect;
    if (isCorrect) {
      correctCount++;
    }
  }

  const allCorrect = correctCount === 3;
  const stars = allCorrect ? 3 : correctCount;

  return {
    correctCount,
    totalRequired: 3,
    allCorrect,
    stars,
    resultsByShape,
  };
}

/**
 * Normalizes an angle in degrees into [0, 360).
 */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Checks if two angles match within tolerance under a given rotational symmetry (e.g., 90, 180, 360).
 */
export function isRotationMatch(
  currentDeg: number,
  targetDeg: number,
  symmetryDeg = 360,
  toleranceDeg = 15
): boolean {
  const diff = Math.abs(normalizeAngle(currentDeg - targetDeg)) % symmetryDeg;
  const shortestDiff = Math.min(diff, symmetryDeg - diff);
  return shortestDiff <= toleranceDeg;
}

/**
 * Transforms local centroid-centered polygon vertices into world SVG coordinates.
 */
export function getTransformedPolygonVertices(
  localVertices: TangramPoint[],
  x: number,
  y: number,
  rotationDeg: number
): TangramPoint[] {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return localVertices.map((pt) => ({
    x: x + pt.x * cos - pt.y * sin,
    y: y + pt.x * sin + pt.y * cos,
  }));
}

/**
 * Computes the Euclidean side lengths of a polygon in vertex order.
 */
export function getPolygonSideLengths(vertices: TangramPoint[]): number[] {
  return vertices.map((pt, idx) => {
    const next = vertices[(idx + 1) % vertices.length];
    return Math.hypot(next.x - pt.x, next.y - pt.y);
  });
}

/**
 * Checks whether every vertex of placedVertices matches a distinct vertex of targetVertices
 * within maxVertexDistPx (accounting for cyclic symmetry permutations of Square 90° and Parallelogram 180°).
 */
export function arePolygonsCongruentMatch(
  placedVertices: TangramPoint[],
  targetVertices: TangramPoint[],
  maxVertexDistPx = 32
): boolean {
  if (placedVertices.length !== targetVertices.length || placedVertices.length < 3) {
    return false;
  }
  const n = placedVertices.length;
  // Test all cyclic shifts of vertex ordering (preserves orientation/chirality)
  for (let shift = 0; shift < n; shift++) {
    let allWithinTolerance = true;
    for (let i = 0; i < n; i++) {
      const p = placedVertices[i];
      const t = targetVertices[(i + shift) % n];
      if (Math.hypot(p.x - t.x, p.y - t.y) > maxVertexDistPx) {
        allWithinTolerance = false;
        break;
      }
    }
    if (allWithinTolerance) {
      return true;
    }
  }
  return false;
}

/**
 * Separating Axis Theorem (SAT) check for interior overlap between two convex polygons.
 * Shared edges or vertices (touching with <= epsilon penetration) are NOT counted as overlap.
 */
export function doPolygonsOverlapInterior(
  polyA: TangramPoint[],
  polyB: TangramPoint[],
  epsilon = 1e-2
): boolean {
  const polygons = [polyA, polyB];
  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i];
      const p2 = poly[(i + 1) % poly.length];
      const nx = -(p2.y - p1.y);
      const ny = p2.x - p1.x;
      const len = Math.hypot(nx, ny);
      if (len < 1e-9) continue;
      const ax = nx / len;
      const ay = ny / len;

      let minA = Infinity;
      let maxA = -Infinity;
      for (const pt of polyA) {
        const proj = pt.x * ax + pt.y * ay;
        if (proj < minA) minA = proj;
        if (proj > maxA) maxA = proj;
      }

      let minB = Infinity;
      let maxB = -Infinity;
      for (const pt of polyB) {
        const proj = pt.x * ax + pt.y * ay;
        if (proj < minB) minB = proj;
        if (proj > maxB) maxB = proj;
      }

      if (maxA <= minB + epsilon || maxB <= minA + epsilon) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks whether a Tangram piece is close enough in centroid position, rotation angle,
 * and actual transformed polygon vertices to snap & lock into a valid target slot.
 * Supports interchangeable congruent triangles (the 2 large triangles or the 2 small triangles)
 * and selects the closest valid target slot.
 */
export function findMatchingTangramTarget(
  pieceState: TangramPieceState,
  pieceSpec: TangramPieceSpec,
  allSpecs: TangramPieceSpec[],
  occupiedTargetIds: Set<string>,
  snapDistancePx = 28
): TangramPieceSpec | null {
  const candidates = allSpecs.filter((spec) => {
    if (occupiedTargetIds.has(spec.id)) return false;
    if (spec.id === pieceSpec.id) return true;
    const isBothLarge =
      (pieceSpec.kind === 'large_triangle_1' || pieceSpec.kind === 'large_triangle_2') &&
      (spec.kind === 'large_triangle_1' || spec.kind === 'large_triangle_2');
    const isBothSmall =
      (pieceSpec.kind === 'small_triangle_1' || pieceSpec.kind === 'small_triangle_2') &&
      (spec.kind === 'small_triangle_1' || spec.kind === 'small_triangle_2');
    return isBothLarge || isBothSmall;
  });

  let bestTarget: TangramPieceSpec | null = null;
  let bestDistance = Infinity;

  for (const target of candidates) {
    const dx = pieceState.x - target.targetX;
    const dy = pieceState.y - target.targetY;
    const distance = Math.hypot(dx, dy);

    if (
      distance <= snapDistancePx &&
      isRotationMatch(pieceState.rotation, target.targetRotation, target.rotationSymmetry)
    ) {
      if (
        pieceSpec.vertices &&
        pieceSpec.vertices.length >= 3 &&
        target.targetVertices &&
        target.targetVertices.length >= 3
      ) {
        const placedVertices = getTransformedPolygonVertices(
          pieceSpec.vertices,
          pieceState.x,
          pieceState.y,
          pieceState.rotation
        );
        if (!arePolygonsCongruentMatch(placedVertices, target.targetVertices, snapDistancePx + 6)) {
          continue;
        }
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestTarget = target;
      }
    }
  }

  return bestTarget;
}

/**
 * Calculates total stars across all 3 games (max 9 stars as specified in LKM Slide 26).
 */
export function calculateTotalStars(stars: {
  memory: number;
  matching: number;
  tangram: number;
}): { total: number; max: number; percentage: number } {
  const mem = Math.max(0, Math.min(3, stars.memory));
  const mat = Math.max(0, Math.min(3, stars.matching));
  const tan = Math.max(0, Math.min(3, stars.tangram));
  const total = mem + mat + tan;
  const max = 9;
  const percentage = Math.round((total / max) * 100);
  return { total, max, percentage };
}

/**
 * Sanitizes text input by trimming leading/trailing whitespace, collapsing repeated spaces,
 * and removing dangerous control characters while preserving normal Indonesian punctuation.
 */
export function sanitizeReflectionText(raw: string, maxLength: number): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export interface ReflectionInputValidationResult {
  valid: boolean;
  sanitizedName: string;
  sanitizedClass: string;
  sanitizedMessage: string;
  errors: {
    studentName?: string;
    studentClass?: string;
    feeling?: string;
    message?: string;
  };
}

/**
 * Validates and sanitizes Student Reflection form inputs according to Feature 3 & Feature 6 rules.
 */
export function validateReflectionInput(input: {
  studentName: string;
  studentClass: string;
  feeling: 'seru' | 'bosan' | null;
  message: string;
}): ReflectionInputValidationResult {
  const sanitizedName = sanitizeReflectionText(input.studentName, 100);
  const sanitizedClass = sanitizeReflectionText(input.studentClass, 32);
  const sanitizedMessage = sanitizeReflectionText(input.message, 1000);

  const errors: ReflectionInputValidationResult['errors'] = {};

  if (!sanitizedName || sanitizedName.length < 2) {
    errors.studentName = 'Nama lengkap siswa wajib diisi (minimal 2 karakter).';
  }
  if (!sanitizedClass || sanitizedClass.length < 1) {
    errors.studentClass = 'Kelas wajib diisi atau dipilih (contoh: IV-A, IV-B).';
  }
  if (input.feeling !== 'seru' && input.feeling !== 'bosan') {
    errors.feeling = 'Pilih salah satu ekspresi perasaanmu terlebih dahulu (Seru Banget! atau Bosan!).';
  }
  if (input.message && input.message.length > 1000) {
    errors.message = 'Pesan refleksi maksimal 1000 karakter.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    sanitizedName,
    sanitizedClass,
    sanitizedMessage,
    errors,
  };
}

/**
 * Generates an idempotent, Firestore-safe document ID (`^[a-zA-Z0-9_\-]+$`, length 4..128)
 * so rapid double clicks within the same 10-second window produce the same ID and prevent duplicate entries.
 */
export function generateReflectionId(
  studentName: string,
  studentClass: string,
  feeling: 'seru' | 'bosan',
  timestampMs: number
): string {
  const slugName = studentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28) || 'siswa';
  const slugClass = studentClass
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 12) || 'iv';
  const bucket10s = Math.floor(timestampMs / 10000);
  return `ref_${slugClass}_${slugName}_${feeling}_${bucket10s}`;
}

