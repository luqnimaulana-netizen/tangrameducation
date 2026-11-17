import { AppProgressState } from '../types/app';

const STORAGE_KEY = 'bangun_datar_adventure_progress_v1';

export const DEFAULT_PROGRESS_STATE: AppProgressState = {
  studentName: '',
  studentClass: '',
  teacherName: 'Ibu Guru Matematika',
  audioEnabled: true,
  narrationEnabled: false,
  teacherGuideOpen: false,
  videoWatched: false,
  visitedMateriIds: ['persegi'],
  materiQuizAnsweredCorrectly: false,
  games: {
    memory: {
      completed: false,
      stars: 0,
      bestMoves: null,
      attempts: 0,
    },
    matching: {
      completed: false,
      stars: 0,
      attempts: 0,
    },
    tangram: {
      completed: false,
      stars: 0,
      completedPuzzles: [],
      attempts: 0,
    },
  },
  reflections: [],
};

export function loadProgressState(): AppProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS_STATE;
    const parsed = JSON.parse(raw) as Partial<AppProgressState>;
    const migratedReflections = Array.isArray(parsed.reflections)
      ? parsed.reflections.map((entry) => ({
          id: entry.id || `ref_local_${Date.now()}`,
          studentName: entry.studentName || parsed.studentName || '',
          studentClass: entry.studentClass || parsed.studentClass || 'IV',
          feeling: entry.feeling === 'bosan' ? ('bosan' as const) : ('seru' as const),
          message: entry.message || '',
          createdAt: entry.createdAt || new Date().toISOString(),
          createdAtTimestamp: entry.createdAtTimestamp || Date.now(),
          source: entry.source || 'bangun-datar-adventure-v2',
          syncStatus: entry.syncStatus || 'pending',
          sheetSyncedAt: entry.sheetSyncedAt,
          lastSyncError: entry.lastSyncError,
        }))
      : [];
    return {
      ...DEFAULT_PROGRESS_STATE,
      ...parsed,
      studentName: typeof parsed.studentName === 'string' ? parsed.studentName : '',
      studentClass: typeof parsed.studentClass === 'string' ? parsed.studentClass : '',
      games: {
        memory: {
          ...DEFAULT_PROGRESS_STATE.games.memory,
          ...(parsed.games?.memory ?? {}),
        },
        matching: {
          ...DEFAULT_PROGRESS_STATE.games.matching,
          ...(parsed.games?.matching ?? {}),
        },
        tangram: {
          ...DEFAULT_PROGRESS_STATE.games.tangram,
          ...(parsed.games?.tangram ?? {}),
        },
      },
      visitedMateriIds: Array.isArray(parsed.visitedMateriIds)
        ? parsed.visitedMateriIds
        : DEFAULT_PROGRESS_STATE.visitedMateriIds,
      reflections: migratedReflections,
    };
  } catch {
    return DEFAULT_PROGRESS_STATE;
  }
}

export function saveProgressState(state: AppProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted frames
  }
}

export function clearProgressState(): AppProgressState {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return DEFAULT_PROGRESS_STATE;
}
