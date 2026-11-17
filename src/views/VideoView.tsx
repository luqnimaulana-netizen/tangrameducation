import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  BookOpen,
  Info,
} from 'lucide-react';
import { YOUTUBE_LEARNING_VIDEO } from '../data/learningContent';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface VideoViewProps {
  videoWatched: boolean;
  audioEnabled: boolean;
  onMarkWatched: () => void;
  onBackDashboard: () => void;
  onContinueToMateri: () => void;
}

/**
 * Implements the Mandatory YouTube Video Pembelajaran page + LKM Slide 3 ("Ayo, simak video berikut ini!"):
 * - Video ID: EB2rOeSnheY
 * - Embed URL: https://www.youtube.com/embed/EB2rOeSnheY
 * - 16:9 responsive aspect ratio container
 * - Clear title, short description, and pre-watch guide for Grade 4 students
 * - Fallback link button to open video directly on YouTube if embedding is restricted on a school network
 * - Navigation back to Dashboard and forward to Materi Bangun Datar
 */
export const VideoView: React.FC<VideoViewProps> = ({
  videoWatched,
  audioEnabled,
  onMarkWatched,
  onBackDashboard,
  onContinueToMateri,
}) => {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Navigation Row */}
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

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Alur Pembelajaran:</span>
          <span className="text-blue-700">1. Video Pembelajaran</span>
          <span>→</span>
          <span>2. Materi Bangun Datar</span>
          <span>→</span>
          <span>3. Games</span>
        </div>
      </div>

      {/* Main Content Card */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-blue-700 tracking-wide">
              {YOUTUBE_LEARNING_VIDEO.subtitle} · LKM Slide 3 (&ldquo;Ayo, simak video berikut ini!&rdquo;)
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {YOUTUBE_LEARNING_VIDEO.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              {YOUTUBE_LEARNING_VIDEO.description}
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFX.playSuccess(audioEnabled);
                onMarkWatched();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                videoWatched
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${videoWatched ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{videoWatched ? 'Sudah Ditonton' : 'Tandai Sudah Menonton'}</span>
            </button>
          </div>
        </div>

        {/* Two-column layout: 16:9 YouTube Player + Pre-Watch Student Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 16:9 Embedded YouTube Video Player */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-200 shadow-md">
              <iframe
                src={YOUTUBE_LEARNING_VIDEO.embedUrl}
                title="Video Pembelajaran Komposisi Bangun Datar Kelas 4 SD"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Informative notice & direct YouTube fallback link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Jika video tidak dapat diputar karena pembatasan jaringan sekolah atau penyematan perangkat, kamu dapat membuka video asli langsung di YouTube.
                </span>
              </div>
              <a
                href={YOUTUBE_LEARNING_VIDEO.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Buka di YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Petunjuk Menonton untuk Siswa */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-950 font-extrabold text-base">
                <PlayCircle className="w-5 h-5 text-blue-700 shrink-0" />
                <h2>Petunjuk Sebelum Menonton</h2>
              </div>

              <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside">
                {YOUTUBE_LEARNING_VIDEO.preWatchInstructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ol>

              <div className="pt-2 border-t border-blue-200/70">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Tips Belajar:</strong> Kamu juga bisa menjelajahi animasi interaktif keenam bangun datar secara bertahap pada halaman <strong>Materi Bangun Datar</strong>!
                </p>
              </div>
            </div>

            {/* Action CTA to continue to Materi */}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick(audioEnabled);
                onMarkWatched();
                onContinueToMateri();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-base shadow-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>Lanjut ke Materi Bangun Datar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Teacher-Student Interaction Scenario (LKM Slide 3) */}
      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Video Pembelajaran — LKM Slide 3)"
        scenarios={YOUTUBE_LEARNING_VIDEO.teacherScenario}
        mayerPrinciple="Prinsip Redundansi & Segmentasi: Teks pengantar dibuat singkat ('Ayo, simak video berikut ini!') tanpa narasi ganda, dan guru dapat menjeda (pause) video secara berkala untuk mengatur kecepatan belajar siswa."
      />
    </main>
  );
};
