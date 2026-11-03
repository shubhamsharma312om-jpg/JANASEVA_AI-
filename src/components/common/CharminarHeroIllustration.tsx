import React from 'react';
import { Building2, CheckCircle2, Globe2, ShieldCheck } from 'lucide-react';
import { DASHBOARD_BG_IMAGE } from '../../utils/departmentAssets';

export const CharminarHeroIllustration: React.FC = () => {
  return (
    <div className="jana-card relative w-full h-full min-h-[360px] overflow-hidden flex flex-col justify-between p-5 text-[#102A56] select-none">
      {/* Top Multilingual Civic Header Strip */}
      <div className="relative z-10 flex items-center justify-between text-xs border-b border-sky-200/70 pb-3">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#EA580C]" />
          <span className="font-semibold text-[#102A56]">
            Hyderabad Civic Redressal Grid
          </span>
        </div>
        <span className="font-mono text-[#63718A] font-medium">
          English · తెలుగు · हिन्दी
        </span>
      </div>

      {/* Main Uploaded Dashboard & Charminar Artwork Container with Soft Mist Frame */}
      <div className="relative z-10 my-3 rounded-xl overflow-hidden aspect-video border border-sky-200/80 bg-[#FFFCF7] shadow-sm">
        <img
          src={DASHBOARD_BG_IMAGE}
          alt="JANASEVA AI Hyderabad Charminar Civic Grievance Illustration"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft bottom mist gradient blending into the card */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
          style={{
            background:
              'linear-gradient(to top, rgba(255, 252, 247, 0.9) 0%, rgba(255, 252, 247, 0) 100%)',
          }}
        />
      </div>

      {/* Bottom Civic Trust Bar */}
      <div className="relative z-10 grid grid-cols-3 gap-3 pt-2 border-t border-sky-200/70 text-xs">
        <div>
          <div className="text-[#63718A]">Departments</div>
          <div className="font-semibold text-[#102A56] font-mono tabular-nums flex items-center gap-1 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-[#48A9E8]" />
            <span>7 Civic Units</span>
          </div>
        </div>
        <div>
          <div className="text-[#63718A]">Languages</div>
          <div className="font-semibold text-[#102A56] font-mono tabular-nums flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>EN · TE · HI</span>
          </div>
        </div>
        <div>
          <div className="text-[#63718A]">Tracking</div>
          <div className="font-semibold text-[#102A56] font-mono tabular-nums flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>24/7 Live Audit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
