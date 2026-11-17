import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMemoryDeck,
  isMemoryPairMatch,
  calculateMemoryStars,
  evaluateMatchingConnections,
  isRotationMatch,
  findMatchingTangramTarget,
  getTransformedPolygonVertices,
  getPolygonSideLengths,
  doPolygonsOverlapInterior,
  calculateTotalStars,
  sanitizeReflectionText,
  validateReflectionInput,
  generateReflectionId,
} from './gameLogic';
import { TANGRAM_PUZZLES, TANGRAM_UNIT_A } from '../data/learningContent';

test('Memory Game deck contains exactly 12 cards (6 images and 6 names)', () => {
  const deck = createMemoryDeck(true);
  assert.equal(deck.length, 12);
  const imageCards = deck.filter((c) => c.cardType === 'image');
  const nameCards = deck.filter((c) => c.cardType === 'name');
  assert.equal(imageCards.length, 6);
  assert.equal(nameCards.length, 6);
});

test('Memory Game pair matching checks complementary cardType with same shapeId', () => {
  const deck = createMemoryDeck(true);
  const persegiImg = deck.find((c) => c.shapeId === 'persegi' && c.cardType === 'image')!;
  const persegiName = deck.find((c) => c.shapeId === 'persegi' && c.cardType === 'name')!;
  const segitigaName = deck.find((c) => c.shapeId === 'segitiga' && c.cardType === 'name')!;

  assert.equal(isMemoryPairMatch(persegiImg, persegiName), true);
  assert.equal(isMemoryPairMatch(persegiImg, persegiImg), false);
  assert.equal(isMemoryPairMatch(persegiImg, segitigaName), false);
});

test('Memory Game star calculation awards 0..3 stars accurately', () => {
  assert.equal(calculateMemoryStars(6, 5), 0);
  assert.equal(calculateMemoryStars(10, 6), 3);
  assert.equal(calculateMemoryStars(20, 6), 2);
  assert.equal(calculateMemoryStars(25, 6), 1);
});

test('Matching Game evaluates 3 shape-description pairs accurately', () => {
  const perfect = evaluateMatchingConnections({
    persegi: 'desc_persegi',
    persegi_panjang: 'desc_persegi_panjang',
    segitiga: 'desc_segitiga',
  });
  assert.equal(perfect.allCorrect, true);
  assert.equal(perfect.correctCount, 3);
  assert.equal(perfect.stars, 3);

  const partial = evaluateMatchingConnections({
    persegi: 'desc_persegi',
    persegi_panjang: 'desc_segitiga',
    segitiga: 'desc_persegi_panjang',
  });
  assert.equal(partial.allCorrect, false);
  assert.equal(partial.correctCount, 1);
  assert.equal(partial.stars, 1);
});

test('Tangram 7 pieces satisfy exact 2 : sqrt(2) : 1 triangle leg ratios, square, and parallelogram invariants', () => {
  const angsa = TANGRAM_PUZZLES.find((p) => p.id === 'angsa')!;
  assert.ok(angsa);
  assert.equal(angsa.pieces.length, 7);

  const large1 = angsa.pieces.find((p) => p.kind === 'large_triangle_1')!;
  const large2 = angsa.pieces.find((p) => p.kind === 'large_triangle_2')!;
  const medium = angsa.pieces.find((p) => p.kind === 'medium_triangle')!;
  const small1 = angsa.pieces.find((p) => p.kind === 'small_triangle_1')!;
  const small2 = angsa.pieces.find((p) => p.kind === 'small_triangle_2')!;
  const square = angsa.pieces.find((p) => p.kind === 'square')!;
  const parallelogram = angsa.pieces.find((p) => p.kind === 'parallelogram')!;

  const smallSides = getPolygonSideLengths(small1.vertices).sort((a, b) => a - b);
  const mediumSides = getPolygonSideLengths(medium.vertices).sort((a, b) => a - b);
  const largeSides = getPolygonSideLengths(large1.vertices).sort((a, b) => a - b);

  // Right-isosceles legs equal and hypotenuse = leg * sqrt(2)
  assert.ok(Math.abs(smallSides[0] - smallSides[1]) < 1e-4);
  assert.ok(Math.abs(smallSides[2] - smallSides[0] * Math.SQRT2) < 1e-4);
  assert.ok(Math.abs(mediumSides[0] - mediumSides[1]) < 1e-4);
  assert.ok(Math.abs(largeSides[0] - largeSides[1]) < 1e-4);

  // Ratio Large : Medium : Small = 2 : sqrt(2) : 1
  const ratioMedSmall = mediumSides[0] / smallSides[0];
  const ratioLargeSmall = largeSides[0] / smallSides[0];
  assert.ok(Math.abs(ratioMedSmall - Math.SQRT2) < 1e-4);
  assert.ok(Math.abs(ratioLargeSmall - 2) < 1e-4);

  // Congruent sibling triangles
  const large2Sides = getPolygonSideLengths(large2.vertices).sort((a, b) => a - b);
  const small2Sides = getPolygonSideLengths(small2.vertices).sort((a, b) => a - b);
  assert.ok(Math.abs(large2Sides[0] - largeSides[0]) < 1e-4);
  assert.ok(Math.abs(small2Sides[0] - smallSides[0]) < 1e-4);

  // Square: 4 equal sides of length a = TANGRAM_UNIT_A
  const sqSides = getPolygonSideLengths(square.vertices);
  assert.equal(sqSides.length, 4);
  for (const s of sqSides) {
    assert.ok(Math.abs(s - TANGRAM_UNIT_A) < 1e-4);
  }

  // Parallelogram: opposite sides equal (a and a*sqrt(2))
  const paraSides = getPolygonSideLengths(parallelogram.vertices);
  assert.equal(paraSides.length, 4);
  assert.ok(Math.abs(paraSides[0] - paraSides[2]) < 1e-4);
  assert.ok(Math.abs(paraSides[1] - paraSides[3]) < 1e-4);
  assert.ok(Math.abs(paraSides[0] - TANGRAM_UNIT_A) < 1e-4);
  assert.ok(Math.abs(paraSides[1] - TANGRAM_UNIT_A * Math.SQRT2) < 1e-4);
});

test('All 3 Tangram puzzles (Angsa, Kucing, Ikan) and initial 7-piece tray have zero interior polygon overlap', () => {
  for (const puzzle of TANGRAM_PUZZLES) {
    assert.equal(puzzle.pieces.length, 7, `Puzzle ${puzzle.id} must have 7 pieces`);
    // Check solved target polygons have 0 interior overlap
    for (let i = 0; i < puzzle.pieces.length; i++) {
      for (let j = i + 1; j < puzzle.pieces.length; j++) {
        const pA = puzzle.pieces[i];
        const pB = puzzle.pieces[j];
        const overlap = doPolygonsOverlapInterior(pA.targetVertices, pB.targetVertices, 1e-2);
        assert.equal(
          overlap,
          false,
          `Puzzle ${puzzle.id} has unexpected overlap between ${pA.id} and ${pB.id}`
        );
      }
    }

    // Check initial tray polygons have 0 overlap
    const trayPolys = puzzle.pieces.map((p) =>
      getTransformedPolygonVertices(p.vertices, p.initialX, p.initialY, p.initialRotation)
    );
    for (let i = 0; i < trayPolys.length; i++) {
      for (let j = i + 1; j < trayPolys.length; j++) {
        const overlap = doPolygonsOverlapInterior(trayPolys[i], trayPolys[j], 1e-2);
        assert.equal(
          overlap,
          false,
          `Initial tray in ${puzzle.id} has overlap between ${puzzle.pieces[i].id} and ${puzzle.pieces[j].id}`
        );
      }
    }
  }
});

test('Tangram rotation, polygon vertex congruence, and target snapping validates position and symmetry', () => {
  assert.equal(isRotationMatch(45, 45, 360), true);
  assert.equal(isRotationMatch(135, 45, 90), true); // Square 90deg symmetry
  assert.equal(isRotationMatch(225, 45, 180), true); // Parallelogram 180deg symmetry
  assert.equal(isRotationMatch(90, 0, 360), false);

  const angsaPieces = TANGRAM_PUZZLES.find((p) => p.id === 'angsa')!.pieces;
  const squareSpec = angsaPieces.find((p) => p.kind === 'square')!;
  const medTriSpec = angsaPieces.find((p) => p.kind === 'medium_triangle')!;

  // Valid snap for square rotated by +90 deg symmetry (45 -> 135) within snap tolerance
  const matched = findMatchingTangramTarget(
    {
      id: squareSpec.id,
      x: squareSpec.targetX + 5,
      y: squareSpec.targetY - 4,
      rotation: 135,
      isLocked: false,
    },
    squareSpec,
    angsaPieces,
    new Set()
  );
  assert.notEqual(matched, null);
  assert.equal(matched?.id, squareSpec.id);

  // Reject wrong rotation
  const wrongRot = findMatchingTangramTarget(
    {
      id: medTriSpec.id,
      x: medTriSpec.targetX,
      y: medTriSpec.targetY,
      rotation: (medTriSpec.targetRotation + 90) % 360,
      isLocked: false,
    },
    medTriSpec,
    angsaPieces,
    new Set()
  );
  assert.equal(wrongRot, null);

  // Reject distant placement
  const unmatched = findMatchingTangramTarget(
    { id: squareSpec.id, x: 400, y: 200, rotation: 45, isLocked: false },
    squareSpec,
    angsaPieces,
    new Set()
  );
  assert.equal(unmatched, null);

  // Reject if target slot is already occupied
  const occupiedMatch = findMatchingTangramTarget(
    { id: squareSpec.id, x: squareSpec.targetX, y: squareSpec.targetY, rotation: 45, isLocked: false },
    squareSpec,
    angsaPieces,
    new Set([squareSpec.id])
  );
  assert.equal(occupiedMatch, null);
});

test('Total stars calculation enforces 9/9 star cap', () => {
  const res = calculateTotalStars({ memory: 3, matching: 3, tangram: 3 });
  assert.equal(res.total, 9);
  assert.equal(res.max, 9);
  assert.equal(res.percentage, 100);
});

test('Reflection validation rejects empty or whitespace-only name, class, and missing feeling', () => {
  const invalid = validateReflectionInput({
    studentName: '   ',
    studentClass: '  ',
    feeling: null,
    message: 'Halo',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.studentName);
  assert.ok(invalid.errors.studentClass);
  assert.ok(invalid.errors.feeling);

  const valid = validateReflectionInput({
    studentName: '  Budi   Santoso  ',
    studentClass: ' IV-A ',
    feeling: 'seru',
    message: '  Aku suka menyusun tangram angsa! ',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitizedName, 'Budi Santoso');
  assert.equal(valid.sanitizedClass, 'IV-A');
  assert.equal(valid.sanitizedMessage, 'Aku suka menyusun tangram angsa!');
});

test('generateReflectionId produces deterministic Firestore-safe idempotent IDs within 10s bucket', () => {
  const id1 = generateReflectionId('Budi Santoso', 'IV-A', 'seru', 1763280001000);
  const id2 = generateReflectionId('Budi Santoso', 'IV-A', 'seru', 1763280005000);
  assert.equal(id1, id2);
  assert.match(id1, /^[a-zA-Z0-9_\-]+$/);
  assert.ok(id1.length >= 4 && id1.length <= 128);
});
