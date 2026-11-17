import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface TeacherGuideBannerProps {
  title?: string;
  scenarios: string[];
  mayerPrinciple?: string;
  defaultOpen?: boolean;
}

/**
 * Supports Two-Way Teacher-Student Communication (Komunikasi Dua Arah Guru-Siswa)
 * and explicitly surfaces Richard E. Mayer's Multimedia Principle applied on the current view.
 */
export const TeacherGuideBanner: React.FC<TeacherGuideBannerProps> = ({
  title = 'Skenario Interaksi Dua Arah (Guru & Siswa — Sesuai LKM)',
  scenarios,
  mayerPrinciple,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-blue-50/80 border border-blue-200 overflow-hidden no-print">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-blue-950 hover:bg-blue-100/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-blue-700 shrink-0" />
          <span className="text-sm font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 shrink-0">
          <span>{isOpen ? 'Sembunyikan Panduan Guru' : 'Buka Panduan Guru'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-blue-200/70 space-y-3 text-sm text-slate-700">
          <ol className="list-decimal list-inside space-y-1.5">
            {scenarios.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>

          {mayerPrinciple && (
            <div className="flex items-start gap-2 pt-2 border-t border-blue-200/60 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Prinsip Multimedia Mayer:</strong> {mayerPrinciple}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
