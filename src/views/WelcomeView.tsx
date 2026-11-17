import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Info, Sparkles } from 'lucide-react';
import { TeacherCharacterSvg } from '../components/illustrations/GeometryVisuals';
import { TeacherGuideBanner } from '../components/TeacherGuideBanner';
import { soundFX } from '../utils/soundEffects';

interface WelcomeViewProps {
  onStartLearning: () => void;
  onOpenInfo: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

/**
 * Implements LKM Slide 1 (Pembuka):
 * - Judul "KOMPOSISI BANGUN DATAR"
 * - 6 Bangun datar tersebar mengelilingi judul sebagai pengantar visual (dan dapat diklik siswa untuk menyebutkan namanya!)
 * - Karakter guru sebagai pemandu
 * - Tombol MULAI BELAJAR (ikon putar), tombol informasi, dan kontrol audio di kanan atas.
 */
export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onStartLearning,
  onOpenInfo,
  audioEnabled,
  onToggleAudio,
}) => {
  const [selectedPreviewShape, setSelectedPreviewShape] = useState<{
    name: string;
    hint: string;
  } | null>(null);

  const surroundingShapes = [
    {
      id: 'segitiga',
      name: 'Segitiga',
      hint: 'Punya 3 sisi dan 3 titik sudut (Contoh: Atap rumah)',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80">
          <polygon points="40,12 70,66 10,66" fill="#DBEAFE" stroke="#1E3A8A" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'persegi',
      name: 'Persegi',
      hint: 'Punya 4 sisi sama panjang dan 4 titik sudut (Contoh: Ubin lantai)',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80">
          <rect x="16" y="16" width="48" height="48" fill="#FEF3C7" stroke="#D97706" strokeWidth="4" rx="3" />
        </svg>
      ),
    },
    {
      id: 'trapesium',
      name: 'Trapesium',
      hint: 'Punya 1 pasang sisi sejajar (Contoh: Atap rumah Joglo)',
      svg: (
        <svg width="72" height="64" viewBox="0 0 90 80">
          <polygon points="26,18 64,18 80,64 10,64" fill="#DCFCE7" stroke="#15803D" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'jajar_genjang',
      name: 'Jajar Genjang',
      hint: 'Punya 2 pasang sisi miring yang sejajar (Contoh: Kue wajik)',
      svg: (
        <svg width="72" height="64" viewBox="0 0 90 80">
          <polygon points="26,18 80,18 64,62 10,62" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'belah_ketupat',
      name: 'Belah Ketupat',
      hint: 'Keempat sisinya sama panjang dengan posisi miring (Contoh: Ketupat)',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80">
          <polygon points="40,10 70,40 40,70 10,40" fill="#FFE4E6" stroke="#E11D48" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'persegi_panjang',
      name: 'Persegi Panjang',
      hint: 'Sisi yang berhadapan sama panjang (Contoh: Papan tulis)',
      svg: (
        <svg width="76" height="64" viewBox="0 0 96 80">
          <rect x="12" y="20" width="72" height="42" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" rx="3" />
        </svg>
      ),
    },
  ];

  const handleShapeClick = (shape: { name: string; hint: string }) => {
    soundFX.playClick(audioEnabled);
    setSelectedPreviewShape(shape);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar controls matching LKM Slide 1 */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick(audioEnabled);
            onOpenInfo();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4 text-blue-700" />
          <span>Informasi Aplikasi</span>
        </button>

        <button
          type="button"
          onClick={onToggleAudio}
          aria-label={audioEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border shadow-xs transition-colors cursor-pointer ${
            audioEnabled
              ? 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioEnabled ? 'Audio: Aktif' : 'Audio: Mati'}</span>
        </button>
      </div>

      {/* Main Stage (LKM Slide 1 layout: shapes surrounding title + Play button) */}
      <main className="max-w-5xl w-full mx-auto my-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center Stage: Surrounding shapes + Main Title + Play CTA */}
          <div className="lg:col-span-8 space-y-6 text-center">
            {/* Top row of interactive shapes */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {surroundingShapes.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleShapeClick(item)}
                  className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="animate-float-slow group-hover:scale-105 transition-transform">
                    {item.svg}
                  </div>
                  <span className="mt-1 text-xs font-bold text-slate-700 group-hover:text-blue-800">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Central Title Lockup */}
            <div className="py-2 space-y-2">
              <p className="text-xs sm:text-sm font-bold text-blue-700 tracking-wide">
                Matematika Kelas 4 SD · Fase B
              </p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                KOMPOSISI BANGUN DATAR
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                Mengenal Komposisi Bangun Datar melalui benda-benda di sekitar kita.
              </p>
            </div>

            {/* Interactive Shape Inspection Feedback (supports LKM Slide 1 Teacher-Student Q&A) */}
            {selectedPreviewShape ? (
              <div className="max-w-md mx-auto px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-medium">
                <strong>{selectedPreviewShape.name}:</strong> {selectedPreviewShape.hint}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Klik salah satu bangun datar di sekeliling judul untuk mengenali namanya!
              </p>
            )}

            {/* Primary Start CTA Button (LKM Slide 1 Play Icon + MULAI BELAJAR) */}
            <div className="pt-2">
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  soundFX.playClick(audioEnabled);
                  onStartLearning();
                }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-extrabold text-lg shadow-md transition-all cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </span>
                <span>MULAI BELAJAR</span>
              </button>
            </div>

            {/* Bottom row of interactive shapes */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
              {surroundingShapes.slice(3, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleShapeClick(item)}
                  className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="animate-float-slow group-hover:scale-105 transition-transform">
                    {item.svg}
                  </div>
                  <span className="mt-1 text-xs font-bold text-slate-700 group-hover:text-blue-800">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Teacher Guide Character & Greeting */}
          <div className="lg:col-span-4 flex flex-col items-center text-center bg-blue-50/70 rounded-2xl p-6 border border-blue-100 space-y-4">
            <TeacherCharacterSvg pose="teaching" size={135} />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ibu Guru Pemandu</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                &ldquo;Halo anak-anak hebat kelas 4! Coba lihat di layar, ada bangun datar apa saja yang kalian kenali? Yuk, sebutkan namanya lalu tekan tombol <strong>Mulai Belajar</strong>!&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Two-Way Teacher-Student Scenario from LKM Slide 1 */}
        <div className="mt-8">
          <TeacherGuideBanner
            title="Skenario Komunikasi Dua Arah Guru-Siswa (Slide 1 Pembuka)"
            scenarios={[
              'Guru di depan kelas menyapa siswa dan mengajak mereka memperhatikan layar.',
              'Guru bertanya: "Anak-anak, coba lihat, ada bangun apa saja yang ada di layar?" Siswa menjawab secara bergantian sambil menyebutkan nama bangun yang mereka kenali (seperti segitiga atau persegi).',
              'Dari jawaban tersebut guru mengetahui pengetahuan awal siswa tentang bangun datar. Guru meminta salah satu siswa maju menekan tombol "MULAI BELAJAR" untuk masuk ke menu utama.',
            ]}
            mayerPrinciple="Prinsip Koherensi (Coherence Principle): Tampilan pembuka hanya menampilkan judul, tombol Mulai, dan 6 bangun datar pengantar tanpa elemen dekoratif yang memecah perhatian."
          />
        </div>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 py-2">
        Bangun Datar Adventure · Multimedia Interaktif Berbasis Prinsip Richard E. Mayer
      </footer>
    </div>
  );
};
