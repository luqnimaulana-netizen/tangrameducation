export type ScreenId =
  | 'splash'
  | 'welcome'
  | 'dashboard'
  | 'video'
  | 'materi'
  | 'games'
  | 'game-memory'
  | 'game-matching'
  | 'game-tangram'
  | 'recap'
  | 'certificate'
  | 'reflection'
  | 'info'
  | 'guru';

export type ShapeId =
  | 'persegi'
  | 'persegi_panjang'
  | 'segitiga'
  | 'trapesium'
  | 'jajar_genjang'
  | 'belah_ketupat';

export interface ShapeLearningItem {
  id: ShapeId;
  order: number;
  name: string;
  realObjectName: string;
  realObjectShortLabel: string;
  sidesCount: number;
  verticesCount: number;
  keyCharacteristics: string[];
  sideHighlightNote: string;
  vertexHighlightNote: string;
  screenText: string;
  narrationText: string;
  mayerPrincipleNote: string;
  teacherStudentScenario: string[];
  academicValidationNote?: string;
}

export interface MemoryCardItem {
  uid: string;
  shapeId: ShapeId;
  cardType: 'image' | 'name';
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MatchingItem {
  id: 'segitiga' | 'persegi' | 'persegi_panjang';
  name: string;
  correctDescriptionId: string;
}

export interface MatchingDescription {
  id: string;
  text: string;
  matchesShapeId: 'segitiga' | 'persegi' | 'persegi_panjang';
}

export interface TangramPoint {
  x: number;
  y: number;
}

export interface TangramPieceSpec {
  id: string;
  name: string;
  kind:
    | 'large_triangle_1'
    | 'large_triangle_2'
    | 'medium_triangle'
    | 'small_triangle_1'
    | 'small_triangle_2'
    | 'square'
    | 'parallelogram';
  color: string;
  /** Polygon points centered at its true geometric centroid (0,0) in SVG coordinate units */
  points: string;
  /** Local polygon vertices centered at centroid (0,0) at 0 deg rotation */
  vertices: TangramPoint[];
  /** Exact world polygon vertices when placed in its target slot */
  targetVertices: TangramPoint[];
  /** Target centroid position (x, y) and rotation (deg) on the 820x420 board */
  targetX: number;
  targetY: number;
  targetRotation: number;
  /** Initial tray centroid position (x, y) and rotation (deg) on the right half of the board */
  initialX: number;
  initialY: number;
  initialRotation: number;
  /** Rotational symmetry in degrees (e.g. 90 for square, 180 for parallelogram, 360 for triangle) */
  rotationSymmetry: number;
}

export interface TangramPieceState {
  id: string;
  x: number;
  y: number;
  rotation: number;
  isLocked: boolean;
}

export interface TangramPuzzleSpec {
  id: 'angsa' | 'kucing' | 'ikan';
  title: string;
  subtitle: string;
  isPrimaryLkm: boolean;
  instruction: string;
  pieces: TangramPieceSpec[];
}

export type ReflectionSyncStatus = 'synced' | 'pending' | 'failed';

export interface ReflectionEntry {
  id: string;
  studentName: string;
  studentClass: string;
  feeling: 'seru' | 'bosan';
  message: string;
  createdAt: string;
  createdAtTimestamp: number;
  source: string;
  syncStatus: ReflectionSyncStatus;
  sheetSyncedAt?: string;
  lastSyncError?: string;
}

export interface AppProgressState {
  studentName: string;
  studentClass: string;
  teacherName: string;
  audioEnabled: boolean;
  narrationEnabled: boolean;
  teacherGuideOpen: boolean;
  videoWatched: boolean;
  visitedMateriIds: ShapeId[];
  materiQuizAnsweredCorrectly: boolean;
  games: {
    memory: {
      completed: boolean;
      stars: number;
      bestMoves: number | null;
      attempts: number;
    };
    matching: {
      completed: boolean;
      stars: number;
      attempts: number;
    };
    tangram: {
      completed: boolean;
      stars: number;
      completedPuzzles: ('angsa' | 'kucing' | 'ikan')[];
      attempts: number;
    };
  };
  reflections: ReflectionEntry[];
}
