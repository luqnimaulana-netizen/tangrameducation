import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  RotateCcw,
  Award,
  CheckCircle2,
  Gamepad2,
} from 'lucide-react';
import { AppProgressState, ScreenId } from '../types/app';
import { calculateTotalStars } from '../utils/gameLogic';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface RecapViewProps {
  progress: AppProgressState;
  onNavigate: (screen: ScreenId) => void;
}

/**
 * Implements LKM Slide 26 (REKAP HASIL BELAJAR):
 * - Total Bintang (X/9) with green progress bar
 * - Per-game star rating breakdown:
 *   1. Kartu Memori (max 3 stars)
 *   2. Menjodohkan Bangun Datar (max 3 stars)
 *   3. Bengkel Tangram (max 3 stars)
 * - Buttons to replay any game or advance to Certificate (Slide 27)
 */
export const RecapView: React.FC<RecapViewProps> = ({ progress, onNavigate }) => {
  const starSummary = calculateTotalStars({
    memory: progress.games.memory.stars,
    matching: progress.games.matching.stars,
    tangram: progress.games.tangram.stars,
  });

  const handleGo = (screen: ScreenId) => {
    soundFX.playClick(progress.audioEnabled);
    onNavigate(screen);
  };

  const gameRecapRows = [
    {
      id: 'game-memory' as ScreenId,
      name: 'Kartu Memori',
      completed: progress.games.memory.completed,
      stars: progress.games.memory.stars,
      detail: progress.games.memory.bestMoves
        ? `Selesai dalam ${progress.games.memory.bestMoves} langkah`
        : 'Cocokkan 6 pasang gambar & nama bangun datar',
    },
    {
      id: 'game-matching' as ScreenId,
      name: 'Menjodohkan Bangun Datar',
      completed: progress.games.matching.completed,
      stars: progress.games.matching.stars,
      detail: progress.games.matching.completed
        ? 'Ketiga pasangan sifat bangun datar tepat'
        : 'Hubungkan 3 bangun datar dengan kalimat sifatnya',
    },
    {
      id: 'game-tangram' as ScreenId,
      name: 'Bengkel Tangram',
      completed: progress.games.tangram.completed,
      stars: progress.games.tangram.stars,
      detail:
        progress.games.tangram.completedPuzzles.length > 0
          ? `Siluet selesai: ${progress.games.tangram.completedPuzzles
              .map((p) => p.toUpperCase())
              .join(', ')}`
          : 'Susun 7 potongan tangram pada bayangan angsa',
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleGo('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => handleGo('games')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Kembali ke Game Center</span>
        </button>
      </div>

      {/* Main Recap Card (LKM Slide 26) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-blue-700 tracking-wide">
            EVALUASI CAPAIAN BINTANG · LKM SLIDE 26
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            REKAP HASIL BELAJAR
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Berikut adalah perolehan bintangmu dari ketiga tantangan permainan Komposisi Bangun Datar.
          </p>
        </div>

        {/* Total Bintang Bar matching LKM Slide 26 ("Total Bintang 9/9" + Green Progress Bar) */}
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              Total Bintang
            </span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-100 text-amber-950 font-extrabold text-xl font-mono-tabular">
              <span>{starSummary.total}/9</span>
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            </div>
          </div>

          <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${starSummary.percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Materi Dipelajari: {progress.visitedMateriIds.length}/6 Bangun Datar</span>
            <span className="font-mono-tabular">Capaian Total: {starSummary.percentage}%</span>
          </div>
        </div>

        {/* Per-Game Breakdown Rows matching LKM Slide 26 */}
        <div className="max-w-2xl mx-auto space-y-4">
          {gameRecapRows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-100/80 border border-slate-200/90"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {row.name}
                  </h2>
                  {row.completed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{row.detail}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                {/* 3 Stars Display */}
                <div
                  className="flex items-center gap-1.5"
                  aria-label={`${row.name}: ${row.stars} dari 3 bintang`}
                >
                  {[1, 2, 3].map((idx) => (
                    <Star
                      key={idx}
                      className={`w-7 h-7 ${
                        idx <= row.stars
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleGo(row.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{row.completed ? 'Ulangi' : 'Mainkan'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to Certificate (LKM Slide 26 -> 27 arrow) */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => handleGo('certificate')}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-base shadow-sm transition-colors cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>Lanjut ke Sertifikat Penghargaan</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Rekap Hasil Belajar — LKM Slide 26)"
        scenarios={[
          'Guru memberi umpan balik dan bertanya: "Game mana yang paling seru menurut kalian?"',
          'Jika perolehan bintang belum penuh (9/9), guru menyarankan siswa mengulang permainan tertentu.',
          'Guru mengarahkan siswa untuk menekan tombol "Lanjut ke Sertifikat Penghargaan".',
        ]}
        mayerPrinciple="Visualisasi Progres: Bintang per game dan bilah progres hijau menunjukkan pencapaian siswa secara visual dan terukur."
      />
    </main>
  );
};
