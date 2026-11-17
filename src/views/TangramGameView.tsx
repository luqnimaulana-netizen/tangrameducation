import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  HelpCircle,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react';
import { TANGRAM_PUZZLES } from '../data/learningContent';
import { TangramPieceState } from '../types/app';
import { findMatchingTangramTarget, isRotationMatch, normalizeAngle } from '../utils/gameLogic';
import { FeedbackModal } from '../components/FeedbackModal';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface TangramGameViewProps {
  audioEnabled: boolean;
  completedPuzzles: ('angsa' | 'kucing' | 'ikan')[];
  onCompletePuzzle: (puzzleId: 'angsa' | 'kucing' | 'ikan', stars: number) => void;
  onNavigateRecap: () => void;
  onNavigateHome: () => void;
}

const BOARD_WIDTH = 820;
const BOARD_HEIGHT = 420;
const SNAP_DISTANCE_PX = 28;

/**
 * Implements Game 3 — BENGKEL TANGRAM (LKM Slides 23, 24, 25):
 * - Primary LKM Challenge: Bayangan Angsa (Swan silhouette reconstructed from LKM Slide 23)
 *   with 7 mathematically exact Tangram pieces (leg ratio 2 : sqrt(2) : 1):
 *   2 Large Right-Isosceles Triangles, 1 Medium Right-Isosceles Triangle,
 *   2 Small Right-Isosceles Triangles, 1 Square, 1 Parallelogram.
 * - Bonus Challenges: Bayangan Kucing & Bayangan Ikan (each validated with 0 overlap).
 * - Full SVG pointer drag-and-drop, 45° rotation controls, 3-level visual hint system
 *   (1: Garis Batas, 2: Warna Transparan, 3: Petunjuk Arah & Sudut Keping Terpilih),
 *   and strict centroid + rotation + polygon-vertex congruence snap validation.
 */
export const TangramGameView: React.FC<TangramGameViewProps> = ({
  audioEnabled,
  completedPuzzles,
  onCompletePuzzle,
  onNavigateRecap,
  onNavigateHome,
}) => {
  const [activePuzzleId, setActivePuzzleId] = useState<'angsa' | 'kucing' | 'ikan'>('angsa');
  const currentPuzzle = TANGRAM_PUZZLES.find((p) => p.id === activePuzzleId) || TANGRAM_PUZZLES[0];

  const createInitialPieces = (puzzle = currentPuzzle): TangramPieceState[] =>
    puzzle.pieces.map((p) => ({
      id: p.id,
      x: p.initialX,
      y: p.initialY,
      rotation: p.initialRotation,
      isLocked: false,
    }));

  const [pieces, setPieces] = useState<TangramPieceState[]>(() => createInitialPieces(currentPuzzle));
  const [occupiedTargets, setOccupiedTargets] = useState<Record<string, string>>({}); // pieceId -> matchedTargetSpecId
  const [selectedPieceId, setSelectedPieceId] = useState<string>('large_tri_1');
  // 0 = Siluet Utuh (LKM), 1 = Garis Batas Bayangan, 2 = Warna Transparan, 3 = Petunjuk Keping Terpilih
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [modalState, setModalState] = useState<'none' | 'wrong' | 'correct'>('none');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef<{
    pieceId: string;
    offsetX: number;
    offsetY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const lockedCount = pieces.filter((p) => p.isLocked).length;

  const handleSwitchPuzzle = (puzzleId: 'angsa' | 'kucing' | 'ikan') => {
    soundFX.playClick(audioEnabled);
    const nextPuzzle = TANGRAM_PUZZLES.find((p) => p.id === puzzleId) || TANGRAM_PUZZLES[0];
    setActivePuzzleId(puzzleId);
    setPieces(createInitialPieces(nextPuzzle));
    setOccupiedTargets({});
    setSelectedPieceId(nextPuzzle.pieces[0].id);
    setHintLevel(0);
    setModalState('none');
  };

  const handleReset = () => {
    soundFX.playClick(audioEnabled);
    setPieces(createInitialPieces(currentPuzzle));
    setOccupiedTargets({});
    setSelectedPieceId(currentPuzzle.pieces[0].id);
    setModalState('none');
  };

  const clientToSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = BOARD_WIDTH / Math.max(1, rect.width);
    const scaleY = BOARD_HEIGHT / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const checkAndLockPiece = (
    pieceId: string,
    currentPieces: TangramPieceState[],
    currentOccupied: Record<string, string>
  ) => {
    const pieceState = currentPieces.find((p) => p.id === pieceId);
    const pieceSpec = currentPuzzle.pieces.find((p) => p.id === pieceId);
    if (!pieceState || !pieceSpec || pieceState.isLocked) return;

    const usedSet = new Set(Object.values(currentOccupied));
    const matchedTarget = findMatchingTangramTarget(
      pieceState,
      pieceSpec,
      currentPuzzle.pieces,
      usedSet,
      SNAP_DISTANCE_PX
    );

    if (matchedTarget) {
      soundFX.playSuccess(audioEnabled);
      const nextOccupied = { ...currentOccupied, [pieceId]: matchedTarget.id };
      setOccupiedTargets(nextOccupied);

      const nextPieces = currentPieces.map((p) =>
        p.id === pieceId
          ? {
              ...p,
              x: matchedTarget.targetX,
              y: matchedTarget.targetY,
              rotation: matchedTarget.targetRotation,
              isLocked: true,
            }
          : p
      );
      setPieces(nextPieces);

      const nextLockedCount = nextPieces.filter((p) => p.isLocked).length;
      if (nextLockedCount === 7) {
        soundFX.playRewardFanfare(audioEnabled);
        onCompletePuzzle(activePuzzleId, 3);
        setModalState('correct');
      } else {
        const nextUnlocked = nextPieces.find((p) => !p.isLocked);
        if (nextUnlocked) {
          setSelectedPieceId(nextUnlocked.id);
        }
      }
    }
  };

  const handlePointerDownPiece = (e: React.PointerEvent, pieceId: string) => {
    e.stopPropagation();
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece) return;
    setSelectedPieceId(pieceId);
    if (piece.isLocked) return;

    soundFX.playClick(audioEnabled);
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    draggingRef.current = {
      pieceId,
      offsetX: pt.x - piece.x,
      offsetY: pt.y - piece.y,
      currentX: piece.x,
      currentY: piece.y,
    };
    svgRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMoveBoard = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { pieceId, offsetX, offsetY } = draggingRef.current;
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    const clampedX = Math.max(28, Math.min(BOARD_WIDTH - 28, pt.x - offsetX));
    const clampedY = Math.max(28, Math.min(BOARD_HEIGHT - 28, pt.y - offsetY));

    draggingRef.current.currentX = clampedX;
    draggingRef.current.currentY = clampedY;

    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, x: clampedX, y: clampedY } : p))
    );
  };

  const handlePointerUpBoard = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { pieceId, currentX, currentY } = draggingRef.current;
    draggingRef.current = null;
    if (svgRef.current?.hasPointerCapture?.(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }

    const latestPieces = pieces.map((p) =>
      p.id === pieceId ? { ...p, x: currentX, y: currentY } : p
    );
    setPieces(latestPieces);
    checkAndLockPiece(pieceId, latestPieces, occupiedTargets);
  };

  const handleRotateSelected = (deltaDeg: number) => {
    const piece = pieces.find((p) => p.id === selectedPieceId);
    if (!piece || piece.isLocked) return;
    soundFX.playCardFlip(audioEnabled);
    const nextRotation = normalizeAngle(piece.rotation + deltaDeg);
    const nextPieces = pieces.map((p) =>
      p.id === selectedPieceId ? { ...p, rotation: nextRotation } : p
    );
    setPieces(nextPieces);
    checkAndLockPiece(selectedPieceId, nextPieces, occupiedTargets);
  };

  const handleCheckIncomplete = () => {
    if (lockedCount === 7) {
      soundFX.playRewardFanfare(audioEnabled);
      onCompletePuzzle(activePuzzleId, 3);
      setModalState('correct');
    } else {
      soundFX.playError(audioEnabled);
      setModalState('wrong');
    }
  };

  const selectedSpec = currentPuzzle.pieces.find((p) => p.id === selectedPieceId);
  const selectedState = pieces.find((p) => p.id === selectedPieceId);

  // Determine the active target slot for Hint Level 3 (either exact spec if unoccupied, or unoccupied congruent sibling)
  const usedTargetSet = new Set(Object.values(occupiedTargets));
  const selectedHintTarget = (() => {
    if (!selectedSpec || !selectedState || selectedState.isLocked) return null;
    if (!usedTargetSet.has(selectedSpec.id)) return selectedSpec;
    return (
      currentPuzzle.pieces.find((spec) => {
        if (usedTargetSet.has(spec.id)) return false;
        const isBothLarge =
          (selectedSpec.kind === 'large_triangle_1' || selectedSpec.kind === 'large_triangle_2') &&
          (spec.kind === 'large_triangle_1' || spec.kind === 'large_triangle_2');
        const isBothSmall =
          (selectedSpec.kind === 'small_triangle_1' || selectedSpec.kind === 'small_triangle_2') &&
          (spec.kind === 'small_triangle_1' || spec.kind === 'small_triangle_2');
        return isBothLarge || isBothSmall;
      }) || null
    );
  })();

  const isSelectedRotationAligned =
    selectedState &&
    selectedHintTarget &&
    isRotationMatch(
      selectedState.rotation,
      selectedHintTarget.targetRotation,
      selectedHintTarget.rotationSymmetry
    );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick(audioEnabled);
            onNavigateHome();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Game Center</span>
        </button>

        {/* Challenge Selector: Angsa (Main LKM) + Bonus Kucing & Ikan */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          {TANGRAM_PUZZLES.map((p) => {
            const isActive = p.id === activePuzzleId;
            const isDone = completedPuzzles.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSwitchPuzzle(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white/70'
                }`}
              >
                {p.id === 'angsa'
                  ? '1. Angsa (Utama)'
                  : p.id === 'kucing'
                  ? '2. Kucing (Bonus)'
                  : '3. Ikan (Bonus)'}
                {isDone ? ' ✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tangram Workshop Card (LKM Slide 23) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-blue-700">
              GAME 3 (FITUR UNGGULAN) · LKM SLIDE 23 · {currentPuzzle.subtitle.toUpperCase()}
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              BENGKEL TANGRAM — {currentPuzzle.title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {currentPuzzle.instruction}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-extrabold font-mono-tabular">
              Terkunci: {lockedCount}/7 Keping
            </span>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick(audioEnabled);
                setHintLevel((prev) => ((prev + 1) % 4) as 0 | 1 | 2 | 3);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                hintLevel > 0
                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>
                {hintLevel === 0
                  ? 'Bantuan Visual (Off)'
                  : hintLevel === 1
                  ? 'Bantuan 1: Garis Batas'
                  : hintLevel === 2
                  ? 'Bantuan 2: Warna Posisi'
                  : 'Bantuan 3: Arah Keping'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Interactive Control Toolbar for Selected Tangram Piece */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-md border border-slate-300 shrink-0"
              style={{ backgroundColor: selectedSpec?.color || '#3B82F6' }}
            />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-900">
                Keping Terpilih: {selectedSpec?.name || 'Pilih keping'}
              </span>
              <span className="ml-2 font-mono-tabular text-slate-600">
                (
                {selectedState?.isLocked
                  ? 'Sudah Terpasang ✓'
                  : `Sudut Saat Ini: ${selectedState?.rotation ?? 0}°`}
                )
              </span>
              {hintLevel === 3 && selectedHintTarget && !selectedState?.isLocked && (
                <span
                  className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                    isSelectedRotationAligned
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  {isSelectedRotationAligned
                    ? 'Sudut Sudah Tepat! Geser ke bayangan'
                    : `Putar ke Sudut ${selectedHintTarget.targetRotation}°`}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!selectedState || selectedState.isLocked}
              onClick={() => handleRotateSelected(-45)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Putar Kiri (-45°)</span>
            </button>

            <button
              type="button"
              disabled={!selectedState || selectedState.isLocked}
              onClick={() => handleRotateSelected(45)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Putar Kanan (+45°)</span>
            </button>
          </div>
        </div>

        {/* Interactive SVG Tangram Board (Left: Silhouette Target Area, Right: 7-Piece Tray) */}
        <div className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            className="w-full h-auto touch-none select-none"
            onPointerMove={handlePointerMoveBoard}
            onPointerUp={handlePointerUpBoard}
            onPointerCancel={handlePointerUpBoard}
            role="img"
            aria-label={`Area permainan Bengkel Tangram ${currentPuzzle.title}`}
          >
            <defs>
              <pattern id="tangram-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              </pattern>
              <marker
                id="hint-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
              </marker>
            </defs>

            {/* Left Zone Background: Silhouette Target Area */}
            <rect
              x="12"
              y="12"
              width="388"
              height="396"
              rx="16"
              fill="url(#tangram-grid)"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            <text x="28" y="36" fill="#334155" fontSize="12" fontWeight="800">
              AREA BAYANGAN TARGET ({currentPuzzle.id.toUpperCase()})
            </text>
            <text x="28" y="53" fill="#64748B" fontSize="10.5" fontWeight="600">
              Letakkan ketujuh bangun datar tepat di atas siluet abu-abu ini
            </text>

            {/* Right Zone Background: 7-Piece Tray */}
            <rect
              x="412"
              y="12"
              width="396"
              height="396"
              rx="16"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            <text x="428" y="36" fill="#334155" fontSize="12" fontWeight="800">
              PAPAN 7 KEPING TANGRAM (GESER & PUTAR)
            </text>
            <text x="428" y="53" fill="#64748B" fontSize="10.5" fontWeight="600">
              2 Segitiga Besar · 1 Segitiga Sedang · 2 Segitiga Kecil · 1 Persegi · 1 Jajar Genjang
            </text>

            {/* Target Silhouette Slots on Left Zone (matches grey swan shadow in LKM Slide 23) */}
            {currentPuzzle.pieces.map((spec) => {
              const isSlotFilled = usedTargetSet.has(spec.id);
              const isHint3Target = hintLevel === 3 && selectedHintTarget?.id === spec.id;

              const fillStyle =
                hintLevel >= 2
                  ? spec.color
                  : isSlotFilled
                  ? '#BBF7D0'
                  : '#94A3B8';

              const fillOpacity =
                hintLevel >= 2
                  ? isHint3Target
                    ? 0.45
                    : 0.26
                  : 1;

              const strokeColor =
                isHint3Target
                  ? '#D97706'
                  : hintLevel === 2
                  ? spec.color
                  : hintLevel === 1
                  ? '#334155'
                  : '#94A3B8';

              const strokeWidth = isHint3Target ? 3.5 : hintLevel >= 1 ? 2.2 : 1.2;
              const strokeDasharray = hintLevel >= 1 ? '5 3' : 'none';

              return (
                <g
                  key={`target-${spec.id}`}
                  data-testid={`tangram-target-${spec.id}`}
                  transform={`translate(${spec.targetX}, ${spec.targetY}) rotate(${spec.targetRotation})`}
                >
                  <polygon
                    points={spec.points}
                    fill={fillStyle}
                    fillOpacity={fillOpacity}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* Hint Level 3: Visual Directional Guide Line from Selected Piece to its Target Slot */}
            {hintLevel === 3 &&
              selectedState &&
              !selectedState.isLocked &&
              selectedHintTarget && (
                <g pointerEvents="none" data-testid="tangram-hint3-guide">
                  <line
                    x1={selectedState.x}
                    y1={selectedState.y}
                    x2={selectedHintTarget.targetX}
                    y2={selectedHintTarget.targetY}
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    markerEnd="url(#hint-arrow)"
                  />
                  <circle
                    cx={selectedHintTarget.targetX}
                    cy={selectedHintTarget.targetY}
                    r="6"
                    fill="#F59E0B"
                  />
                </g>
              )}

            {/* Render Locked Pieces first, then Unlocked Pieces, with Selected Piece on very top */}
            {[...pieces]
              .sort((a, b) => {
                if (a.isLocked !== b.isLocked) return a.isLocked ? -1 : 1;
                if (a.id === selectedPieceId) return 1;
                if (b.id === selectedPieceId) return -1;
                return 0;
              })
              .map((pieceState) => {
                const spec = currentPuzzle.pieces.find((s) => s.id === pieceState.id)!;
                const isSelected = selectedPieceId === pieceState.id;

                return (
                  <g
                    key={pieceState.id}
                    data-testid={`tangram-piece-${pieceState.id}`}
                    data-locked={pieceState.isLocked ? 'true' : 'false'}
                    transform={`translate(${pieceState.x}, ${pieceState.y}) rotate(${pieceState.rotation})`}
                    onPointerDown={(e) => handlePointerDownPiece(e, pieceState.id)}
                    className={
                      pieceState.isLocked
                        ? 'cursor-default'
                        : 'cursor-grab active:cursor-grabbing'
                    }
                  >
                    <polygon
                      points={spec.points}
                      fill={spec.color}
                      fillOpacity={pieceState.isLocked ? 0.98 : 0.92}
                      stroke={
                        pieceState.isLocked
                          ? '#FFFFFF'
                          : isSelected
                          ? '#0F172A'
                          : '#FFFFFF'
                      }
                      strokeWidth={isSelected && !pieceState.isLocked ? 3.5 : 2}
                      strokeLinejoin="round"
                    />
                    {pieceState.isLocked && (
                      <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" opacity="0.9" />
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Bottom Quick Piece Selector Buttons & Validation CTA */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {currentPuzzle.pieces.map((spec) => {
              const state = pieces.find((p) => p.id === spec.id);
              const isSelected = selectedPieceId === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick(audioEnabled);
                    setSelectedPieceId(spec.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    state?.isLocked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-xs shrink-0"
                    style={{ backgroundColor: spec.color }}
                  />
                  <span>{spec.name.split(' (')[0]}</span>
                  {state?.isLocked && <Lock className="w-3 h-3 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCheckIncomplete}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Periksa Susunan Tangram ({lockedCount}/7)</span>
          </button>
        </div>
      </section>

      {/* LKM Slide 24 & 25 Feedback Modals */}
      <FeedbackModal
        isOpen={modalState === 'wrong'}
        type="wrong"
        headline="Yah, kamu masih salah"
        message={`Saat ini baru ${lockedCount} dari 7 keping bangun datar yang menempati bayangan dengan tepat. Geser dan putar keping ke bayangan atau gunakan Bantuan Visual ya!`}
        onRetry={() => setModalState('none')}
        onHome={onNavigateHome}
      />

      <FeedbackModal
        isOpen={modalState === 'correct'}
        type="correct"
        headline="HEBAT!"
        message='Kamu baru saja menyelesaikan permainan "Bengkel Tangram"'
        starsEarned={3}
        onRetry={() => setModalState('none')}
        onContinue={onNavigateRecap}
        onHome={onNavigateHome}
      />

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Bengkel Tangram — LKM Slide 23–25)"
        scenarios={[
          'Siswa mengamati bayangan angsa di sebelah kiri dan 7 keping tangram (2 segitiga besar, 1 segitiga sedang, 2 segitiga kecil, 1 persegi, 1 jajar genjang) di sebelah kanan.',
          'Siswa menyeret (drag) dan memutar keping bangun datar ke bayangan angsa. Ketika bentuk, posisi, dan sudutnya tepat, keping otomatis terkunci (snap).',
          'Setelah 7 keping membentuk angsa secara utuh tanpa celah maupun tumpang tindih, muncul pop-up bingkai hijau "HEBAT!" dengan 3 bintang reward.',
        ]}
        mayerPrinciple="Komposisi Bangun Datar Visual: Siswa mempraktikkan langsung bagaimana bangun datar sederhana bergabung membentuk bangun baru yang bermakna."
      />
    </main>
  );
};
