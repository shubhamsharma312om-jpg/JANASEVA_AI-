import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageCode } from '../../types/janaseva';

export const AdminSettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useApp();
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState(
    user?.name || 'Dr. Vikramaditya Rao, IAS (Demo)'
  );
  const [adminEmail, setAdminEmail] = useState(
    user?.email || 'admin@janaseva.demo'
  );
  const [pilotCity, setPilotCity] = useState('Hyderabad');
  const [defaultLang, setDefaultLang] = useState<LanguageCode>('en');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [autoEscalationAlerts, setAutoEscalationAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: adminName.trim(),
      email: adminEmail.trim(),
      preferred_language: defaultLang,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Administrator and platform settings saved successfully.</span>
        </div>
      )}

      <section className="jana-card p-6 sm:p-8">
        <h1 className="text-xl font-bold text-[#102A56]">
          Administrator &amp; Platform Settings
        </h1>
        <p className="text-xs text-[#63718A] mt-1 mb-6">
          Configure municipal command profile, default language, and
          privacy-by-design platform rules.
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Administrator Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Pilot Demonstration City
              </label>
              <input
                type="text"
                value={pilotCity}
                onChange={(e) => setPilotCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Default Platform Language
              </label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value as LanguageCode)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              >
                <option value="en">English (en)</option>
                <option value="te">Telugu — తెలుగు (te)</option>
                <option value="hi">Hindi — हिन्दी (hi)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <label className="flex items-center gap-2.5 text-[#102A56] cursor-pointer">
              <input
                type="checkbox"
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
                className="rounded border-sky-300"
              />
              <span>
                Allow anonymous citizen complaint submissions without mandatory
                PII (Privacy-by-Design)
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-[#102A56] cursor-pointer">
              <input
                type="checkbox"
                checked={autoEscalationAlerts}
                onChange={(e) => setAutoEscalationAlerts(e.target.checked)}
                className="rounded border-sky-300"
              />
              <span>
                Flag unresolved CRITICAL and HIGH priority complaints after 48
                hours
              </span>
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="jana-btn-primary px-6 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Save Platform Settings
            </button>
          </div>
        </form>
      </section>

      <section className="jana-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#102A56]">
            End Administrator Session
          </h2>
          <p className="text-xs text-[#63718A] mt-0.5">
            Sign out of the Municipal Command Center and return to the login
            screen.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </section>
    </div>
  );
};
