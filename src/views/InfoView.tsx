import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Users,
  AlertTriangle,
  Sparkles,
  Trash2,
  CheckCircle2,
  FileText,
  Download,
} from 'lucide-react';
import { LKM_TEAM_INFO } from '../data/learningContent';
import { soundFX } from '../utils/soundEffects';

interface InfoViewProps {
  audioEnabled: boolean;
  onResetAllProgress: () => void;
  onBackDashboard: () => void;
}

/**
 * Implements Halaman Informasi Aplikasi:
 * - Identitas Kelompok Mahasiswa & LKM (Mata Kuliah Desain Pesan dan Komunikasi Pembelajaran)
 * - Ringkasan Implementasi 6 Prinsip Multimedia Richard E. Mayer
 * - Catatan Validasi Akademik (Trapesium Sama Kaki vs Trapesium Umum) untuk Pengajar
 * - Tautan ke Dokumen PDF LKM Asli (/assets/aistudio/LKM.docx_c2b697c6.pdf) & Source Code ZIP
 * - Fitur Reset Progres Belajar dengan konfirmasi
 */
export const InfoView: React.FC<InfoViewProps> = ({
  audioEnabled,
  onResetAllProgress,
  onBackDashboard,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleConfirmReset = () => {
    soundFX.playClick(audioEnabled);
    onResetAllProgress();
    setConfirmReset(false);
    setResetSuccess(true);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/assets/aistudio/LKM.docx_c2b697c6.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs sm:text-sm font-bold transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Dokumen LKM (PDF)</span>
          </a>

          <a
            href="/bangun-datar-adventure-revisi-final.zip"
            download="bangun-datar-adventure-revisi-final.zip"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh ZIP Proyek</span>
          </a>
        </div>
      </div>

      {/* Identity & Team Credits from LKM Page 1 */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5 border-b border-slate-100 pb-4">
          <p className="text-xs font-bold text-blue-700">INFORMASI APLIKASI &amp; PROFIL TIM LKM</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Bangun Datar Adventure — {LKM_TEAM_INFO.moduleTitle}
          </h1>
          <p className="text-sm text-slate-600">
            {LKM_TEAM_INFO.courseName} · {LKM_TEAM_INFO.assignmentTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Members */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <Users className="w-5 h-5 text-blue-700" />
              <h2>Tim Penyusun LKM</h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {LKM_TEAM_INFO.members.map((m, idx) => (
                <li key={idx} className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-semibold text-slate-900">{m.name}</span>
                  <span className="font-mono-tabular text-xs text-slate-500">NIM: {m.nim}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Metadata */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-blue-950 font-extrabold text-base">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <h2>Identitas Pembelajaran</h2>
            </div>
            <dl className="space-y-2 text-sm text-slate-700">
              <div>
                <dt className="text-xs font-bold text-slate-500">Mata Pelajaran &amp; Kelas:</dt>
                <dd className="font-bold text-slate-900">{LKM_TEAM_INFO.subjectGrade}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-500">Tujuan Pembelajaran Khusus:</dt>
                <dd className="leading-relaxed">
                  Siswa mampu mengidentifikasi bentuk bangun datar, menyebutkan contoh benda nyata di lingkungan sekitar, dan membentuk (komposisi) bangun datar dari berbagai bangun datar lainnya.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-500">Pesan Utama:</dt>
                <dd className="leading-relaxed italic text-blue-950">
                  &ldquo;Benda di sekitar kita dapat memiliki bentuk yang menyerupai bangun datar. Kita dapat mengenali bentuknya dengan melihat sisi, sudut, dan ciri bentuknya.&rdquo;
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Mayer Principles Matrix */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2>Implementasi Prinsip Multimedia Richard E. Mayer</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LKM_TEAM_INFO.mayerPrinciplesSummary.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">{item.name}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Validation Note for Educators */}
      <section className="rounded-3xl bg-amber-50 border border-amber-300 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-950 font-extrabold text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h2>Catatan Validasi Akademik untuk Pengajar</h2>
        </div>
        <div className="space-y-2 text-sm text-amber-950 leading-relaxed">
          <p>
            <strong>1. Sifat Trapesium (LKM Slide 8):</strong> Dalam naskah storyboard LKM tertulis narasi:{' '}
            <em>&ldquo;Trapesium hanya punya satu pasang sisi yang sejajar dan kedua sisi yang miring sama panjang.&rdquo;</em>{' '}
            Perlu dikonfirmasi oleh pengajar bahwa sifat &ldquo;kedua sisi miring sama panjang&rdquo; secara khusus berlaku pada <strong>Trapesium Sama Kaki</strong> (seperti tampak pada ilustrasi atap rumah Joglo di LKM). Secara umum, trapesium juga mencakup Trapesium Siku-siku dan Trapesium Sembarang yang panjang kedua sisi miringnya tidak harus sama.
          </p>
          <p>
            <strong>2. Sifat Persegi &amp; Belah Ketupat (LKM Slide 5 &amp; 10):</strong> Pada LKM Slide 10 disebutkan bahwa Belah Ketupat memiliki empat sisi sama panjang dengan bentuk miring. Pengajar dapat menambahkan diskusi kelas bahwa pada Persegi keempat sudutnya siku-siku (90°), sedangkan pada Belah Ketupat secara umum sudut-sudut yang berhadapan sama besar namun tidak harus siku-siku.
          </p>
        </div>
      </section>

      {/* Reset Local Storage Data Section */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-900">
            Pengaturan Data Progres Lokal (LocalStorage)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Reset seluruh bintang permainan, progres materi, nama sertifikat, dan catatan refleksi untuk siswa baru.
          </p>
          {resetSuccess && (
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-4 h-4" /> Seluruh data progres berhasil direset!
            </p>
          )}
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => {
              soundFX.playClick(audioEnabled);
              setConfirmReset(true);
              setResetSuccess(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold shrink-0 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Progres Belajar</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
            >
              Ya, Hapus Data
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
          </div>
        )}
      </section>
    </main>
  );
};
