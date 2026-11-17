import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Home,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { AppProgressState, ReflectionEntry, ScreenId } from '../types/app';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';
import { validateReflectionInput } from '../utils/gameLogic';
import {
  submitStudentReflection,
  SubmitReflectionOutcome,
} from '../services/reflectionService';

interface ReflectionViewProps {
  progress: AppProgressState;
  onSaveLocalReflection: (
    entry: ReflectionEntry,
    studentName: string,
    studentClass: string
  ) => void;
  onNavigate: (screen: ScreenId) => void;
}

const PRESET_CLASSES = ['IV-A', 'IV-B', 'IV-C', 'IV-D', 'IV'];

/**
 * Implements LKM Slide 28 (REFLEKSI) + Feature 3, 4 & 6 Online Integration:
 * - Required student identity: Nama Lengkap Siswa & Kelas (tanpa akun siswa)
 * - Two choices with custom SVG expressive faces:
 *   1. "Seru Banget!" (Happy star-eyes face)
 *   2. "Bosan!" (Neutral/sad face)
 * - Open text box: "Tulis pesan dan kesanmu di sini..." (optional, max 1000 chars)
 * - Sends reflection to Cloud Firestore (/reflections) + Google Sheets serverless function
 * - Displays accurate confirmation status based on Firestore and Google Sheets outcome
 */
export const ReflectionView: React.FC<ReflectionViewProps> = ({
  progress,
  onSaveLocalReflection,
  onNavigate,
}) => {
  const [studentName, setStudentName] = useState<string>(progress.studentName || '');
  const [studentClass, setStudentClass] = useState<string>(progress.studentClass || 'IV-A');
  const [selectedFeeling, setSelectedFeeling] = useState<'seru' | 'bosan' | null>('seru');
  const [message, setMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{
    studentName?: string;
    studentClass?: string;
    feeling?: string;
    message?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitOutcome, setSubmitOutcome] = useState<SubmitReflectionOutcome | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateReflectionInput({
      studentName,
      studentClass,
      feeling: selectedFeeling,
      message,
    });

    if (!validation.valid) {
      soundFX.playError(progress.audioEnabled);
      setFieldErrors(validation.errors);
      setSubmitOutcome(null);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitOutcome(null);

    try {
      const outcome = await submitStudentReflection({
        studentName: validation.sanitizedName,
        studentClass: validation.sanitizedClass,
        feeling: selectedFeeling,
        message: validation.sanitizedMessage,
      });

      setSubmitOutcome(outcome);
      onSaveLocalReflection(
        outcome.entry,
        validation.sanitizedName,
        validation.sanitizedClass
      );

      if (outcome.savedToFirestore) {
        soundFX.playRewardFanfare(progress.audioEnabled);
        setMessage('');
      } else {
        soundFX.playError(progress.audioEnabled);
      }
    } catch (error) {
      soundFX.playError(progress.audioEnabled);
      setSubmitOutcome({
        entry: {
          id: `err_${Date.now()}`,
          studentName: validation.sanitizedName,
          studentClass: validation.sanitizedClass,
          feeling: selectedFeeling || 'seru',
          message: validation.sanitizedMessage,
          createdAt: new Date().toISOString(),
          createdAtTimestamp: Date.now(),
          source: 'bangun-datar-adventure-v2',
          syncStatus: 'failed',
        },
        savedToFirestore: false,
        syncedToSheets: false,
        syncStatus: 'failed',
        userFacingMessage:
          error instanceof Error
            ? error.message
            : 'Refleksi belum berhasil dikirim ke server. Periksa koneksi internetmu lalu coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick(progress.audioEnabled);
            onNavigate('dashboard');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick(progress.audioEnabled);
              onNavigate('certificate');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Sertifikat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick(progress.audioEnabled);
              onNavigate('guru');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Dashboard Guru</span>
          </button>
        </div>
      </div>

      {/* Main Reflection Card (LKM Slide 28 + Online Sync) */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-blue-700 tracking-wide uppercase">
            UMPAN BALIK SISWA ONLINE · KOMPOSISI BANGUN DATAR (LKM SLIDE 28)
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            REFLEKSI PEMBELAJARAN
          </h1>
          <p className="text-base sm:text-xl font-bold text-slate-700">
            Bagaimana perasaanmu mengikuti pembelajaran hari ini?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6" noValidate>
          {/* Student Identity Fields: Nama Lengkap Siswa & Kelas */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              Identitas Siswa (Wajib Diisi)
            </h2>

            <div className="space-y-1.5">
              <label
                htmlFor="reflection-student-name"
                className="block text-xs sm:text-sm font-bold text-slate-800"
              >
                Nama Lengkap Siswa <span className="text-rose-600">*</span>
              </label>
              <input
                id="reflection-student-name"
                type="text"
                maxLength={100}
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (fieldErrors.studentName) {
                    setFieldErrors((prev) => ({ ...prev, studentName: undefined }));
                  }
                }}
                placeholder="Contoh: Siti Aisyah Putri"
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm sm:text-base font-bold text-slate-900 bg-white focus:outline-none ${
                  fieldErrors.studentName
                    ? 'border-rose-400 focus:border-rose-600'
                    : 'border-slate-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.studentName && (
                <p role="alert" className="text-xs font-bold text-rose-600">
                  {fieldErrors.studentName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reflection-student-class"
                className="block text-xs sm:text-sm font-bold text-slate-800"
              >
                Kelas <span className="text-rose-600">*</span>
              </label>

              {/* Quick Class Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                {PRESET_CLASSES.map((cls) => {
                  const isSelected = studentClass.trim().toUpperCase() === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        soundFX.playClick(progress.audioEnabled);
                        setStudentClass(cls);
                        if (fieldErrors.studentClass) {
                          setFieldErrors((prev) => ({ ...prev, studentClass: undefined }));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Kelas {cls}
                    </button>
                  );
                })}
              </div>

              <input
                id="reflection-student-class"
                type="text"
                maxLength={32}
                value={studentClass}
                onChange={(e) => {
                  setStudentClass(e.target.value);
                  if (fieldErrors.studentClass) {
                    setFieldErrors((prev) => ({ ...prev, studentClass: undefined }));
                  }
                }}
                placeholder="Ketik kelasmu (contoh: IV-A, IV-B, 4 SD)"
                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-slate-900 bg-white focus:outline-none ${
                  fieldErrors.studentClass
                    ? 'border-rose-400 focus:border-rose-600'
                    : 'border-slate-300 focus:border-blue-600'
                }`}
              />
              {fieldErrors.studentClass && (
                <p role="alert" className="text-xs font-bold text-rose-600">
                  {fieldErrors.studentClass}
                </p>
              )}
            </div>
          </div>

          {/* Two Expressive Feeling Buttons matching LKM Slide 28 */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Pilih Ekspresi Perasaanmu <span className="text-rose-600">*</span>
            </p>
            <div className="grid grid-cols-2 gap-5">
              {/* Option 1: Seru Banget! */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick(progress.audioEnabled);
                  setSelectedFeeling('seru');
                  setFieldErrors((prev) => ({ ...prev, feeling: undefined }));
                }}
                aria-pressed={selectedFeeling === 'seru'}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-3 transition-all cursor-pointer ${
                  selectedFeeling === 'seru'
                    ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-100 scale-102'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                }`}
              >
                <svg
                  width="84"
                  height="84"
                  viewBox="0 0 100 100"
                  role="img"
                  aria-label="Ekspresi Seru Banget"
                >
                  <circle cx="50" cy="50" r="42" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
                  <polygon
                    points="34,26 37,34 45,34 39,39 41,47 34,42 27,47 29,39 23,34 31,34"
                    fill="#EA580C"
                  />
                  <polygon
                    points="66,26 69,34 77,34 71,39 73,47 66,42 59,47 61,39 55,34 63,34"
                    fill="#EA580C"
                  />
                  <path
                    d="M 28 58 Q 50 82 72 58 Z"
                    fill="#FFFFFF"
                    stroke="#9A3412"
                    strokeWidth="3"
                  />
                </svg>
                <span className="mt-3 text-base sm:text-lg font-extrabold text-slate-900">
                  Seru Banget!
                </span>
              </button>

              {/* Option 2: Bosan! */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick(progress.audioEnabled);
                  setSelectedFeeling('bosan');
                  setFieldErrors((prev) => ({ ...prev, feeling: undefined }));
                }}
                aria-pressed={selectedFeeling === 'bosan'}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-3 transition-all cursor-pointer ${
                  selectedFeeling === 'bosan'
                    ? 'bg-sky-50 border-sky-500 ring-4 ring-sky-100 scale-102'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                }`}
              >
                <svg
                  width="84"
                  height="84"
                  viewBox="0 0 100 100"
                  role="img"
                  aria-label="Ekspresi Bosan"
                >
                  <circle cx="50" cy="50" r="42" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
                  <circle cx="36" cy="40" r="5" fill="#1E293B" />
                  <circle cx="64" cy="40" r="5" fill="#1E293B" />
                  <path
                    d="M 34 68 Q 50 58 66 68"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="mt-3 text-base sm:text-lg font-extrabold text-slate-900">
                  Bosan!
                </span>
              </button>
            </div>
            {fieldErrors.feeling && (
              <p role="alert" className="text-xs font-bold text-rose-600">
                {fieldErrors.feeling}
              </p>
            )}
          </div>

          {/* Open Message Input Box matching LKM Slide 28 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="reflection-message"
                className="block text-sm font-bold text-slate-800"
              >
                Tuliskan pesan dan kesanmu (Opsional):
              </label>
              <span className="text-xs text-slate-400 font-mono-tabular">
                {message.length}/1000
              </span>
            </div>
            <textarea
              id="reflection-message"
              rows={4}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan dan kesanmu di sini... (Misal: Aku paling suka menyusun Tangram Angsa!)"
              className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none text-sm sm:text-base text-slate-900"
            />
            {fieldErrors.message && (
              <p role="alert" className="text-xs font-bold text-rose-600">
                {fieldErrors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-extrabold text-base shadow-sm transition-colors cursor-pointer ${
              isSubmitting
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mengirim Refleksi ke Server...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Kirim Refleksi Hari Ini</span>
              </>
            )}
          </button>
        </form>

        {/* Accurate Confirmation Banner after Submission */}
        {submitOutcome && (
          <div
            role="status"
            className={`max-w-xl mx-auto p-5 rounded-2xl border-2 flex items-start gap-3 ${
              submitOutcome.savedToFirestore && submitOutcome.syncedToSheets
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : submitOutcome.savedToFirestore
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}
          >
            {submitOutcome.savedToFirestore && submitOutcome.syncedToSheets ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : submitOutcome.savedToFirestore ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 text-sm">
              <p className="font-extrabold text-base">{submitOutcome.userFacingMessage}</p>
              <p className="text-xs opacity-90">
                Siswa: <strong>{submitOutcome.entry.studentName}</strong> · Kelas:{' '}
                <strong>{submitOutcome.entry.studentClass}</strong> · Ekspresi:{' '}
                <strong>
                  {submitOutcome.entry.feeling === 'seru' ? 'Seru Banget!' : 'Bosan!'}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* Local Device History */}
        {progress.reflections.length > 0 && (
          <div className="max-w-xl mx-auto pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Riwayat Refleksi Perangkat Ini ({progress.reflections.length})</span>
            </div>
            <div className="space-y-2.5">
              {progress.reflections.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900">
                        {entry.feeling === 'seru' ? '😊 Seru Banget!' : '😐 Bosan!'}
                      </span>
                      <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {entry.studentName || 'Siswa'} ({entry.studentClass || 'IV'})
                      </span>
                    </div>
                    {entry.message && <p className="text-slate-700">{entry.message}</p>}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-tabular shrink-0">
                    {(() => {
                      try {
                        return new Date(entry.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return entry.createdAt;
                      }
                    })()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <TeacherGuideBanner
        title="Skenario Komunikasi Dua Arah Guru-Siswa (Refleksi — LKM Slide 28)"
        scenarios={[
          'Guru memandu siswa mengisi Nama Lengkap dan Kelas, lalu memilih ekspresi perasaan ("Seru Banget!" atau "Bosan!").',
          'Guru memberi waktu agar siswa menuliskan pesan dan kesan terkait pembelajaran Komposisi Bangun Datar hari ini.',
          'Guru membuka Dashboard Guru (/guru) untuk melihat rekapitulasi refleksi seluruh siswa secara real-time dari database Cloud Firestore dan Google Sheets.',
        ]}
        mayerPrinciple="Desain Ramah Anak & Komunikasi Dua Arah: Pilihan ekspresi sederhana dikombinasikan dengan kolom terbuka memberi ruang ekspresi yang jujur bagi siswa."
      />
    </main>
  );
};
