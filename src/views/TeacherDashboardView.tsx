import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Download,
  ExternalLink,
  Search,
  Filter,
  Users,
  MessageSquareHeart,
  Smile,
  Meh,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { ReflectionEntry } from '../types/app';
import {
  auth,
  onAuthStateChanged,
  checkIsAuthorizedTeacher,
  signOutTeacher,
  User,
} from '../services/firebase';
import {
  subscribeToTeacherReflections,
  fetchTeacherReflections,
  retryReflectionSheetSync,
  buildReflectionsCsv,
} from '../services/reflectionService';
import { TeacherLoginView } from './TeacherLoginView';

interface TeacherDashboardViewProps {
  onBackToStudentApp: () => void;
}

const PAGE_SIZE = 10;

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  onBackToStudentApp,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'warning';
    text: string;
  } | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [feelingFilter, setFeelingFilter] = useState<'ALL' | 'seru' | 'bosan'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail modal & Retry state
  const [selectedDetail, setSelectedDetail] = useState<ReflectionEntry | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [showSheetsGuideModal, setShowSheetsGuideModal] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthChecking(true);
      if (!user) {
        setCurrentUser(null);
        setIsAuthorized(false);
        setAuthChecking(false);
        return;
      }
      const allowed = await checkIsAuthorizedTeacher(user);
      setCurrentUser(user);
      setIsAuthorized(allowed);
      setAuthChecking(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore reflections when authenticated & authorized
  useEffect(() => {
    if (!currentUser || !isAuthorized) {
      setReflections([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setDataError(null);

    const unsubscribe = subscribeToTeacherReflections(
      (items) => {
        setReflections(items);
        setLoadingData(false);
      },
      (errMsg) => {
        setDataError(errMsg);
        setLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthorized]);

  const handleManualRefresh = async () => {
    if (!currentUser || !isAuthorized) return;
    setLoadingData(true);
    setDataError(null);
    try {
      const items = await fetchTeacherReflections();
      setReflections(items);
      setActionBanner({
        type: 'success',
        text: `Data berhasil diperbarui (${items.length} refleksi dimuat dari Cloud Firestore).`,
      });
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Gagal memuat ulang data.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleRetrySync = async (entry: ReflectionEntry) => {
    setRetryingId(entry.id);
    setActionBanner(null);
    try {
      const res = await retryReflectionSheetSync(entry);
      setActionBanner({
        type: res.ok ? 'success' : 'warning',
        text: res.message,
      });
      if (selectedDetail?.id === entry.id) {
        setSelectedDetail(res.updatedEntry);
      }
    } finally {
      setRetryingId(null);
    }
  };

  // Distinct classes for filter dropdown
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    for (const r of reflections) {
      if (r.studentClass.trim()) {
        set.add(r.studentClass.trim().toUpperCase());
      }
    }
    return Array.from(set).sort();
  }, [reflections]);

  // Filtered & sorted reflections
  const filteredReflections = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const list = reflections.filter((item) => {
      if (
        searchQuery.trim() &&
        !item.studentName.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
        !item.message.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }

      if (classFilter !== 'ALL' && item.studentClass.trim().toUpperCase() !== classFilter) {
        return false;
      }

      if (feelingFilter !== 'ALL' && item.feeling !== feelingFilter) {
        return false;
      }

      if (dateFilter === 'TODAY' && item.createdAtTimestamp < startOfToday.getTime()) {
        return false;
      }
      if (dateFilter === '7DAYS' && item.createdAtTimestamp < now - 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (dateFilter === '30DAYS' && item.createdAtTimestamp < now - 30 * 24 * 60 * 60 * 1000) {
        return false;
      }

      return true;
    });

    list.sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAtTimestamp - a.createdAtTimestamp
        : a.createdAtTimestamp - b.createdAtTimestamp
    );

    return list;
  }, [reflections, searchQuery, classFilter, feelingFilter, dateFilter, sortOrder]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, classFilter, feelingFilter, dateFilter, sortOrder]);

  // 6 Summary KPIs across all reflections
  const kpiSummary = useMemo(() => {
    const totalReflections = reflections.length;
    const uniqueStudents = new Set(
      reflections.map(
        (r) => `${r.studentName.trim().toLowerCase()}__${r.studentClass.trim().toLowerCase()}`
      )
    ).size;
    const seruCount = reflections.filter((r) => r.feeling === 'seru').length;
    const bosanCount = reflections.filter((r) => r.feeling === 'bosan').length;
    const syncedCount = reflections.filter((r) => r.syncStatus === 'synced').length;
    const pendingOrFailedCount = reflections.filter((r) => r.syncStatus !== 'synced').length;

    return {
      totalReflections,
      uniqueStudents,
      seruCount,
      bosanCount,
      syncedCount,
      pendingOrFailedCount,
    };
  }, [reflections]);

  const totalPages = Math.max(1, Math.ceil(filteredReflections.length / PAGE_SIZE));
  const paginatedRows = filteredReflections.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleExportCsv = () => {
    const csvContent = buildReflectionsCsv(filteredReflections);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `REKAP_REFLEKSI_KOMPOSISI_BANGUN_DATAR_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleSheets = () => {
    const sheetUrl = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_URL as string | undefined;
    if (sheetUrl && sheetUrl.startsWith('https://')) {
      window.open(sheetUrl, '_blank', 'noopener,noreferrer');
    } else {
      setShowSheetsGuideModal(true);
    }
  };

  if (authChecking) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-700 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">Memeriksa sesi autentikasi Guru...</p>
      </main>
    );
  }

  if (!currentUser || !isAuthorized) {
    return <TeacherLoginView onBackToStudentApp={onBackToStudentApp} />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header Bar */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>DASHBOARD GURU ONLINE · CLOUD FIRESTORE &amp; GOOGLE SHEETS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rekap Refleksi Siswa — KOMPOSISI BANGUN DATAR
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Masuk sebagai: <strong className="text-white">{currentUser.email}</strong> · Menampilkan
            seluruh refleksi siswa lintas perangkat secara langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToStudentApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Aplikasi Siswa</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredReflections.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({filteredReflections.length})</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleSheets}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => signOutTeacher()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </section>

      {actionBanner && (
        <div
          role="status"
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
            actionBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <span>{actionBanner.text}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {dataError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold"
        >
          Gagal memuat data Firestore: {dataError}
        </div>
      )}

      {/* 6 Summary KPI Cards */}
      <section
        aria-label="Ringkasan Statistik Refleksi"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5"
      >
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Refleksi</span>
            <MessageSquareHeart className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono-tabular">
            {kpiSummary.totalReflections}
          </p>
          <p className="text-[11px] text-slate-500">Seluruh kiriman masuk</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Siswa</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono-tabular">
            {kpiSummary.uniqueStudents}
          </p>
          <p className="text-[11px] text-slate-500">Siswa unik pengirim</p>
        </div>

        <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Seru Banget!</span>
            <Smile className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-950 font-mono-tabular">
            {kpiSummary.seruCount}
          </p>
          <p className="text-[11px] text-amber-800">Respon positif antusias</p>
        </div>

        <div className="rounded-2xl bg-sky-50/70 border border-sky-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
            <span>Bosan!</span>
            <Meh className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-sky-950 font-mono-tabular">
            {kpiSummary.bosanCount}
          </p>
          <p className="text-[11px] text-sky-800">Perlu pendampingan</p>
        </div>

        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Sheets Berhasil</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 font-mono-tabular">
            {kpiSummary.syncedCount}
          </p>
          <p className="text-[11px] text-emerald-800">Status: synced</p>
        </div>

        <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-900">
            <span>Pending / Gagal</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-950 font-mono-tabular">
            {kpiSummary.pendingOrFailedCount}
          </p>
          <p className="text-[11px] text-rose-800">Dapat dikirim ulang</p>
        </div>
      </section>

      {/* Filters & Search Bar */}
      <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Student Name */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau isi pesan refleksi..."
              aria-label="Cari nama siswa"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filter by Class */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              aria-label="Filter berdasarkan kelas"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Expression */}
          <div>
            <select
              aria-label="Filter berdasarkan ekspresi perasaan"
              value={feelingFilter}
              onChange={(e) => setFeelingFilter(e.target.value as 'ALL' | 'seru' | 'bosan')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">Semua Ekspresi</option>
              <option value="seru">😊 Seru Banget!</option>
              <option value="bosan">😐 Bosan!</option>
            </select>
          </div>

          {/* Filter by Date Range & Sort */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              aria-label="Filter berdasarkan waktu"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as 'ALL' | 'TODAY' | '7DAYS' | '30DAYS')
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">Semua Tanggal</option>
              <option value="TODAY">Hari Ini</option>
              <option value="7DAYS">7 Hari Terakhir</option>
              <option value="30DAYS">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredReflections.length}</strong> dari{' '}
            <strong>{reflections.length}</strong> data refleksi.
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Urutan:</span>
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
            >
              {sortOrder === 'newest' ? 'Terbaru ke Terlama ↓' : 'Terlama ke Terbaru ↑'}
            </button>
          </div>
        </div>
      </section>

      {/* Reflections Table */}
      <section className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4">Waktu Kirim</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Ekspresi</th>
                <th className="py-3.5 px-4">Pesan Refleksi</th>
                <th className="py-3.5 px-4">Status Sheets</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {loadingData ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                    Memuat data refleksi dari Cloud Firestore...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700">Belum ada data refleksi yang cocok.</p>
                    <p className="text-xs">
                      Saat siswa mengirim refleksi dari halaman Refleksi, data akan langsung muncul
                      di tabel ini secara otomatis.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono-tabular text-xs text-slate-600">
                      {(() => {
                        try {
                          return new Date(row.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch {
                          return row.createdAt;
                        }
                      })()}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{row.studentName}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold">
                        {row.studentClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.feeling === 'seru' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold">
                          <span>😊</span>
                          <span>Seru Banget!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-300 text-sky-950 text-xs font-extrabold">
                          <span>😐</span>
                          <span>Bosan!</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-slate-700" title={row.message}>
                        {row.message || <span className="italic text-slate-400">Tanpa pesan</span>}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.syncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersinkron</span>
                        </span>
                      ) : row.syncStatus === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Gagal</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Tertunda</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDetail(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>

                      {row.syncStatus !== 'synced' && (
                        <button
                          type="button"
                          disabled={retryingId === row.id}
                          onClick={() => handleRetrySync(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold cursor-pointer"
                        >
                          <RotateCcw
                            className={`w-3.5 h-3.5 ${retryingId === row.id ? 'animate-spin' : ''}`}
                          />
                          <span>Kirim Ulang</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredReflections.length > PAGE_SIZE && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedDetail && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                  Detail Refleksi Siswa
                </p>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedDetail.studentName} ({selectedDetail.studentClass})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Waktu Kirim:</span>
                  <strong className="text-slate-900">{selectedDetail.createdAt}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Ekspresi Perasaan:</span>
                  <strong className="text-slate-900">
                    {selectedDetail.feeling === 'seru' ? '😊 Seru Banget!' : '😐 Bosan!'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Google Sheets:</span>
                  <strong className="text-slate-900 uppercase">{selectedDetail.syncStatus}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">ID Dokumen:</span>
                  <strong className="text-slate-900 font-mono break-all">
                    {selectedDetail.id}
                  </strong>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Pesan Lengkap Siswa:</p>
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-slate-900 font-medium leading-relaxed">
                  {selectedDetail.message || 'Siswa tidak menuliskan pesan tambahan.'}
                </div>
              </div>

              {selectedDetail.lastSyncError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Catatan Sinkronisasi Sheets:</strong> {selectedDetail.lastSyncError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {selectedDetail.syncStatus !== 'synced' && (
                <button
                  type="button"
                  disabled={retryingId === selectedDetail.id}
                  onClick={() => handleRetrySync(selectedDetail)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Kirim Ulang ke Google Sheets</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Setup Guide Modal when VITE_GOOGLE_SHEETS_SPREADSHEET_URL is not yet set */}
      {showSheetsGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowSheetsGuideModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                  Integrasi Google Sheets
                </p>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Tautan Spreadsheet &amp; Apps Script
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetsGuideModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Seluruh data refleksi siswa sudah <strong>tersimpan otomatis</strong> di Cloud
                Firestore dan dapat langsung diunduh ke Excel/Google Sheets melalui tombol{' '}
                <strong>Export CSV</strong>.
              </p>
              <p>
                Untuk mengaktifkan sinkronisasi otomatis ke Google Sheets &amp; tombol pintas
                langsung:
              </p>
              <ol className="list-decimal list-inside space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <li>
                  Ikuti panduan pada berkas <code>docs/SETUP-GOOGLE-SHEETS.md</code>.
                </li>
                <li>
                  Pasang kode Google Apps Script Web App pada spreadsheet Anda, lalu salin URL{' '}
                  <code>/exec</code> ke environment variable{' '}
                  <code>GOOGLE_SHEETS_WEBHOOK_URL</code> di Netlify.
                </li>
                <li>
                  Isi <code>VITE_GOOGLE_SHEETS_SPREADSHEET_URL</code> dengan alamat Google
                  Spreadsheet Anda agar tombol ini langsung membuka tab spreadsheet.
                </li>
              </ol>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSheetsGuideModal(false);
                  handleExportCsv();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh CSV Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSheetsGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
