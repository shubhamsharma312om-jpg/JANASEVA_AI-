import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageCode } from '../../types/janaseva';

export const CitizenProfilePage: React.FC = () => {
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || 'Arjun Reddy');
  const [email, setEmail] = useState(user?.email || 'citizen@janaseva.demo');
  const [mobile, setMobile] = useState(user?.mobile || '+91 98480 22334');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    user?.preferred_language || 'te'
  );
  const [address, setAddress] = useState(
    user?.address ||
      'Plot 42, Kukatpally Housing Board Phase 3, Hyderabad - 500072'
  );
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      preferred_language: preferredLanguage,
      address: address.trim(),
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <section className="jana-card p-6 sm:p-8">
        <div className="pb-5 border-b border-sky-200/70 mb-6">
          <h1 className="text-xl font-bold text-[#102A56]">Citizen Profile</h1>
          <p className="text-xs text-[#63718A] mt-1">
            Manage your optional contact details and preferred regional language
            for grievance updates.
          </p>
        </div>

        {savedBanner && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile changes saved and persisted across your session.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Citizen ID (System Assigned)
              </label>
              <input
                type="text"
                disabled
                value={user?.id || 'CIT-2026-DEMO01'}
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-100/80 border border-sky-200/70 rounded-xl text-[#63718A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) =>
                  setPreferredLanguage(e.target.value as LanguageCode)
                }
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="en">English (en)</option>
                <option value="te">Telugu — తెలుగు (te)</option>
                <option value="hi">Hindi — हिन्दी (hi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
              Residential Address / Ward
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="jana-btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
