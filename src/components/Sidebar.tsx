import React, { useEffect } from 'react';
import {
  X,
  Home,
  PlayCircle,
  BookOpen,
  Gamepad2,
  Award,
  FileBadge,
  MessageSquareHeart,
  Info,
  Volume2,
  VolumeX,
  Star,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ScreenId } from '../types/app';
import { soundFX } from '../utils/soundEffects';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  totalStars: number;
  studentName?: string;
  studentClass?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  audioEnabled,
  onToggleAudio,
  totalStars,
  studentName,
  studentClass,
}) => {
  // Close on Escape key & lock body scroll while open
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSelectScreen = (target: ScreenId) => {
    soundFX.playClick(audioEnabled);
    onNavigate(target);
    onClose();
  };

  const mainMenuItems: {
    id: ScreenId;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    activeMatch: ScreenId[];
  }[] = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      subtitle: 'Beranda & Peta Belajar',
      icon: <Home className="w-5 h-5" />,
      activeMatch: ['dashboard'],
    },
    {
      id: 'video',
      label: '2. Video Pembelajaran',
      subtitle: 'Pengantar Komposisi Bangun Datar',
      icon: <PlayCircle className="w-5 h-5" />,
      activeMatch: ['video'],
    },
    {
      id: 'materi',
      label: '3. Materi',
      subtitle: '6 Bangun Datar & Kuis Tebak',
      icon: <BookOpen className="w-5 h-5" />,
      activeMatch: ['materi'],
    },
    {
      id: 'games',
      label: '4. Games',
      subtitle: '3 Tantangan Interaktif (9 Bintang)',
      icon: <Gamepad2 className="w-5 h-5" />,
      activeMatch: ['games', 'game-memory', 'game-matching', 'game-tangram'],
    },
    {
      id: 'recap',
      label: '5. Rekap Nilai',
      subtitle: 'Capaian Bintang & Evaluasi',
      icon: <Award className="w-5 h-5" />,
      activeMatch: ['recap'],
    },
    {
      id: 'certificate',
      label: '6. Sertifikat',
      subtitle: 'Cetak & Simpan PDF A4 Landscape',
      icon: <FileBadge className="w-5 h-5" />,
      activeMatch: ['certificate'],
    },
    {
      id: 'reflection',
      label: '7. Refleksi',
      subtitle: 'Kirim Perasaan & Pesan Belajar',
      icon: <MessageSquareHeart className="w-5 h-5" />,
      activeMatch: ['reflection'],
    },
    {
      id: 'info',
      label: '8. Informasi Aplikasi',
      subtitle: 'Tim LKM & Prinsip Multimedia Mayer',
      icon: <Info className="w-5 h-5" />,
      activeMatch: ['info'],
    },
  ];

  const gameSubItems: { id: ScreenId; label: string }[] = [
    { id: 'game-memory', label: 'G1 · Kartu Memori' },
    { id: 'game-matching', label: 'G2 · Menjodohkan Bangun Datar' },
    { id: 'game-tangram', label: 'G3 · Bengkel Tangram' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 no-print transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        aria-label="Tutup menu sidebar"
      />

      {/* Off-Canvas Left Sidebar Panel (280px width) */}
      <aside
        id="app-sidebar"
        aria-label="Menu Navigasi Utama Bangun Datar Adventure"
        className={`fixed top-0 left-0 bottom-0 w-[285px] max-w-[86vw] bg-slate-900 text-white shadow-2xl border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/50">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matematika Kelas IV SD</span>
            </div>
            <h2 className="text-base font-extrabold tracking-tight text-white truncate mt-0.5">
              BANGUN DATAR ADVENTURE
            </h2>
            <p className="text-xs text-blue-300 font-semibold truncate">
              KOMPOSISI BANGUN DATAR
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Status & Star Summary Strip */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-medium">Identitas Siswa</p>
            <p className="text-xs font-bold text-white truncate">
              {studentName?.trim() ? studentName : 'Belum Diisi'}{' '}
              {studentClass?.trim() ? `(${studentClass})` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelectScreen('recap')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold shrink-0 hover:bg-amber-400/25 transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono-tabular">{totalStars}/9</span>
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <nav
          aria-label="Daftar Menu Pembelajaran"
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
        >
          {mainMenuItems.map((item) => {
            const isActive = item.activeMatch.includes(currentScreen);
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelectScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-semibold'
                  }`}
                >
                  <span
                    className={`p-2 rounded-lg shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-tight truncate">{item.label}</div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </button>

                {/* Sub-links for the 3 interactive games */}
                {item.id === 'games' && (
                  <div className="ml-6 mt-1 mb-1.5 pl-3 border-l-2 border-slate-800 space-y-1">
                    {gameSubItems.map((sub) => {
                      const isSubActive = currentScreen === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectScreen(sub.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSubActive
                              ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls: Audio Toggle & Teacher Dashboard */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <button
            type="button"
            onClick={onToggleAudio}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              audioEnabled
                ? 'bg-blue-950/80 border-blue-700 text-blue-200 hover:bg-blue-900'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span>Efek Suara &amp; Narasi</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] ${
                audioEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {audioEnabled ? 'AKTIF' : 'MATI'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectScreen('guru')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              currentScreen === 'guru'
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Dashboard Guru (/guru)</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300">
              Admin
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
};
