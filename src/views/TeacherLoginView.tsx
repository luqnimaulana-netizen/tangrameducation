import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2,
  LogIn,
  Info,
} from 'lucide-react';
import {
  signInTeacherWithEmail,
  signInTeacherWithGoogle,
  BOOTSTRAPPED_TEACHER_EMAIL,
} from '../services/firebase';

interface TeacherLoginViewProps {
  onBackToStudentApp: () => void;
}

export const TeacherLoginView: React.FC<TeacherLoginViewProps> = ({
  onBackToStudentApp,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapFirebaseAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes('auth/invalid-credential') ||
      msg.includes('auth/wrong-password') ||
      msg.includes('auth/user-not-found')
    ) {
      return 'Email atau kata sandi Guru tidak valid. Pastikan akun Guru sudah terdaftar di Firebase Authentication.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Format alamat email tidak valid.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Terlalu banyak percobaan masuk. Silakan tunggu beberapa saat lalu coba kembali.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Jendela login Google ditutup sebelum proses masuk selesai.';
    }
    return msg;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi email dan kata sandi akun Guru terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInTeacherWithEmail(email, password);
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInTeacherWithGoogle();
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div>
        <button
          type="button"
          onClick={onBackToStudentApp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi Siswa</span>
        </button>
      </div>

      <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-950 text-amber-400 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
            PORTAL PENGAJAR · BANGUN DATAR ADVENTURE
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Login Dashboard Guru
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Masuk menggunakan akun Firebase Authentication untuk melihat, memfilter, dan mengekspor
            data refleksi siswa dari seluruh perangkat secara <em>real-time</em>.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="teacher-email" className="block text-xs font-bold text-slate-700">
              Email Guru
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="teacher-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guru@sekolah.sch.id"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="teacher-password" className="block text-xs font-bold text-slate-700">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="teacher-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun Guru"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-extrabold text-sm transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun Guru...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk dengan Email &amp; Password</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200" />
          <span className="shrink mx-3 text-xs font-bold text-slate-400 uppercase">Atau</span>
          <div className="grow border-t border-slate-200" />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Masuk dengan Akun Google Guru</span>
        </button>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800">Keamanan Autentikasi Firebase</p>
            <p>
              Dashboard Guru diamankan oleh Firebase Authentication &amp; Firestore Security Rules.
              Akun Email/Password yang dibuat di Firebase Console atau akun Google Pengajar utama (
              <code className="font-mono text-blue-800">{BOOTSTRAPPED_TEACHER_EMAIL}</code>) dapat
              langsung mengakses data refleksi.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
