import React from 'react';
import {
  BookOpen,
  Gamepad2,
  Star,
  MessageSquareHeart,
  PlayCircle,
  Award,
  ArrowLeft,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AppProgressState, ScreenId } from '../types/app';
import { calculateTotalStars } from '../utils/gameLogic';
import { TeacherCharacterSvg } from '../components/illustrations/GeometryVisuals';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface DashboardViewProps {
  progress: AppProgressState;
  onNavigate: (screen: ScreenId) => void;
  onUpdateStudentName: (name: string) => void;
  onUpdateStudentClass?: (studentClass: string) => void;
}

/**
 * Implements LKM Slide 2 (MENU) combined with the Hybrid EdTech Dashboard:
 * - Greets the student, allows entering/updating name & class
 * - Displays learning summary, overall star progress (X/9 stars)
 * - Integrates the complete learning journey:
 *   Dashboard -> Video Pembelajaran -> Materi Bangun Datar -> Game Center -> Rekap Nilai -> Sertifikat -> Refleksi
 * - Preserves the 4 core LKM Menu buttons (Materi, Game, Rekap Nilai, Refleksi) + Video Pembelajaran & Sertifikat.
 */
export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onUpdateStudentName,
  onUpdateStudentClass,
}) => {
  const starSummary = calculateTotalStars({
    memory: progress.games.memory.stars,
    matching: progress.games.matching.stars,
    tangram: progress.games.tangram.stars,
  });

  const materiCount = progress.visitedMateriIds.length;
  const gamesCompletedCount =
    (progress.games.memory.completed ? 1 : 0) +
    (progress.games.matching.completed ? 1 : 0) +
    (progress.games.tangram.completed ? 1 : 0);

  const handleGo = (screen: ScreenId) => {
    soundFX.playClick(progress.audioEnabled);
    onNavigate(screen);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Banner: Student Greeting + Learning Objective + Progress */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-800">
              <span>Matematika Kelas 4 SD</span>
              <span aria-hidden="true">·</span>
              <span>Fase B</span>
              <span aria-hidden="true">·</span>
              <span>KOMPOSISI BANGUN DATAR</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Halo, {progress.studentName ? progress.studentName : 'Petualang Geometri'}!
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              <strong>Pesan Utama Pembelajaran:</strong> &ldquo;Benda di sekitar kita dapat memiliki bentuk yang menyerupai bangun datar. Kita dapat mengenali bentuknya dengan melihat sisi, sudut, dan ciri bentuknya.&rdquo;
            </p>

            {/* Quick Student Name & Class Input for Personalization, Certificate & Reflection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 max-w-xl">
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="dashboard-student-name" className="block text-xs font-bold text-slate-700">
                  Nama Lengkap Siswa:
                </label>
                <input
                  id="dashboard-student-name"
                  type="text"
                  value={progress.studentName}
                  onChange={(e) => onUpdateStudentName(e.target.value)}
                  placeholder="Ketik nama lengkapmu di sini..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                />
              </div>
              <div className="sm:col-span-1 space-y-1">
                <label htmlFor="dashboard-student-class" className="block text-xs font-bold text-slate-700">
                  Kelas:
                </label>
                <input
                  id="dashboard-student-class"
                  type="text"
                  value={progress.studentClass || ''}
                  onChange={(e) => onUpdateStudentClass?.(e.target.value)}
                  placeholder="Contoh: IV-A"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Star & Progress Summary Card */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TeacherCharacterSvg pose="teaching" size={56} />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Progres Belajar</h2>
                  <p className="text-xs text-slate-500">Target LKM: 9/9 Bintang</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 text-amber-950 font-extrabold text-base font-mono-tabular">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <span>{starSummary.total}/9</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Materi: {materiCount}/6 Bangun</span>
                <span>Games: {gamesCompletedCount}/3 Selesai</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((materiCount / 6) * 40) + ((starSummary.total / 9) * 60))
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleGo('welcome')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Halaman Pembuka</span>
              </button>
              <button
                type="button"
                onClick={() => handleGo('info')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Info &amp; Validasi LKM</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Step-by-Step Learning Path Banner */}
      <section className="rounded-2xl bg-blue-950 text-white p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>ALUR BELAJAR TERARAH</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold">
            1. Video Pembelajaran → 2. Materi 6 Bangun Datar → 3. Games (9 Bintang) → 4. Rekap, Sertifikat &amp; Refleksi
          </h2>
        </div>
        <button
          type="button"
          onClick={() => handleGo('video')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <PlayCircle className="w-5 h-5" />
          <span>Tonton Video Pembelajaran</span>
        </button>
      </section>

      {/* Main Menu Grid (LKM Slide 2 Menu + Video Pembelajaran + Sertifikat) */}
      <section aria-labelledby="menu-utama-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="menu-utama-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900">
              MENU UTAMA PEMBELAJARAN
            </h2>
            <p className="text-sm text-slate-600">
              Pilih menu di bawah ini sesuai petunjuk Ibu/Bapak Guru atau ikuti urutan langkah belajar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Video Pembelajaran YouTube (Mandatory Addition) */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Langkah 1 · {progress.videoWatched ? 'Sudah Ditonton' : 'Belum Ditonton'}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Video Pembelajaran</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Simak tayangan video pengantar Komposisi Bangun Datar langsung di dalam aplikasi.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                {progress.videoWatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {progress.videoWatched ? 'Selesai disimak' : 'Durasi singkat & jelas'}
              </span>
              <button
                type="button"
                onClick={() => handleGo('video')}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Buka Video
              </button>
            </div>
          </div>

          {/* Card 2: Materi Bangun Datar (LKM Menu 1: Ikon Buku) */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono-tabular">
                  Langkah 2 · {materiCount}/6 Bangun
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Materi Bangun Datar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pelajari 6 bangun datar (Persegi, Persegi Panjang, Segitiga, Trapesium, Jajar Genjang, Belah Ketupat) dan tantangan tebak benda!
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {progress.materiQuizAnsweredCorrectly ? 'Tantangan Terjawab' : 'Dilengkapi Kuis 10 Detik'}
              </span>
              <button
                type="button"
                onClick={() => handleGo('materi')}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Pelajari Materi
              </button>
            </div>
          </div>

          {/* Card 3: Game Center (LKM Menu 2: Ikon Stik Game) */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono-tabular">
                  Langkah 3 · {gamesCompletedCount}/3 Game
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Games Interaktif</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mainkan 3 tantangan seru: (1) Kartu Memori, (2) Menjodohkan Bangun Datar, dan (3) Bengkel Tangram Angsa!
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 font-mono-tabular">
                Bintang: {starSummary.total}/9
              </span>
              <button
                type="button"
                onClick={() => handleGo('games')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Mulai Bermain
              </button>
            </div>
          </div>

          {/* Card 4: Rekap Nilai (LKM Menu 3: Ikon Bintang) */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono-tabular">
                  Langkah 4 · Skor {starSummary.total}/9
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Rekap Hasil Belajar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lihat perolehan bintang dari setiap permainan, progres penyelesaian, dan ulangi game untuk meraih 9/9 bintang!
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-mono-tabular">
                Pencapaian: {starSummary.percentage}%
              </span>
              <button
                type="button"
                onClick={() => handleGo('recap')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Lihat Rekap Nilai
              </button>
            </div>
          </div>

          {/* Card 5: Sertifikat Penghargaan (LKM Slide 27) */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500">Langkah 5 · Penghargaan</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Sertifikat Siswa</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tulis namamu pada Sertifikat Penghargaan Digital Komposisi Bangun Datar dan cetak atau simpan sebagai PDF.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {progress.studentName ? `Atas nama: ${progress.studentName}` : 'Siap diisi nama siswa'}
              </span>
              <button
                type="button"
                onClick={() => handleGo('certificate')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Buka Sertifikat
              </button>
            </div>
          </div>

          {/* Card 6: Refleksi Siswa (LKM Menu 4: Ikon Catatan & Pensil) */}
          <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <MessageSquareHeart className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono-tabular">
                  Langkah 6 · {progress.reflections.length} Catatan
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Refleksi Belajar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bagaimana perasaanmu mengikuti pembelajaran hari ini? Pilih ekspresi perasaanmu dan tuliskan pesan serta kesanmu!
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {progress.reflections.length > 0 ? 'Sudah mengisi refleksi' : 'Belum diisi'}
              </span>
              <button
                type="button"
                onClick={() => handleGo('reflection')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Isi Refleksi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Two-way Teacher-Student Communication Guide for Menu / Dashboard (LKM Slide 2) */}
      <TeacherGuideBanner
        title="Skenario Interaksi Guru-Siswa pada Menu Utama (LKM Slide 2)"
        scenarios={[
          'Setiap tombol menu dilengkapi ikon fungsional (Video, Buku untuk Materi, Stik Game untuk Permainan, Bintang untuk Rekap Nilai, dan Catatan untuk Refleksi) agar mudah dikenali siswa kelas 4 SD.',
          'Guru mengarahkan siswa untuk memulai dari Video Pembelajaran dan Materi Bangun Datar terlebih dahulu sebelum mencoba ketiga permainan di Game Center.',
        ]}
        mayerPrinciple="Prinsip Penandaan (Signaling Principle) & Koherensi: Ikon menggambarkan fungsi setiap modul secara langsung tanpa elemen dekoratif yang membingungkan."
      />
    </main>
  );
};
