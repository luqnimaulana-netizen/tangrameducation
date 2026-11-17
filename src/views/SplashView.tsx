import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface SplashViewProps {
  onComplete: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 260);

    const timer = window.setTimeout(() => {
      onComplete();
    }, 1150);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Geometric Emblem SVG */}
        <div className="mx-auto w-28 h-28 flex items-center justify-center rounded-3xl bg-blue-950 border border-blue-800 shadow-xl">
          <svg width="76" height="76" viewBox="0 0 100 100" role="img" aria-label="Logo Bangun Datar Adventure">
            <polygon points="50,12 88,48 50,84 12,48" fill="#3B82F6" opacity="0.25" />
            <rect x="20" y="20" width="26" height="26" rx="4" fill="#F59E0B" />
            <polygon points="68,18 86,46 50,46" fill="#10B981" />
            <polygon points="24,58 76,58 84,82 16,82" fill="#38BDF8" />
          </svg>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider text-sky-300">
            Matematika Fase B · Kelas 4 Sekolah Dasar
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Bangun Datar Adventure
          </h1>
          <p className="text-sm font-bold text-slate-300">
            KOMPOSISI BANGUN DATAR
          </p>
        </div>

        {/* Smooth loading progress bar */}
        <div className="w-64 mx-auto space-y-2">
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 font-mono-tabular">
            Menyiapkan petualangan geometri... {progress}%
          </p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors cursor-pointer"
        >
          <span>Lewati ke Halaman Pembuka</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
