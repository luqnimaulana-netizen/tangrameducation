import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Eye,
  CircleDot,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gamepad2,
  RotateCcw,
} from 'lucide-react';
import { ShapeId } from '../types/app';
import { MATERI_QUIZ_CHALLENGE, SHAPES_LEARNING_DATA } from '../data/learningContent';
import {
  InteractiveShapeSvg,
  RealWorldObjectSvg,
  TeacherCharacterSvg,
} from '../components/illustrations/GeometryVisuals';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface MateriViewProps {
  visitedMateriIds: ShapeId[];
  materiQuizAnsweredCorrectly: boolean;
  audioEnabled: boolean;
  onVisitShape: (shapeId: ShapeId) => void;
  onCompleteQuiz: () => void;
  onBackDashboard: () => void;
  onContinueToGames: () => void;
}

type MateriStep =
  | 'intro'
  | 'persegi'
  | 'persegi_panjang'
  | 'segitiga'
  | 'trapesium'
  | 'jajar_genjang'
  | 'belah_ketupat'
  | 'quiz'
  | 'closing';

const STEP_SEQUENCE: { id: MateriStep; label: string; shortLabel: string }[] = [
  { id: 'intro', label: 'Pembukaan', shortLabel: 'Pembukaan' },
  { id: 'persegi', label: '1. Persegi', shortLabel: 'Persegi' },
  { id: 'persegi_panjang', label: '2. Persegi Panjang', shortLabel: 'Persegi Panjang' },
  { id: 'segitiga', label: '3. Segitiga', shortLabel: 'Segitiga' },
  { id: 'trapesium', label: '4. Trapesium', shortLabel: 'Trapesium' },
  { id: 'jajar_genjang', label: '5. Jajar Genjang', shortLabel: 'Jajar Genjang' },
  { id: 'belah_ketupat', label: '6. Belah Ketupat', shortLabel: 'Belah Ketupat' },
  { id: 'quiz', label: 'Tantangan 10 Detik', shortLabel: 'Tantangan' },
  { id: 'closing', label: 'Penutup', shortLabel: 'Penutup' },
];

export const MateriView: React.FC<MateriViewProps> = ({
  visitedMateriIds,
  materiQuizAnsweredCorrectly,
  audioEnabled,
  onVisitShape,
  onCompleteQuiz,
  onBackDashboard,
  onContinueToGames,
}) => {
  const [currentStep, setCurrentStep] = useState<MateriStep>('intro');
  const [highlightSides, setHighlightSides] = useState(true);
  const [highlightVertices, setHighlightVertices] = useState(true);

  // Quiz state (LKM Slides 11-13: 10-second countdown timer)
  const [quizTimer, setQuizTimer] = useState<number>(10);
  const [quizTimerRunning, setQuizTimerRunning] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<'A' | 'B' | 'C' | null>(
    materiQuizAnsweredCorrectly ? 'B' : null
  );

  const currentStepIndex = STEP_SEQUENCE.findIndex((s) => s.id === currentStep);
  const currentShapeData = SHAPES_LEARNING_DATA.find((s) => s.id === currentStep);

  // Record shape visit when viewing one of the 6 shapes
  useEffect(() => {
    if (currentShapeData) {
      onVisitShape(currentShapeData.id);
    }
    return () => {
      soundFX.stopNarration();
    };
  }, [currentStep]);

  // Handle 10-second countdown timer when on the Quiz segment
  useEffect(() => {
    if (currentStep !== 'quiz' || !quizTimerRunning) return;
    if (quizTimer <= 0) {
      setQuizTimerRunning(false);
      // Auto-reveal answer B when timer hits 0 as described in LKM Slide 13
      if (!selectedQuizOption) {
        setSelectedQuizOption('B');
        onCompleteQuiz();
        soundFX.playSuccess(audioEnabled);
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      soundFX.playTick(audioEnabled);
      setQuizTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [currentStep, quizTimerRunning, quizTimer, selectedQuizOption, audioEnabled]);

  const handleSelectStep = (step: MateriStep) => {
    soundFX.playClick(audioEnabled);
    setCurrentStep(step);
    if (step === 'quiz' && !materiQuizAnsweredCorrectly) {
      setQuizTimer(10);
      setQuizTimerRunning(true);
      setSelectedQuizOption(null);
    } else {
      setQuizTimerRunning(false);
    }
  };

  const handleQuizAnswer = (optionId: 'A' | 'B' | 'C') => {
    setSelectedQuizOption(optionId);
    setQuizTimerRunning(false);
    if (optionId === 'B') {
      soundFX.playRewardFanfare(audioEnabled);
      onCompleteQuiz();
    } else {
      soundFX.playError(audioEnabled);
    }
  };

  const handleRestartQuiz = () => {
    soundFX.playClick(audioEnabled);
    setSelectedQuizOption(null);
    setQuizTimer(10);
    setQuizTimerRunning(true);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick(audioEnabled);
            onBackDashboard();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="text-xs font-bold text-slate-600 font-mono-tabular">
          Segmen {currentStepIndex + 1} dari {STEP_SEQUENCE.length} · Bangun Dipelajari: {visitedMateriIds.length}/6
        </div>
      </div>

      {/* Segmented Navigation Bar (Mayer's Segmenting Principle) */}
      <nav
        aria-label="Segmen Materi Bangun Datar"
        className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 overflow-x-auto"
      >
        {STEP_SEQUENCE.map((step) => {
          const isActive = step.id === currentStep;
          const isVisitedShape = SHAPES_LEARNING_DATA.some(
            (s) => s.id === step.id && visitedMateriIds.includes(s.id)
          );
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleSelectStep(step.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : isVisitedShape
                  ? 'bg-white text-blue-900 hover:bg-blue-50'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              {step.shortLabel}
            </button>
          );
        })}
      </nav>

      {/* SEGMENT 1: PEMBUKAAN (LKM Slide 4) */}
      {currentStep === 'intro' && (
        <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col items-center text-center bg-blue-50/70 rounded-2xl p-6 border border-blue-100 space-y-4">
              <TeacherCharacterSvg pose="teaching" size={145} />
              <button
                type="button"
                onClick={() =>
                  soundFX.speakNarration(
                    'Halo teman-teman! Tahukah kamu? Ternyata benda-benda di sekitar kita memiliki bentuk bangun datar, loh. Yuk, kita kenali satu per satu!',
                    true
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengarkan Sapaan Ibu Guru</span>
              </button>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-bold text-blue-700 tracking-wide">
                PEMBUKAAN MATERI · LKM SLIDE 4
              </p>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Mengenal Bangun Datar dan Benda di Sekitar
              </h1>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-500">NARASI IBU GURU:</p>
                <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                  &ldquo;Halo teman-teman! Tahukah kamu? Ternyata benda-benda di sekitar kita memiliki bentuk bangun datar, loh. Yuk, kita kenali satu per satu!&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {SHAPES_LEARNING_DATA.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleSelectStep(shape.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{shape.name}</p>
                      <p className="text-xs text-slate-500">{shape.realObjectShortLabel}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TeacherGuideBanner
            title="Skenario Komunikasi Dua Arah Guru-Siswa (Pembukaan Materi — LKM Slide 4)"
            scenarios={[
              'Terdapat karakter guru sebagai visualisasi narasi pembelajaran.',
              'Guru dan siswa menyimak pembukaan materi bersama-sama sebelum lanjut ke bangun datar pertama (Persegi).',
            ]}
            mayerPrinciple="Prinsip Koherensi & Segmentasi: Materi dibagi ke dalam 6 segmen bangun datar agar siswa kelas 4 SD dapat fokus pada satu konsep dalam satu waktu."
          />
        </section>
      )}

      {/* SEGMENTS 2–7: SIX SHAPES (LKM Slides 5–10) */}
      {currentShapeData && (
        <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold text-blue-700">
                BANGUN DATAR KE-{currentShapeData.order} DARI 6 · LKM SLIDE {currentShapeData.order + 4}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {currentShapeData.name} — {currentShapeData.realObjectName}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => soundFX.speakNarration(currentShapeData.narrationText, true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shrink-0 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Bacakan Narasi Materi</span>
            </button>
          </div>

          {/* Spatial Contiguity Visual Comparison Stage: Shape SVG next to Real World Object SVG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-items-center">
                {/* Geometric Shape with Highlighted Sides & Vertices */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <InteractiveShapeSvg
                    shapeId={currentShapeData.id}
                    highlightSides={highlightSides}
                    highlightVertices={highlightVertices}
                    size={190}
                  />
                  <span className="text-sm font-extrabold text-slate-900">
                    {currentShapeData.name}
                  </span>
                </div>

                {/* Real-World Object directly adjacent (Spatial Contiguity Principle) */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <RealWorldObjectSvg shapeId={currentShapeData.id} size={190} />
                  <span className="text-sm font-extrabold text-blue-900">
                    Contoh: {currentShapeData.realObjectShortLabel}
                  </span>
                </div>
              </div>

              {/* Interactive Signaling Controls for Sides and Vertices */}
              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-600">
                  Penunjuk Bagian Penting (Signaling):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick(audioEnabled);
                      setHighlightSides((prev) => !prev);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      highlightSides
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Sorot Sisi ({currentShapeData.sidesCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick(audioEnabled);
                      setHighlightVertices((prev) => !prev);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      highlightVertices
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CircleDot className="w-3.5 h-3.5" />
                    <span>Sorot Titik Sudut ({currentShapeData.verticesCount})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Characteristics, Sisi/Sudut Counts & Narration */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Sisi & Titik Sudut Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-800">Jumlah Sisi</p>
                    <p className="text-2xl font-extrabold text-emerald-950 font-mono-tabular">
                      {currentShapeData.sidesCount} Sisi
                    </p>
                    <p className="text-xs text-emerald-800 mt-1">
                      {currentShapeData.sideHighlightNote}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-bold text-amber-900">Jumlah Titik Sudut</p>
                    <p className="text-2xl font-extrabold text-amber-950 font-mono-tabular">
                      {currentShapeData.verticesCount} Sudut
                    </p>
                    <p className="text-xs text-amber-900 mt-1">
                      {currentShapeData.vertexHighlightNote}
                    </p>
                  </div>
                </div>

                {/* Key Characteristics List */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Ciri-Ciri {currentShapeData.name}:
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                    {currentShapeData.keyCharacteristics.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exact LKM Narration Box */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <p className="text-xs font-bold text-blue-800">PENJELASAN LKM:</p>
                  <p className="text-sm text-slate-800 leading-relaxed italic">
                    &ldquo;{currentShapeData.narrationText}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Validation Note for Trapesium (Required by Master Prompt Section 7) */}
          {currentShapeData.academicValidationNote && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{currentShapeData.academicValidationNote}</p>
            </div>
          )}

          <TeacherGuideBanner
            title={`Skenario Interaksi Guru-Siswa (${currentShapeData.name} — LKM Slide ${
              currentShapeData.order + 4
            })`}
            scenarios={currentShapeData.teacherStudentScenario}
            mayerPrinciple={currentShapeData.mayerPrincipleNote}
          />
        </section>
      )}

      {/* SEGMENT 8: TANTANGAN MENEBAK BENDA 10 DETIK (LKM Slides 11–13) */}
      {currentStep === 'quiz' && (
        <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-700">
                TANTANGAN MENEBAK BENDA · LKM SLIDE 11, 12 &amp; 13
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {MATERI_QUIZ_CHALLENGE.question}
              </h1>
              <p className="text-sm text-slate-600">
                &ldquo;{MATERI_QUIZ_CHALLENGE.narrationIntro}&rdquo;
              </p>
            </div>

            {/* 10-Second Countdown Badge matching LKM Slide 12 & 13 */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-mono-tabular font-extrabold text-lg ${
                  quizTimer === 0
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : quizTimer <= 3
                    ? 'bg-rose-50 border-rose-400 text-rose-700'
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
                aria-live="polite"
              >
                <Timer className="w-5 h-5" />
                <span>{quizTimer} detik</span>
              </div>

              <button
                type="button"
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulang Timer</span>
              </button>
            </div>
          </div>

          {/* Three Options A, B, C with Real-World Object Visuals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Option A: Ketupat */}
            <button
              type="button"
              onClick={() => handleQuizAnswer('A')}
              className={`flex flex-col items-center p-5 rounded-2xl border-3 transition-all cursor-pointer ${
                selectedQuizOption === 'A'
                  ? 'border-rose-500 bg-rose-50/70'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white'
              }`}
            >
              <span className="text-base font-extrabold text-slate-900 mb-3">A. Ketupat</span>
              <RealWorldObjectSvg shapeId="belah_ketupat" size={160} />
              {selectedQuizOption === 'A' && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                  <XCircle className="w-4 h-4" /> Ketupat berbentuk Belah Ketupat. Coba lagi!
                </span>
              )}
            </button>

            {/* Option B: Atap rumah Joglo (Correct Answer — LKM Slide 13) */}
            <button
              type="button"
              onClick={() => handleQuizAnswer('B')}
              className={`flex flex-col items-center p-5 rounded-2xl border-3 transition-all cursor-pointer ${
                selectedQuizOption === 'B'
                  ? 'border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-200'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white'
              }`}
            >
              <span className="text-base font-extrabold text-slate-900 mb-3">
                B. Atap rumah Joglo
              </span>
              <RealWorldObjectSvg shapeId="trapesium" size={160} />
              {selectedQuizOption === 'B' && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tepat sekali! Bentuknya Trapesium!
                </span>
              )}
            </button>

            {/* Option C: Kue wajik */}
            <button
              type="button"
              onClick={() => handleQuizAnswer('C')}
              className={`flex flex-col items-center p-5 rounded-2xl border-3 transition-all cursor-pointer ${
                selectedQuizOption === 'C'
                  ? 'border-rose-500 bg-rose-50/70'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white'
              }`}
            >
              <span className="text-base font-extrabold text-slate-900 mb-3">C. Kue wajik</span>
              <RealWorldObjectSvg shapeId="jajar_genjang" size={160} />
              {selectedQuizOption === 'C' && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                  <XCircle className="w-4 h-4" /> Kue wajik berbentuk Jajar Genjang. Coba lagi!
                </span>
              )}
            </button>
          </div>

          {/* Feedback Banner after answering */}
          {selectedQuizOption === 'B' && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h2 className="text-base font-extrabold text-emerald-950">
                    Ting! Benar! — {MATERI_QUIZ_CHALLENGE.narrationSuccess}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-800">
                    Atap rumah Joglo memiliki sepasang sisi sejajar (atas dan bawah) serta sepasang sisi miring yang sama panjang.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectStep('closing')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lanjut ke Penutup Materi →
              </button>
            </div>
          )}

          <TeacherGuideBanner
            title="Skenario Komunikasi Dua Arah Guru-Siswa (Tantangan 10 Detik — LKM Slide 11–13)"
            scenarios={MATERI_QUIZ_CHALLENGE.teacherScenario}
            mayerPrinciple="Processing Time & Signaling: Timer 10 detik tanpa gangguan musik memberikan waktu berpikir bagi siswa dan ruang bagi guru untuk memandu pengamatan."
          />
        </section>
      )}

      {/* SEGMENT 9: PENUTUP MATERI (LKM Slide 14: "SAMPAI JUMPA!") */}
      {currentStep === 'closing' && (
        <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-10 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex justify-center">
              <TeacherCharacterSvg pose="waving" size={145} />
            </div>
            <p className="text-xs font-bold text-blue-700">PENUTUP MATERI · LKM SLIDE 14</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">SAMPAI JUMPA!</h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              &ldquo;Luar biasa! Kamu sudah bisa menemukan berbagai bentuk bangun datar di lingkungan sekitar kita. Sekarang saatnya menguji kemampuanmu di <strong>Game Center</strong>!&rdquo;
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick(audioEnabled);
                  onContinueToGames();
                }}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-sm transition-colors cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Lanjut ke Menu Games</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick(audioEnabled);
                  onBackDashboard();
                }}
                className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
              >
                <span>Kembali ke Menu Utama</span>
              </button>
            </div>
          </div>

          <div className="text-left pt-4">
            <TeacherGuideBanner
              title="Skenario Komunikasi Dua Arah Guru-Siswa (Penutup Materi — LKM Slide 14 & 15)"
              scenarios={[
                'Guru bertanya kepada kelas: "Bagaimana materi tadi? Kalian jadi paham kan tentang bangun datar dan contoh benda di lingkungan sekitar kita?"',
                'Guru mengarahkan siswa untuk menekan tombol "Lanjut ke Menu Games" untuk memulai latihan interaktif.',
              ]}
              mayerPrinciple="Prinsip Redundansi: Menutup penayangan dengan sapaan hangat tanpa membebani layar dengan teks panjang."
            />
          </div>
        </section>
      )}

      {/* Prev / Next Step Footer Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          disabled={currentStepIndex <= 0}
          onClick={() => {
            if (currentStepIndex > 0) {
              handleSelectStep(STEP_SEQUENCE[currentStepIndex - 1].id);
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-bold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {currentStepIndex < STEP_SEQUENCE.length - 1 ? (
          <button
            type="button"
            onClick={() => handleSelectStep(STEP_SEQUENCE[currentStepIndex + 1].id)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <span>Selanjutnya: {STEP_SEQUENCE[currentStepIndex + 1].shortLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              soundFX.playClick(audioEnabled);
              onContinueToGames();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Buka Game Center</span>
          </button>
        )}
      </div>
    </main>
  );
};
