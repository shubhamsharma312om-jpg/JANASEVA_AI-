import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Flame,
  Lightbulb,
  Search,
  ShieldAlert,
  Trash2,
  Waves,
  Wrench,
} from 'lucide-react';
import { CharminarHeroIllustration } from '../../components/common/CharminarHeroIllustration';
import { useApp } from '../../context/AppContext';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

const CATEGORY_CARDS = [
  {
    category: 'Water Supply',
    department: 'Water Supply Department',
    sla: '24h SLA',
    description:
      'Pipeline leakage, water contamination, low pressure, and supply disruptions.',
    icon: Droplets,
  },
  {
    category: 'Roads and Potholes',
    department: 'Municipal Engineering',
    sla: '72h SLA',
    description:
      'Potholes, damaged road surfaces, broken footpaths, and road resurfacing.',
    icon: Wrench,
  },
  {
    category: 'Garbage Collection',
    department: 'Sanitation Department',
    sla: '24h SLA',
    description:
      'Uncollected household waste, overflowing community bins, and street sweeping.',
    icon: Trash2,
  },
  {
    category: 'Electricity',
    department: 'Electricity Department',
    sla: '12h SLA',
    description:
      'Power outages, transformer faults, voltage fluctuations, and line hazards.',
    icon: Flame,
  },
  {
    category: 'Streetlights',
    department: 'Electrical Maintenance',
    sla: '48h SLA',
    description:
      'Non-functional street lamps, damaged light poles, and timer malfunctions.',
    icon: Lightbulb,
  },
  {
    category: 'Drainage',
    department: 'Drainage Department',
    sla: '24h SLA',
    description:
      'Blocked stormwater drains, sewage overflow, open manholes, and waterlogging.',
    icon: Waves,
  },
  {
    category: 'Public Safety',
    department: 'Relevant Civic Authority',
    sla: '6h SLA',
    description:
      'Fallen trees, unsafe civic structures, and urgent neighborhood safety concerns.',
    icon: ShieldAlert,
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { grievances, departments } = useApp();

  const resolvedCount = grievances.filter(
    (g) => g.status === 'RESOLVED' || g.status === 'CLOSED'
  ).length;

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="border-b border-sky-200/70">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium text-[#63718A]">
              <span className="text-[#102A56] font-semibold">
                Hyderabad Municipal Pilot
              </span>
              <span className="mx-2">·</span>
              <span>Multilingual Citizen Redressal</span>
              <span className="mx-2">·</span>
              <span>English · తెలుగు · हिन्दी</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#102A56] leading-tight">
              Every Voice Matters. Every Grievance Counts.
            </h1>

            <p className="text-base text-[#63718A] max-w-2xl leading-relaxed">
              JANASEVA AI empowers citizens across Hyderabad to report civic
              issues in English, Telugu, or Hindi, route complaints directly to
              the responsible municipal department, and track resolution progress
              with full audit transparency.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/citizen/register')}
                className="jana-btn-accent px-6 py-3 text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Report a Grievance</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/track')}
                className="jana-btn-secondary px-6 py-3 text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4 text-[#48A9E8]" />
                <span>Track Your Complaint</span>
              </button>
            </div>

            {/* Key Platform Metrics Strip */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-sky-200/70 max-w-lg">
              <div>
                <div className="text-2xl font-bold text-[#102A56] font-mono tabular-nums">
                  {departments.length || 7}
                </div>
                <div className="text-xs text-[#63718A] mt-0.5">
                  Civic Departments
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1D4ED8] font-mono tabular-nums">
                  3
                </div>
                <div className="text-xs text-[#63718A] mt-0.5">
                  Supported Languages
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                  {grievances.length} ({resolvedCount} Resolved)
                </div>
                <div className="text-xs text-[#63718A] mt-0.5">
                  Active Demo Tickets
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <CharminarHeroIllustration />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#102A56]">
            How JANASEVA AI Works
          </h2>
          <p className="text-sm text-[#63718A] mt-1">
            A streamlined 4-step workflow from citizen grievance submission to
            verified resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01. Submit in Your Language',
              desc: 'Describe the civic issue in English, Telugu (తెలుగు), or Hindi (हिन्दी) along with locality and landmark details.',
            },
            {
              step: '02. Department Mapping',
              desc: 'Your complaint is mapped to the responsible Hyderabad municipal department based on our 7 civic categories.',
            },
            {
              step: '03. Instant Ticket ID',
              desc: 'Receive a unique tracking ID (e.g., JANA-HYD-2026-1042) immediately—even if you submit without sharing personal details.',
            },
            {
              step: '04. Track Resolution Live',
              desc: 'Monitor every status transition (Submitted → Assigned → In Progress → Resolved) and read official field remarks.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="jana-card jana-card-interactive p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-semibold text-[#102A56] mb-2">
                  {item.step}
                </h3>
                <p className="text-xs text-[#63718A] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED LANGUAGES SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="jana-card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#102A56]">
              Supported Languages
            </h2>
            <p className="text-sm text-[#63718A] mt-1">
              Built for inclusive citizen access across English, Telugu, and Hindi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7]/90 p-5">
              <div className="text-xs font-mono text-[#63718A] mb-1">
                ISO Code: en · English
              </div>
              <h3 className="text-lg font-bold text-[#102A56] mb-2">English</h3>
              <p className="text-xs text-[#63718A] italic">
                &ldquo;Deep potholes along Madhapur Main Road near Metro Pillar
                1728 causing severe traffic congestion.&rdquo;
              </p>
            </div>

            <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7]/90 p-5">
              <div className="text-xs font-mono text-[#63718A] mb-1">
                ISO Code: te · Telugu
              </div>
              <h3 className="text-lg font-bold text-[#102A56] mb-2">
                తెలుగు (Telugu)
              </h3>
              <p className="text-xs text-[#63718A]">
                &ldquo;మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు, వెంటనే
                పరిష్కరించగలరు.&rdquo;
              </p>
            </div>

            <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7]/90 p-5">
              <div className="text-xs font-mono text-[#63718A] mb-1">
                ISO Code: hi · Hindi
              </div>
              <h3 className="text-lg font-bold text-[#102A56] mb-2">
                हिन्दी (Hindi)
              </h3>
              <p className="text-xs text-[#63718A]">
                &ldquo;चारमीनार लाड बाज़ार के पास पिछले चार दिनों से स्ट्रीट
                लाइटें काम नहीं कर रही हैं।&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEVEN GRIEVANCE CATEGORIES SECTION WITH UPLOADED DEPARTMENT THUMBNAILS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#102A56]">
              Seven Civic Grievance Categories &amp; Departments
            </h2>
            <p className="text-sm text-[#63718A] mt-1">
              Direct department routing across Hyderabad&apos;s 7 civic infrastructure wings.
            </p>
          </div>
          <Link
            to="/citizen/register"
            className="text-xs font-semibold text-[#1D4ED8] hover:underline whitespace-nowrap"
          >
            Register a Complaint in Any Category →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_CARDS.map((item) => {
            const Icon = item.icon;
            const visualAsset = getVisualAssetForDepartmentOrCategory(
              item.category
            );
            return (
              <div
                key={item.category}
                className="jana-card jana-card-interactive overflow-hidden flex flex-col justify-between group"
              >
                {/* 16:9 Uploaded Department Banner Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-sky-200/70">
                  <img
                    src={visualAsset.bannerImage}
                    alt={`${item.department} — ${item.category}`}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#63718A] mb-2.5">
                      <span className="font-semibold text-[#1D4ED8]">
                        {item.department}
                      </span>
                      <span className="font-mono tabular-nums text-[#63718A]">
                        {item.sla}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <Icon className="w-5 h-5 text-[#102A56] shrink-0" />
                      <h3 className="text-base font-bold text-[#102A56]">
                        {item.category}
                      </h3>
                    </div>
                    <p className="text-xs text-[#63718A] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-100 flex items-center justify-between">
                    <span className="text-[11px] text-[#63718A] italic truncate max-w-[160px]">
                      {visualAsset.motto}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/citizen/register?category=${encodeURIComponent(
                            item.category
                          )}`
                        )
                      }
                      className="text-xs font-semibold text-[#102A56] hover:text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Report Issue →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE JANASEVA AI SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#102A56] text-white rounded-2xl border border-sky-300/40 shadow-lg p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Why Choose JANASEVA AI
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Designed with Privacy-by-Design and transparent status auditing so
              every citizen can hold civic bodies accountable without barriers.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Privacy-First: Submit and track grievances without mandatory
                  personal identity disclosure.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Complete Audit Trail: Every department assignment and status
                  change is timestamped in SQLite.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Dedicated Citizen &amp; Municipal Admin Portals: Separate
                  role-based dashboards for citizens and civic officers.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="jana-btn-accent px-5 py-3 text-xs font-semibold rounded-xl text-center cursor-pointer"
            >
              Try Citizen or Admin Demo Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/track')}
              className="px-5 py-3 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700 border border-sky-400/30 rounded-xl transition-colors text-center cursor-pointer"
            >
              Track Existing Ticket (e.g. JANA-HYD-2026-1042)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
