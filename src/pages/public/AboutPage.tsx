import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Globe2, ShieldCheck, Users } from 'lucide-react';
import { DEPARTMENT_VISUAL_ASSETS } from '../../utils/departmentAssets';

export const AboutPage: React.FC = () => {
  const departmentsList = Object.values(DEPARTMENT_VISUAL_ASSETS);

  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-10">
      {/* Header / Vision */}
      <section className="jana-card p-8">
        <div className="text-xs text-[#63718A] mb-2">
          <span>Neural Storm 2026</span>
          <span className="mx-2">·</span>
          <span>Track HI-02: Human Impact</span>
          <span className="mx-2">·</span>
          <span>Hyderabad Civic Pilot</span>
        </div>
        <h1 className="text-3xl font-bold text-[#102A56] mb-3">
          About JANASEVA AI
        </h1>
        <p className="text-base text-[#102A56] font-medium mb-4">
          Every Voice Matters. Every Grievance Counts.
        </p>
        <p className="text-sm text-[#63718A] leading-relaxed">
          JANASEVA AI is a citizen-centric multilingual grievance management
          platform created to eliminate language and bureaucratic barriers
          between Indian citizens and municipal authorities. Starting with our
          pilot demonstration in Hyderabad, the platform supports seamless
          grievance submission and tracking in English, Telugu (తెలుగు), and
          Hindi (हिन्दी).
        </p>
      </section>

      {/* Mission & Problem We Are Solving */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="jana-card jana-card-interactive p-6 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#102A56]">
            <Globe2 className="w-5 h-5 text-[#1D4ED8]" />
            <h2>Mission &amp; Vision</h2>
          </div>
          <p className="text-xs text-[#63718A] leading-relaxed">
            Our mission is to ensure that every resident—regardless of the
            regional language they speak or their familiarity with municipal
            departmental hierarchies—can report civic issues in seconds and
            receive verifiable resolution updates.
          </p>
        </section>

        <section className="jana-card jana-card-interactive p-6 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#102A56]">
            <Building2 className="w-5 h-5 text-[#EA580C]" />
            <h2>The Problem We Are Solving</h2>
          </div>
          <p className="text-xs text-[#63718A] leading-relaxed">
            Traditional grievance portals often require citizens to fill out
            English-only forms, manually guess which municipal engineering wing
            handles their issue, and disclose excessive personal data—resulting
            in misrouted tickets and unresolved neighborhood hazards.
          </p>
        </section>
      </div>

      {/* Citizen Empowerment & Transparency */}
      <section className="jana-card p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#102A56]">
          Core Pillars of JANASEVA AI
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#102A56]">
              <Users className="w-4 h-4 text-[#1D4ED8]" />
              <span>Citizen Empowerment</span>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              Citizens can lodge complaints in English, Telugu, or Hindi and
              monitor every stage of action using a simple Ticket ID.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#102A56]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy by Design</span>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              We never mandate unnecessary personal data. Citizens can report
              public hazards anonymously or opt in with contact information.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#102A56]">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
              <span>Audit Transparency</span>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              Every status transition and officer remark is permanently logged in
              the `grievance_history` table for public accountability.
            </p>
          </div>
        </div>

        {/* Hyderabad Pilot Departments Visual Showcase */}
        <div className="pt-4 border-t border-sky-200/70">
          <h3 className="text-sm font-bold text-[#102A56] mb-3">
            Connected Hyderabad Civic Departments
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {departmentsList.map((dept) => (
              <div
                key={dept.departmentId}
                className="rounded-xl overflow-hidden border border-sky-200/80 bg-[#FFFCF7]"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={dept.bannerImage}
                    alt={dept.departmentName}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-semibold text-[#102A56] truncate">
                    {dept.departmentName}
                  </div>
                  <div className="text-[11px] text-[#63718A] truncate">
                    {dept.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-sky-200/70 flex flex-wrap gap-3">
          <Link
            to="/citizen/register"
            className="jana-btn-primary px-5 py-2.5 text-xs font-semibold rounded-xl"
          >
            Register a Complaint
          </Link>
          <Link
            to="/track"
            className="jana-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl"
          >
            Track Existing Ticket
          </Link>
        </div>
      </section>
    </div>
  );
};
