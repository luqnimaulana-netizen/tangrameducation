import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Star, Sparkles } from 'lucide-react';
import { MemoryCardItem } from '../types/app';
import {
  calculateMemoryStars,
  createMemoryDeck,
  isMemoryPairMatch,
} from '../utils/gameLogic';
import { InteractiveShapeSvg } from '../components/illustrations/GeometryVisuals';
import { FeedbackModal } from '../components/FeedbackModal';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface MemoryGameViewProps {
  audioEnabled: boolean;
  onCompleteGame: (stars: number, moves: number) => void;
  onNavigateNextGame: () => void;
  onNavigateHome: () => void;
}

/**
 * Implements Game 1 — KARTU MEMORI (LKM Slides 17, 18, 19):
 * - Instruction: "Cocokkan gambar bangun datar sesuai dengan namanya!"
 * - 12 yellow cards with question marks ("?") on the back:
 *   6 shape visual cards + 6 shape name cards
 * - Flip animation, pair check, mismatch pop-up option / feedback, and completion modal ("PINTAR!")
 */
export const MemoryGameView: React.FC<MemoryGameViewProps> = ({
  audioEnabled,
  onCompleteGame,
  onNavigateNextGame,
  onNavigateHome,
}) => {
  const [cards, setCards] = useState<MemoryCardItem[]>(() => createMemoryDeck(false));
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [mismatchBanner, setMismatchBanner] = useState<string | null>(null);
  const [modalState, setModalState] = useState<'none' | 'wrong' | 'correct'>('none');
  const [earnedStars, setEarnedStars] = useState<number>(3);

  const handleReset = () => {
    soundFX.playClick(audioEnabled);
    setCards(createMemoryDeck(false));
    setSelectedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsChecking(false);
    setMismatchBanner(null);
    setModalState('none');
  };

  const handleCardClick = (index: number) => {
    if (isChecking) return;
    const clickedCard = cards[index];
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    soundFX.playCardFlip(audioEnabled);
    setMismatchBanner(null);

    const updated = cards.map((c, idx) => (idx === index ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const nextSelected = [...selectedIndices, index];
    setSelectedIndices(nextSelected);

    if (nextSelected.length === 2) {
      const [firstIdx, secondIdx] = nextSelected;
      const firstCard = updated[firstIdx];
      const secondCard = updated[secondIdx];
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      setIsChecking(true);

      if (isMemoryPairMatch(firstCard, secondCard)) {
        // Match found!
        soundFX.playSuccess(audioEnabled);
        const nextMatched = matchedPairs + 1;
        window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setMatchedPairs(nextMatched);
          setSelectedIndices([]);
          setIsChecking(false);

          if (nextMatched === 6) {
            const stars = calculateMemoryStars(nextMoves, 6);
            setEarnedStars(stars);
            onCompleteGame(stars, nextMoves);
            soundFX.playRewardFanfare(audioEnabled);
            setModalState('correct');
          }
        }, 420);
      } else {
        // Not a match
        soundFX.playError(audioEnabled);
        setMismatchBanner(
          `Belum cocok: "${firstCard.label}" (${
            firstCard.cardType === 'image' ? 'Gambar' : 'Nama'
          }) dengan "${secondCard.label}" (${
            secondCard.cardType === 'image' ? 'Gambar' : 'Nama'
          }). Ingat posisinya ya!`
        );
        window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedIndices([]);
          setIsChecking(false);
        }, 950);
      }
    }
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
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 font-mono-tabular">
            Pasangan: <span className="text-emerald-700">{matchedPairs}/6</span> · Percobaan:{' '}
            <span className="text-blue-700">{moves}</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi</span>
          </button>
        </div>
      </div>

      {/* Main Game Stage (LKM Slide 17) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <p className="text-xs font-bold text-blue-700">GAME 1 · LKM SLIDE 17</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">KARTU MEMORI</h1>
          <p className="text-sm sm:text-base font-semibold text-slate-600">
            Cocokkan gambar bangun datar sesuai dengan namanya!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-1">
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.round((matchedPairs / 6) * 100)}%` }}
            />
          </div>
        </div>

        {/* Encouraging Mismatch Feedback Banner + Option to trigger LKM Slide 18 Modal */}
        {mismatchBanner && (
          <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-rose-800">
            <span>{mismatchBanner}</span>
            <button
              type="button"
              onClick={() => setModalState('wrong')}
              className="px-3 py-1 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold shrink-0 cursor-pointer"
            >
              Ulangi dari Awal?
            </button>
          </div>
        )}

        {/* 4x3 Grid of 12 Yellow "?" Cards matching LKM Slide 17 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardClick(idx)}
                aria-label={
                  isRevealed
                    ? `Kartu ${card.cardType === 'image' ? 'Gambar' : 'Nama'} ${card.label}`
                    : `Kartu tertutup nomor ${idx + 1}`
                }
                className={`relative aspect-square rounded-2xl border-3 transition-all duration-200 flex flex-col items-center justify-center p-2 cursor-pointer select-none ${
                  card.isMatched
                    ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                    : isRevealed
                    ? 'bg-white border-blue-600 shadow-md scale-102'
                    : 'bg-amber-300 hover:bg-amber-200 border-amber-500 shadow-xs active:scale-95'
                }`}
              >
                {!isRevealed ? (
                  /* Closed Yellow Card with Red Question Mark matching LKM Slide 17 */
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-extrabold text-rose-600 drop-shadow-xs">
                      ?
                    </span>
                    <span className="mt-1 text-[11px] font-bold text-amber-950 font-mono-tabular">
                      #{idx + 1}
                    </span>
                  </div>
                ) : card.cardType === 'image' ? (
                  /* Open Card: Geometric Shape Visual */
                  <div className="flex flex-col items-center justify-center">
                    <InteractiveShapeSvg
                      shapeId={card.shapeId}
                      highlightSides={true}
                      highlightVertices={true}
                      size={92}
                    />
                    <span className="text-[11px] font-bold text-slate-500">Gambar Bangun</span>
                  </div>
                ) : (
                  /* Open Card: Shape Name Text */
                  <div className="flex flex-col items-center justify-center text-center px-1 space-y-1">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                      {card.label}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700">Nama Bangun</span>
                  </div>
                )}

                {card.isMatched && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    Cocok
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Helpful Teacher/Classroom Quick Pair Guide */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Tips: Pasangkan 1 kartu <strong>Gambar Bangun Datar</strong> dengan 1 kartu <strong>Nama Bangun Datar</strong> yang sesuai!
        </div>
      </section>

      {/* LKM Slide 18 & 19 Feedback Modals */}
      <FeedbackModal
        isOpen={modalState === 'wrong'}
        type="wrong"
        headline="Yah, kamu masih salah"
        message="Jangan menyerah ya! Mari kita acak ulang kartu dan coba temukan pasangannya lagi."
        onRetry={handleReset}
        onHome={onNavigateHome}
      />

      <FeedbackModal
        isOpen={modalState === 'correct'}
        type="correct"
        headline="PINTAR!"
        message='Kamu baru saja menyelesaikan permainan "Kartu Memori"'
        starsEarned={earnedStars}
        onContinue={onNavigateNextGame}
        onHome={onNavigateHome}
      />

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Kartu Memori — LKM Slide 17–19)"
        scenarios={[
          'Kalimat instruksi "Cocokkan gambar bangun datar sesuai dengan namanya!" diletakkan tepat di atas 12 kartu agar siswa langsung paham aturan main.',
          'Jika siswa membuka pasangan yang belum tepat, guru memberi semangat untuk mengingat posisi kartu dan mencoba lagi.',
          'Saat 6 pasangan berhasil ditemukan, muncul pop-up bingkai hijau "PINTAR!" beserta 3 bintang, dan guru mengarahkan siswa klik tombol "Lanjut" ke Game 2.',
        ]}
        mayerPrinciple="Prinsip Kedekatan Spasial (Spatial Contiguity): Instruksi ditempatkan langsung di dekat area kartu tanpa membutuhkan penjelasan audio panjang."
      />
    </main>
  );
};
