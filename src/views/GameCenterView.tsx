import React from 'react';
import { ArrowLeft, Star, Play, CheckCircle2, Award } from 'lucide-react';
import { AppProgressState, ScreenId } from '../types/app';
import { calculateTotalStars } from '../utils/gameLogic';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface GameCenterViewProps {
  progress: AppProgressState;
  onNavigate: (screen: ScreenId) => void;
}

/**
 * Implements LKM Slide 16 (GAMES!):
 * - Displays 3 numbered game cards with numbered stars (1, 2, 3), custom illustrations, descriptions, star rewards, and Start buttons:
 *   1. Kartu Memori
 *   2. Menjodohkan Bangun Datar
 *   3. Bengkel Tangram
 */
export const GameCenterView: React.FC<GameCenterViewProps> = ({ progress, onNavigate }) => {
  const starSummary = calculateTotalStars({
    memory: progress.games.memory.stars,
    matching: progress.games.matching.stars,
    tangram: progress.games.tangram.stars,
  });

  const handleGo = (screen: ScreenId) => {
    soundFX.playClick(progress.audioEnabled);
    onNavigate(screen);
  };

  const gameCards = [
    {
      order: 1,
      id: 'game-memory' as ScreenId,
      title: 'Kartu Memori',
      subtitle: 'Cocokkan gambar bangun datar sesuai dengan namanya!',
      description:
        'Buka 12 kartu tertutup dan temukan 6 pasangan gambar bangun datar beserta namanya dengan tepat.',
      completed: progress.games.memory.completed,
      stars: progress.games.memory.stars,
      attempts: progress.games.memory.attempts,
      illustration: (
        <svg width="110" height="86" viewBox="0 0 120 90" role="img" aria-label="Ilustrasi Kartu Memori">
          <rect
            x="22"
            y="12"
            width="42"
            height="58"
            rx="8"
            transform="rotate(-10 43 41)"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3"
          />
          <text x="36" y="48" transform="rotate(-10 43 41)" fill="#DC2626" fontSize="26" fontWeight="900">
            ?
          </text>
          <rect
            x="56"
            y="14"
            width="42"
            height="58"
            rx="8"
            transform="rotate(8 77 43)"
            fill="#3B82F6"
            stroke="#1D4ED8"
            strokeWidth="3"
          />
          <text x="69" y="50" transform="rotate(8 77 43)" fill="#FFFFFF" fontSize="26" fontWeight="900">
            ?
          </text>
        </svg>
      ),
    },
    {
      order: 2,
      id: 'game-matching' as ScreenId,
      title: 'Menjodohkan Bangun Datar',
      subtitle: 'Hubungkan gambar dengan kalimat yang sesuai!',
      description:
        'Tarik garis penghubung antara gambar Segitiga, Persegi, dan Persegi Panjang dengan sifat sisi serta sudutnya.',
      completed: progress.games.matching.completed,
      stars: progress.games.matching.stars,
      attempts: progress.games.matching.attempts,
      illustration: (
        <svg width="110" height="86" viewBox="0 0 120 90" role="img" aria-label="Ilustrasi Menjodohkan">
          <rect x="16" y="14" width="22" height="22" rx="4" fill="#DBEAFE" stroke="#1E3A8A" strokeWidth="2.5" />
          <polygon points="27,48 38,68 16,68" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
          <circle cx="46" cy="25" r="4" fill="#1E3A8A" />
          <circle cx="46" cy="58" r="4" fill="#1E3A8A" />
          <circle cx="74" cy="25" r="4" fill="#10B981" />
          <circle cx="74" cy="58" r="4" fill="#10B981" />
          <line x1="46" y1="25" x2="74" y2="58" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="46" y1="58" x2="74" y2="25" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="82" y="14" width="24" height="22" rx="4" fill="#DCFCE7" stroke="#15803D" strokeWidth="2.5" />
          <rect x="82" y="47" width="24" height="22" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      order: 3,
      id: 'game-tangram' as ScreenId,
      title: 'Bengkel Tangram',
      subtitle: 'Ambil bangun datar lalu letakkan pada bayangan gambar angsa!',
      description:
        'Susun 7 potongan bangun datar (segitiga, persegi, dan jajar genjang) hingga membentuk siluet angsa yang utuh.',
      completed: progress.games.tangram.completed,
      stars: progress.games.tangram.stars,
      attempts: progress.games.tangram.attempts,
      illustration: (
        <svg width="110" height="86" viewBox="0 0 120 90" role="img" aria-label="Ilustrasi Bengkel Tangram">
          <g transform="translate(26, 11)">
            <polygon points="0,0 68,0 34,34" fill="#EF4444" />
            <polygon points="0,0 34,34 0,68" fill="#3B82F6" />
            <polygon points="68,0 68,34 51,17" fill="#10B981" />
            <polygon points="51,17 68,34 51,51 34,34" fill="#F59E0B" />
            <polygon points="34,34 51,51 17,51" fill="#EC4899" />
            <polygon points="0,68 17,51 51,51 34,68" fill="#8B5CF6" />
            <polygon points="68,34 68,68 34,68" fill="#06B6D4" />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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
          onClick={() => handleGo('recap')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-bold hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span className="font-mono-tabular">Total Bintang: {starSummary.total}/9 · Lihat Rekap Nilai</span>
        </button>
      </div>

      {/* Header Banner */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 text-center space-y-2">
        <p className="text-xs font-bold text-blue-700 tracking-wide">
          PILIHAN PERMAINAN EDUKASI · LKM SLIDE 16
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          GAMES!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Selesaikan ketiga permainan secara berurutan mulai dari nomor 1 hingga nomor 3 untuk mengumpulkan maksimal <strong>9 Bintang</strong>!
        </p>
      </section>

      {/* Three Numbered Game Cards matching LKM Slide 16 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gameCards.map((game) => (
          <div
            key={game.id}
            className="relative flex flex-col justify-between rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-500 p-6 shadow-xs transition-all"
          >
            {/* Top-left Numbered Star Badge matching LKM Slide 16 */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 font-extrabold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Game #{game.order}</span>
              </div>

              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                {game.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {game.completed ? 'Selesai' : 'Belum Selesai'}
              </span>
            </div>

            {/* Center Illustration & Copy */}
            <div className="space-y-4 text-center my-2">
              <div className="mx-auto w-36 h-28 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                {game.illustration}
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-slate-900">{game.title}</h2>
                <p className="text-xs font-bold text-blue-700">{game.subtitle}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{game.description}</p>
              </div>
            </div>

            {/* Bottom Star Rating & Start Button */}
            <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Bintang Diperoleh:</span>
                <div className="flex items-center gap-1" aria-label={`${game.stars} dari 3 bintang`}>
                  {[1, 2, 3].map((idx) => (
                    <Star
                      key={idx}
                      className={`w-5 h-5 ${
                        idx <= game.stars
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGo(game.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{game.completed ? 'Mainkan Lagi' : 'Mulai Permainan'}</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Game Center — LKM Slide 16)"
        scenarios={[
          'Nomor bintang (1, 2, 3) menunjukkan urutan permainan. Tiap kartu memiliki visual yang mewakili isi permainan.',
          'Guru mengarahkan siswa untuk memulai dari permainan pertama (1. Kartu Memori), dilanjutkan ke (2. Menjodohkan Bangun Datar), lalu (3. Bengkel Tangram).',
        ]}
        mayerPrinciple="Prinsip Penandaan (Signaling Principle): Nomor urutan pada bintang dan ilustrasi spesifik tiap permainan memandu pilihan siswa secara intuitif."
      />
    </main>
  );
};
