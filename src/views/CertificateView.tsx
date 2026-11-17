import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  FileDown,
  Award,
  Star,
  MessageSquareHeart,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AppProgressState, ScreenId } from '../types/app';
import { calculateTotalStars } from '../utils/gameLogic';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface CertificateViewProps {
  progress: AppProgressState;
  onUpdateStudentName: (name: string) => void;
  onUpdateStudentClass?: (studentClass: string) => void;
  onUpdateTeacherName: (name: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

/**
 * Implements LKM Slide 27 (SERTIFIKAT) + Feature 2 Revision:
 * - Instruction: "Tulis namamu dalam sertifikat ini!"
 * - Validates that studentName is non-empty before allowing Print / Save as PDF
 * - Never prints a fake placeholder student name
 * - High-precision A4 Landscape print layout (`@page { size: A4 landscape; margin: 10mm; }`)
 */
export const CertificateView: React.FC<CertificateViewProps> = ({
  progress,
  onUpdateStudentName,
  onUpdateStudentClass,
  onUpdateTeacherName,
  onNavigate,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPdfTip, setShowPdfTip] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const starSummary = calculateTotalStars({
    memory: progress.games.memory.stars,
    matching: progress.games.matching.stars,
    tangram: progress.games.tangram.stars,
  });

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const trimmedStudentName = progress.studentName.trim();
  const trimmedStudentClass = (progress.studentClass || '').trim();

  const handlePrintOrSavePdf = (mode: 'print' | 'pdf') => {
    soundFX.playClick(progress.audioEnabled);
    if (!trimmedStudentName) {
      soundFX.playError(progress.audioEnabled);
      setValidationError(
        'Silakan isi Nama Lengkap Siswa terlebih dahulu sebelum mencetak atau menyimpan sertifikat sebagai PDF.'
      );
      nameInputRef.current?.focus();
      return;
    }

    setValidationError(null);
    if (mode === 'pdf') {
      setShowPdfTip(true);
    }
    window.setTimeout(() => {
      window.print();
    }, 80);
  };

  return (
    <main className="certificate-print-wrapper max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick(progress.audioEnabled);
            onNavigate('recap');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Rekap Nilai</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handlePrintOrSavePdf('print')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Sertifikat</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrintOrSavePdf('pdf')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Simpan sebagai PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick(progress.audioEnabled);
              onNavigate('reflection');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <span>Lanjut ke Refleksi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Input Section (hidden when printing) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 space-y-4 no-print">
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-blue-700">PENGHARGAAN BELAJAR · LKM SLIDE 27</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">SERTIFIKAT</h1>
          <p className="text-sm font-semibold text-slate-600">
            Tulis namamu dalam sertifikat ini!
          </p>
        </div>

        {validationError && (
          <div
            role="alert"
            className="max-w-2xl mx-auto flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {showPdfTip && !validationError && (
          <div className="max-w-2xl mx-auto flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Pada jendela cetak yang terbuka, pilih Destination/Tujuan:{' '}
              <strong>Save as PDF / Simpan sebagai PDF</strong> dengan orientasi{' '}
              <strong>Landscape (Mendatar)</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
          <div className="space-y-1.5 sm:col-span-1">
            <label htmlFor="cert-student-name" className="block text-xs font-bold text-slate-700">
              Nama Lengkap Siswa <span className="text-rose-600">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="cert-student-name"
              type="text"
              value={progress.studentName}
              onChange={(e) => {
                onUpdateStudentName(e.target.value);
                if (e.target.value.trim()) {
                  setValidationError(null);
                }
              }}
              placeholder="Contoh: Budi Santoso"
              className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none text-sm font-bold text-slate-900 ${
                validationError
                  ? 'border-rose-400 bg-rose-50/40 focus:border-rose-600'
                  : 'border-blue-300 bg-blue-50/40 focus:border-blue-600'
              }`}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label htmlFor="cert-student-class" className="block text-xs font-bold text-slate-700">
              Kelas Siswa (Opsional)
            </label>
            <input
              id="cert-student-class"
              type="text"
              value={progress.studentClass || ''}
              onChange={(e) => onUpdateStudentClass?.(e.target.value)}
              placeholder="Contoh: Kelas IV-A"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900 bg-slate-50"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label htmlFor="cert-teacher-name" className="block text-xs font-bold text-slate-700">
              Nama Guru Pendamping
            </label>
            <input
              id="cert-teacher-name"
              type="text"
              value={progress.teacherName}
              onChange={(e) => onUpdateTeacherName(e.target.value)}
              placeholder="Contoh: Ibu Guru Matematika"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900 bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* Printable A4 Landscape Certificate Canvas */}
      <section
        aria-label="Pratinjau Sertifikat Penghargaan"
        className="print-only-certificate relative rounded-3xl bg-white border-8 border-double border-blue-900 shadow-lg p-7 sm:p-11 text-center overflow-hidden"
      >
        {/* Corner Geometric Ornaments */}
        <svg
          className="absolute top-0 left-0 w-28 h-28 text-blue-900/10 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <polygon points="0,0 100,0 0,100" fill="currentColor" />
          <polygon points="12,12 65,12 12,65" fill="#F59E0B" opacity="0.35" />
        </svg>
        <svg
          className="absolute top-0 right-0 w-24 h-24 text-blue-900/10 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <polygon points="100,0 0,0 100,100" fill="currentColor" />
          <polygon points="88,12 35,12 88,65" fill="#3B82F6" opacity="0.25" />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-24 h-24 text-blue-900/10 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <polygon points="0,100 100,100 0,0" fill="currentColor" />
          <polygon points="12,88 65,88 12,35" fill="#8B5CF6" opacity="0.25" />
        </svg>
        <svg
          className="absolute bottom-0 right-0 w-28 h-28 text-blue-900/10 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <polygon points="100,100 0,100 100,0" fill="currentColor" />
          <polygon points="88,88 35,88 88,35" fill="#10B981" opacity="0.35" />
        </svg>

        <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-5">
          {/* Gold Medal / Star Crest */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center shadow-sm">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-blue-800 uppercase">
              BANGUN DATAR ADVENTURE · MATEMATIKA KELAS IV SD (FASE B)
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              SERTIFIKAT PENGHARGAAN
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Diberikan dengan bangga kepada siswa:
            </p>
          </div>

          {/* Student Name Display */}
          <div className="py-2.5 px-6 border-b-2 border-slate-900 max-w-lg mx-auto">
            {trimmedStudentName ? (
              <p className="text-2xl sm:text-4xl font-extrabold text-blue-950 tracking-wide">
                {trimmedStudentName}
              </p>
            ) : (
              <p className="text-base sm:text-xl font-bold italic text-slate-400 no-print">
                [ Tulis Nama Lengkapmu di Kolom Atas ]
              </p>
            )}
            {trimmedStudentClass && (
              <p className="text-xs sm:text-sm font-bold text-blue-800 mt-1">
                Kelas: {trimmedStudentClass}
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl mx-auto">
            Telah berhasil menyelesaikan pembelajaran interaktif dan tantangan permainan pada materi{' '}
            <strong className="text-blue-950">KOMPOSISI BANGUN DATAR</strong> (Matematika Fase B —
            Kelas IV Sekolah Dasar) dengan capaian prestasi:
          </p>

          {/* Star Badge on Certificate */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-50 border border-amber-300">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <span className="text-sm font-extrabold text-amber-950 font-mono-tabular">
              Total Bintang: {starSummary.total}/9 Bintang
            </span>
          </div>

          {/* Date & Teacher Signature Footer */}
          <div className="pt-6 grid grid-cols-2 gap-8 items-end text-sm text-slate-700 max-w-lg mx-auto">
            <div className="text-center space-y-5">
              <p className="text-xs font-semibold text-slate-500">Tanggal Penyelesaian</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-2">
                {formattedDate}
              </p>
            </div>

            <div className="text-center space-y-5">
              <p className="text-xs font-semibold text-slate-500">Guru Pendamping</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-2">
                {progress.teacherName.trim() ? progress.teacherName : 'Guru Kelas IV SD'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Action Button to Reflection */}
      <div className="flex justify-center pt-2 no-print">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick(progress.audioEnabled);
            onNavigate('reflection');
          }}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-base shadow-sm transition-colors cursor-pointer"
        >
          <MessageSquareHeart className="w-5 h-5" />
          <span>Lanjut ke Refleksi Pembelajaran</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Sertifikat — LKM Slide 27)"
        scenarios={[
          'Guru memandu pengisian nama lengkap siswa pada kolom sertifikat sebelum mencetak atau menyimpan sebagai PDF.',
          'Guru memberikan apresiasi dan tepuk tangan bersama di kelas karena siswa telah menyelesaikan seluruh rangkaian materi dan permainan Komposisi Bangun Datar.',
        ]}
        mayerPrinciple="Motivasi Intrinsik & Penghargaan: Sertifikat visual memberikan rasa pencapaian yang konkret bagi siswa kelas 4 SD."
      />
    </main>
  );
};
