import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Link2 } from 'lucide-react';
import { MATCHING_GAME_DESCRIPTIONS, MATCHING_GAME_SHAPES } from '../data/learningContent';
import { evaluateMatchingConnections } from '../utils/gameLogic';
import { FeedbackModal } from '../components/FeedbackModal';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface MatchingGameViewProps {
  audioEnabled: boolean;
  onCompleteGame: (stars: number) => void;
  onNavigateNextGame: () => void;
  onNavigateHome: () => void;
}

type MatchingShapeKey = 'segitiga' | 'persegi' | 'persegi_panjang';

/**
 * Implements Game 2 — MENJODOHKAN BANGUN DATAR (LKM Slides 20, 21, 22):
 * - Instruction: "Hubungkan gambar dengan kalimat yang sesuai!"
 * - Left column: 3 shape boxes (Segitiga, Persegi, Persegi Panjang) with connector nodes
 * - Right column: 3 property sentences from LKM Slide 20 with connector nodes:
 *   1. "Memiliki empat sudut dan empat sisi sama panjang"
 *   2. "Sisi yang berhadapan sama panjang"
 *   3. "Memiliki tiga sisi dan tiga titik sudut"
 * - Supports both pointer drag-line AND easy click-shape-then-click-sentence for mouse & touch!
 */
export const MatchingGameView: React.FC<MatchingGameViewProps> = ({
  audioEnabled,
  onCompleteGame,
  onNavigateNextGame,
  onNavigateHome,
}) => {
  const [connections, setConnections] = useState<Partial<Record<MatchingShapeKey, string>>>({});
  const [activeShape, setActiveShape] = useState<MatchingShapeKey | null>(null);
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ReturnType<
    typeof evaluateMatchingConnections
  > | null>(null);
  const [modalState, setModalState] = useState<'none' | 'wrong' | 'correct'>('none');

  const handleSelectShape = (shapeId: MatchingShapeKey) => {
    soundFX.playClick(audioEnabled);
    setHasValidated(false);
    setActiveShape((prev) => (prev === shapeId ? null : shapeId));
  };

  const handleSelectDescription = (descId: string) => {
    if (!activeShape) {
      soundFX.playClick(audioEnabled);
      return;
    }
    soundFX.playCardFlip(audioEnabled);
    setHasValidated(false);
    setConnections((prev) => {
      const next = { ...prev };
      // Remove any existing shape connected to this description so pairs stay 1-to-1
      for (const k of Object.keys(next) as MatchingShapeKey[]) {
        if (next[k] === descId) {
          delete next[k];
        }
      }
      next[activeShape] = descId;
      return next;
    });
    setActiveShape(null);
  };

  const handleReset = () => {
    soundFX.playClick(audioEnabled);
    setConnections({});
    setActiveShape(null);
    setHasValidated(false);
    setValidationResult(null);
    setModalState('none');
  };

  const handleCheckAnswers = () => {
    const result = evaluateMatchingConnections(connections);
    setValidationResult(result);
    setHasValidated(true);

    if (result.allCorrect) {
      soundFX.playRewardFanfare(audioEnabled);
      onCompleteGame(3);
      setModalState('correct');
    } else {
      soundFX.playError(audioEnabled);
      setModalState('wrong');
    }
  };

  const connectedCount = Object.keys(connections).length;

  // Fixed vertical center Y coordinates (in percentage) for the 3 rows so SVG connector lines align cleanly
  const rowYPercent: Record<number, number> = {
    0: 17,
    1: 50,
    2: 83,
  };

  const renderShapeMiniSvg = (id: MatchingShapeKey) => {
    if (id === 'segitiga') {
      return (
        <svg width="72" height="58" viewBox="0 0 80 64">
          <polygon points="40,8 70,56 10,56" fill="#0F172A" />
        </svg>
      );
    }
    if (id === 'persegi') {
      return (
        <svg width="72" height="58" viewBox="0 0 80 64">
          <rect x="18" y="10" width="44" height="44" fill="#0F172A" />
        </svg>
      );
    }
    return (
      <svg width="84" height="58" viewBox="0 0 96 64">
        <rect x="10" y="14" width="76" height="36" fill="#0F172A" />
      </svg>
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 font-mono-tabular">
            Terhubung: {connectedCount}/3 Pasangan
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Garis</span>
          </button>
        </div>
      </div>

      {/* Main Game Stage (LKM Slide 20) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <p className="text-xs font-bold text-blue-700">GAME 2 · LKM SLIDE 20</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            MENJODOHKAN BANGUN DATAR
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-600">
            Hubungkan gambar dengan kalimat yang sesuai!
          </p>
          <p className="text-xs text-slate-500">
            Cara bermain: Klik salah satu <strong>kotak gambar</strong> di sebelah kiri, lalu klik <strong>kotak kalimat</strong> pasangannya di sebelah kanan!
          </p>
        </div>

        {/* Interactive Matching Board */}
        <div className="relative max-w-4xl mx-auto">
          <div className="grid grid-cols-12 gap-3 sm:gap-6 items-stretch">
            {/* Left Column: 3 Shape Boxes */}
            <div className="col-span-5 flex flex-col justify-between gap-4">
              {MATCHING_GAME_SHAPES.map((shape) => {
                const isSelected = activeShape === shape.id;
                const isConnected = Boolean(connections[shape.id]);
                const isCorrect =
                  hasValidated && validationResult
                    ? validationResult.resultsByShape[shape.id]
                    : null;

                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleSelectShape(shape.id)}
                    aria-label={`Pilih bangun datar ${shape.name}`}
                    className={`relative h-28 sm:h-32 rounded-2xl border-2 p-3 sm:p-4 flex items-center justify-between transition-all cursor-pointer ${
                      isCorrect === true
                        ? 'bg-emerald-50 border-emerald-500'
                        : isCorrect === false
                        ? 'bg-rose-50 border-rose-500'
                        : isSelected
                        ? 'bg-blue-50 border-blue-600 ring-4 ring-blue-100'
                        : isConnected
                        ? 'bg-slate-50 border-blue-400'
                        : 'bg-white border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mx-auto">
                      {renderShapeMiniSvg(shape.id)}
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                        {shape.name}
                      </span>
                    </div>

                    {/* Right Connector Dot matching LKM Slide 20 */}
                    <span
                      className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-200 scale-125'
                          : isConnected
                          ? 'bg-blue-700 border-white'
                          : 'bg-slate-900 border-white'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Middle Column: SVG Connector Lines */}
            <div className="col-span-2 relative flex items-center justify-center">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {(Object.keys(connections) as MatchingShapeKey[]).map((shapeKey) => {
                  const descId = connections[shapeKey];
                  if (!descId) return null;

                  const leftIdx = MATCHING_GAME_SHAPES.findIndex((s) => s.id === shapeKey);
                  const rightIdx = MATCHING_GAME_DESCRIPTIONS.findIndex((d) => d.id === descId);
                  if (leftIdx === -1 || rightIdx === -1) return null;

                  const y1 = rowYPercent[leftIdx];
                  const y2 = rowYPercent[rightIdx];

                  const isCorrect =
                    hasValidated && validationResult
                      ? validationResult.resultsByShape[shapeKey]
                      : null;

                  const strokeColor =
                    isCorrect === true
                      ? '#10B981'
                      : isCorrect === false
                      ? '#EF4444'
                      : '#2563EB';

                  return (
                    <g key={shapeKey}>
                      <line
                        x1="0"
                        y1={y1}
                        x2="100"
                        y2={y2}
                        stroke={strokeColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <circle cx="0" cy={y1} r="3.5" fill={strokeColor} />
                      <circle cx="100" cy={y2} r="3.5" fill={strokeColor} />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Right Column: 3 Sentence Boxes from LKM Slide 20 */}
            <div className="col-span-5 flex flex-col justify-between gap-4">
              {MATCHING_GAME_DESCRIPTIONS.map((desc) => {
                const connectedShapeKey = (Object.keys(connections) as MatchingShapeKey[]).find(
                  (k) => connections[k] === desc.id
                );
                const isConnected = Boolean(connectedShapeKey);
                const isCorrect =
                  hasValidated && validationResult && connectedShapeKey
                    ? validationResult.resultsByShape[connectedShapeKey]
                    : null;

                return (
                  <button
                    key={desc.id}
                    type="button"
                    onClick={() => handleSelectDescription(desc.id)}
                    aria-label={`Hubungkan ke kalimat: ${desc.text}`}
                    className={`relative h-28 sm:h-32 rounded-2xl border-2 p-3 sm:p-4 flex items-center justify-between text-left transition-all cursor-pointer ${
                      isCorrect === true
                        ? 'bg-emerald-50 border-emerald-500'
                        : isCorrect === false
                        ? 'bg-rose-50 border-rose-500'
                        : activeShape
                        ? 'bg-amber-50/50 border-blue-400 hover:bg-blue-50'
                        : isConnected
                        ? 'bg-slate-50 border-blue-400'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {/* Left Connector Dot matching LKM Slide 20 */}
                    <span
                      className={`w-4 h-4 rounded-full border-2 shrink-0 mr-3 ${
                        isConnected
                          ? 'bg-blue-700 border-white'
                          : activeShape
                          ? 'bg-amber-500 border-white animate-pulse'
                          : 'bg-slate-900 border-white'
                      }`}
                    />

                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        {desc.text}
                      </p>
                      {connectedShapeKey && (
                        <p className="mt-1.5 text-[11px] font-bold text-blue-700 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          <span>
                            Terhubung: {MATCHING_GAME_SHAPES.find((s) => s.id === connectedShapeKey)?.name}
                          </span>
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Validate Answers CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            disabled={connectedCount < 3}
            onClick={handleCheckAnswers}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-45 disabled:pointer-events-none text-white font-extrabold text-base shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Periksa Pasangan Jawaban ({connectedCount}/3)</span>
          </button>
        </div>
      </section>

      {/* LKM Slide 21 & 22 Feedback Modals */}
      <FeedbackModal
        isOpen={modalState === 'wrong'}
        type="wrong"
        headline="Yah, kamu masih salah"
        message="Periksa kembali jumlah sisi dan sifat sisi pada Segitiga, Persegi, dan Persegi Panjang ya!"
        onRetry={() => setModalState('none')}
        onHome={onNavigateHome}
      />

      <FeedbackModal
        isOpen={modalState === 'correct'}
        type="correct"
        headline="BAGUS!"
        message='Kamu baru saja menyelesaikan permainan "Menjodohkan Bangun Datar"'
        starsEarned={3}
        onContinue={onNavigateNextGame}
        onHome={onNavigateHome}
      />

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Menjodohkan — LKM Slide 20–22)"
        scenarios={[
          'Siswa menghubungkan 3 gambar bangun datar (Segitiga, Persegi, Persegi Panjang) dengan 3 kalimat ciri-cirinya.',
          'Jika masih ada pasangan yang salah, muncul pop-up bingkai merah "Yah, kamu masih salah" dan guru membimbing siswa memeriksa kembali sifat bangun datar.',
          'Jika ketiga pasangan benar, muncul pop-up bingkai hijau "BAGUS!" dengan 3 bintang reward.',
        ]}
        mayerPrinciple="Prinsip Kedekatan Spasial & Penandaan: Titik penghubung dan garis warna memperjelas relasi antara bentuk visual dan definisi sifatnya."
      />
    </main>
  );
};
