import React from 'react';
import { Menu, Volume2, VolumeX, Star } from 'lucide-react';
import { ScreenId } from '../types/app';
import { soundFX } from '../utils/soundEffects';

interface NavbarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  totalStars: number;
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
}

const SCREEN_LABELS: Record<ScreenId, string> = {
  splash: 'Pembuka',
  welcome: 'Selamat Datang',
  dashboard: 'Dashboard Pembelajaran',
  video: 'Video Pembelajaran',
  materi: 'Materi Komposisi Bangun Datar',
  games: 'Game Center (3 Tantangan)',
  'game-memory': 'Game 1: Kartu Memori',
  'game-matching': 'Game 2: Menjodohkan Bangun Datar',
  'game-tangram': 'Game 3: Bengkel Tangram',
  recap: 'Rekap Nilai & Bintang',
  certificate: 'Sertifikat Kelulusan',
  reflection: 'Refleksi Pembelajaran',
  info: 'Informasi Aplikasi & LKM',
  guru: 'Dashboard Guru',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  audioEnabled,
  onToggleAudio,
  totalStars,
  isSidebarOpen,
  onOpenSidebar,
}) => {
  const handleNav = (target: ScreenId) => {
    soundFX.playClick(audioEnabled);
    onNavigate(target);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Hamburger Button + Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick(audioEnabled);
              onOpenSidebar();
            }}
            aria-label="Buka menu navigasi sidebar"
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-950 text-white hover:bg-blue-800 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold">Menu</span>
          </button>

          <div className="min-w-0">
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className="text-left block group cursor-pointer truncate"
            >
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-blue-950 group-hover:text-blue-700 transition-colors">
                BANGUN DATAR ADVENTURE
              </span>
              <span className="hidden md:inline-block ml-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                KOMPOSISI BANGUN DATAR
              </span>
            </button>
            <p className="text-[11px] text-slate-500 font-semibold truncate">
              {SCREEN_LABELS[currentScreen] || 'Komposisi Bangun Datar'}
            </p>
          </div>
        </div>

        {/* Right: Clean Utility Status (Stars + Audio Quick Toggle) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('recap')}
            title="Lihat Rekap Bintang"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="font-mono-tabular">{totalStars}/9</span>
          </button>

          <button
            type="button"
            onClick={onToggleAudio}
            aria-label={audioEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            title={audioEnabled ? 'Suara Aktif (Klik untuk Matikan)' : 'Suara Mati (Klik untuk Nyalakan)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              audioEnabled
                ? 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Suara Aktif' : 'Suara Mati'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
