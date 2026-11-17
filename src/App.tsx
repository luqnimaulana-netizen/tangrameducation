/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AppProgressState, ReflectionEntry, ScreenId, ShapeId } from './types/app';
import {
  clearProgressState,
  loadProgressState,
  saveProgressState,
} from './utils/storage';
import { calculateTotalStars } from './utils/gameLogic';
import { soundFX } from './utils/soundEffects';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SplashView } from './views/SplashView';
import { WelcomeView } from './views/WelcomeView';
import { DashboardView } from './views/DashboardView';
import { VideoView } from './views/VideoView';
import { MateriView } from './views/MateriView';
import { GameCenterView } from './views/GameCenterView';
import { MemoryGameView } from './views/MemoryGameView';
import { MatchingGameView } from './views/MatchingGameView';
import { TangramGameView } from './views/TangramGameView';
import { RecapView } from './views/RecapView';
import { CertificateView } from './views/CertificateView';
import { ReflectionView } from './views/ReflectionView';
import { InfoView } from './views/InfoView';
import { TeacherDashboardView } from './views/TeacherDashboardView';

const VALID_SCREENS: ScreenId[] = [
  'splash',
  'welcome',
  'dashboard',
  'video',
  'materi',
  'games',
  'game-memory',
  'game-matching',
  'game-tangram',
  'recap',
  'certificate',
  'reflection',
  'info',
  'guru',
];

function getInitialScreenFromUrl(): ScreenId {
  if (typeof window === 'undefined') return 'welcome';
  const pathname = window.location.pathname.replace(/\/+$/, '');
  if (pathname === '/guru') {
    return 'guru';
  }
  const params = new URLSearchParams(window.location.search);
  const screenParam = params.get('screen') as ScreenId | null;
  if (screenParam && VALID_SCREENS.includes(screenParam)) {
    return screenParam;
  }
  if (params.get('autostart') === '1') {
    return 'dashboard';
  }
  if (params.get('splash') === '1') {
    return 'splash';
  }
  return 'welcome';
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreenFromUrl);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<AppProgressState>(() => loadProgressState());

  // Persist progress changes to LocalStorage
  useEffect(() => {
    saveProgressState(progress);
  }, [progress]);

  // Listen to browser back/forward navigation for /guru and ?screen=...
  useEffect(() => {
    const handlePopState = () => {
      setCurrentScreen(getInitialScreenFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Mirror screen state on document.body.dataset.state for inspection
  useEffect(() => {
    document.body.dataset.state = currentScreen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    soundFX.stopNarration();
  }, [currentScreen]);

  const handleNavigate = (targetScreen: ScreenId) => {
    setCurrentScreen(targetScreen);
    setIsSidebarOpen(false);
    try {
      if (targetScreen === 'guru') {
        if (window.location.pathname !== '/guru') {
          window.history.pushState({}, '', '/guru');
        }
      } else if (window.location.pathname === '/guru') {
        window.history.pushState({}, '', '/');
      }
    } catch {
      // Ignore history API restrictions in sandboxed iframes
    }
  };

  const starSummary = calculateTotalStars({
    memory: progress.games.memory.stars,
    matching: progress.games.matching.stars,
    tangram: progress.games.tangram.stars,
  });

  const handleToggleAudio = () => {
    setProgress((prev) => {
      const nextAudio = !prev.audioEnabled;
      if (nextAudio) {
        soundFX.playClick(true);
      } else {
        soundFX.stopNarration();
      }
      return { ...prev, audioEnabled: nextAudio };
    });
  };

  const handleUpdateStudentName = (name: string) => {
    setProgress((prev) => ({ ...prev, studentName: name }));
  };

  const handleUpdateStudentClass = (studentClass: string) => {
    setProgress((prev) => ({ ...prev, studentClass }));
  };

  const handleUpdateTeacherName = (name: string) => {
    setProgress((prev) => ({ ...prev, teacherName: name }));
  };

  const handleMarkVideoWatched = () => {
    setProgress((prev) => ({ ...prev, videoWatched: true }));
  };

  const handleVisitShape = (shapeId: ShapeId) => {
    setProgress((prev) => {
      if (prev.visitedMateriIds.includes(shapeId)) return prev;
      return {
        ...prev,
        visitedMateriIds: [...prev.visitedMateriIds, shapeId],
      };
    });
  };

  const handleCompleteQuiz = () => {
    setProgress((prev) => ({ ...prev, materiQuizAnsweredCorrectly: true }));
  };

  const handleCompleteMemoryGame = (stars: number, moves: number) => {
    setProgress((prev) => ({
      ...prev,
      games: {
        ...prev.games,
        memory: {
          completed: true,
          stars: Math.max(prev.games.memory.stars, stars),
          bestMoves:
            prev.games.memory.bestMoves === null
              ? moves
              : Math.min(prev.games.memory.bestMoves, moves),
          attempts: prev.games.memory.attempts + 1,
        },
      },
    }));
  };

  const handleCompleteMatchingGame = (stars: number) => {
    setProgress((prev) => ({
      ...prev,
      games: {
        ...prev.games,
        matching: {
          completed: true,
          stars: Math.max(prev.games.matching.stars, stars),
          attempts: prev.games.matching.attempts + 1,
        },
      },
    }));
  };

  const handleCompleteTangramPuzzle = (
    puzzleId: 'angsa' | 'kucing' | 'ikan',
    stars: number
  ) => {
    setProgress((prev) => {
      const nextPuzzles = prev.games.tangram.completedPuzzles.includes(puzzleId)
        ? prev.games.tangram.completedPuzzles
        : [...prev.games.tangram.completedPuzzles, puzzleId];

      return {
        ...prev,
        games: {
          ...prev.games,
          tangram: {
            completed: true,
            stars: Math.max(prev.games.tangram.stars, stars),
            completedPuzzles: nextPuzzles,
            attempts: prev.games.tangram.attempts + 1,
          },
        },
      };
    });
  };

  const handleSaveLocalReflection = (
    entry: ReflectionEntry,
    studentName: string,
    studentClass: string
  ) => {
    setProgress((prev) => ({
      ...prev,
      studentName: studentName || prev.studentName,
      studentClass: studentClass || prev.studentClass,
      reflections: [
        entry,
        ...prev.reflections.filter((r) => r.id !== entry.id),
      ],
    }));
  };

  const handleResetAllProgress = () => {
    const fresh = clearProgressState();
    setProgress(fresh);
  };

  if (currentScreen === 'splash') {
    return <SplashView onComplete={() => handleNavigate('welcome')} />;
  }

  if (currentScreen === 'welcome') {
    return (
      <WelcomeView
        onStartLearning={() => handleNavigate('dashboard')}
        onOpenInfo={() => handleNavigate('info')}
        audioEnabled={progress.audioEnabled}
        onToggleAudio={handleToggleAudio}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        audioEnabled={progress.audioEnabled}
        onToggleAudio={handleToggleAudio}
        totalStars={starSummary.total}
        isSidebarOpen={isSidebarOpen}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        audioEnabled={progress.audioEnabled}
        onToggleAudio={handleToggleAudio}
        totalStars={starSummary.total}
        studentName={progress.studentName}
        studentClass={progress.studentClass}
      />

      <div className="flex-1">
        {currentScreen === 'dashboard' && (
          <DashboardView
            progress={progress}
            onNavigate={handleNavigate}
            onUpdateStudentName={handleUpdateStudentName}
            onUpdateStudentClass={handleUpdateStudentClass}
          />
        )}

        {currentScreen === 'video' && (
          <VideoView
            videoWatched={progress.videoWatched}
            audioEnabled={progress.audioEnabled}
            onMarkWatched={handleMarkVideoWatched}
            onBackDashboard={() => handleNavigate('dashboard')}
            onContinueToMateri={() => handleNavigate('materi')}
          />
        )}

        {currentScreen === 'materi' && (
          <MateriView
            visitedMateriIds={progress.visitedMateriIds}
            materiQuizAnsweredCorrectly={progress.materiQuizAnsweredCorrectly}
            audioEnabled={progress.audioEnabled}
            onVisitShape={handleVisitShape}
            onCompleteQuiz={handleCompleteQuiz}
            onBackDashboard={() => handleNavigate('dashboard')}
            onContinueToGames={() => handleNavigate('games')}
          />
        )}

        {currentScreen === 'games' && (
          <GameCenterView progress={progress} onNavigate={handleNavigate} />
        )}

        {currentScreen === 'game-memory' && (
          <MemoryGameView
            audioEnabled={progress.audioEnabled}
            onCompleteGame={handleCompleteMemoryGame}
            onNavigateNextGame={() => handleNavigate('game-matching')}
            onNavigateHome={() => handleNavigate('games')}
          />
        )}

        {currentScreen === 'game-matching' && (
          <MatchingGameView
            audioEnabled={progress.audioEnabled}
            onCompleteGame={handleCompleteMatchingGame}
            onNavigateNextGame={() => handleNavigate('game-tangram')}
            onNavigateHome={() => handleNavigate('games')}
          />
        )}

        {currentScreen === 'game-tangram' && (
          <TangramGameView
            audioEnabled={progress.audioEnabled}
            completedPuzzles={progress.games.tangram.completedPuzzles}
            onCompletePuzzle={handleCompleteTangramPuzzle}
            onNavigateRecap={() => handleNavigate('recap')}
            onNavigateHome={() => handleNavigate('games')}
          />
        )}

        {currentScreen === 'recap' && (
          <RecapView progress={progress} onNavigate={handleNavigate} />
        )}

        {currentScreen === 'certificate' && (
          <CertificateView
            progress={progress}
            onUpdateStudentName={handleUpdateStudentName}
            onUpdateStudentClass={handleUpdateStudentClass}
            onUpdateTeacherName={handleUpdateTeacherName}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'reflection' && (
          <ReflectionView
            progress={progress}
            onSaveLocalReflection={handleSaveLocalReflection}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'info' && (
          <InfoView
            audioEnabled={progress.audioEnabled}
            onResetAllProgress={handleResetAllProgress}
            onBackDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentScreen === 'guru' && (
          <TeacherDashboardView
            onBackToStudentApp={() => handleNavigate('dashboard')}
          />
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Bangun Datar Adventure · Matematika Fase B Kelas 4 SD · KOMPOSISI BANGUN DATAR
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('info')}
              className="font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              Profil Tim LKM &amp; Prinsip Multimedia Mayer
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('guru')}
              className="font-semibold text-slate-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Dashboard Guru (/guru)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
