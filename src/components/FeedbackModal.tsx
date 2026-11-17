import React from 'react';
import { Home, RotateCcw, ArrowRight, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  type: 'correct' | 'wrong';
  /** e.g. "PINTAR!", "BAGUS!", "HEBAT!" for correct, or "Yah, kamu masih salah" for wrong */
  headline: string;
  /** e.g. 'Kamu baru saja menyelesaikan permainan "Kartu Memori"' */
  message: string;
  starsEarned?: number;
  onRetry?: () => void;
  onContinue?: () => void;
  onHome: () => void;
}

/**
 * Implements the exact LKM Storyboard Feedback Pop-ups (Slides 18, 19, 21, 22, 24, 25):
 * - Wrong: Red border frame (`border-rose-500`), dimmed backdrop, encouraging message, "Ulangi" and "Home" buttons.
 * - Correct: Green border frame (`border-emerald-500`), 3 reward stars, "PINTAR!" / "BAGUS!" / "HEBAT!", "Lanjut" and "Home" buttons.
 */
export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  type,
  headline,
  message,
  starsEarned = 3,
  onRetry,
  onContinue,
  onHome,
}) => {
  if (!isOpen) return null;

  const isCorrect = type === 'correct';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl border-4 transition-transform ${
          isCorrect ? 'border-emerald-500' : 'border-rose-500'
        }`}
      >
        {/* Top-left Home icon button matching LKM wireframe */}
        <button
          type="button"
          onClick={onHome}
          aria-label="Kembali ke Menu Utama (Home)"
          title="Kembali ke Dashboard"
          className="absolute top-4 left-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="mt-4">
          <h2
            id="feedback-modal-title"
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isCorrect ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {headline}
          </h2>

          {/* Star display on Correct pop-up (LKM Slide 19, 22, 25) */}
          {isCorrect && (
            <div className="flex items-center justify-center gap-3 my-5" aria-label={`Mendapatkan ${starsEarned} dari 3 bintang`}>
              {[1, 2, 3].map((idx) => {
                const filled = idx <= starsEarned;
                return (
                  <Star
                    key={idx}
                    className={`w-11 h-11 transition-transform ${
                      filled
                        ? 'fill-amber-400 text-amber-500 scale-110'
                        : 'fill-slate-200 text-slate-300'
                    }`}
                  />
                );
              })}
            </div>
          )}

          <p className="mt-3 text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isCorrect && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Ulangi</span>
            </button>
          )}

          {isCorrect && onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {isCorrect && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tantangan Lain</span>
            </button>
          )}

          <button
            type="button"
            onClick={onHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base transition-colors cursor-pointer whitespace-nowrap"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
