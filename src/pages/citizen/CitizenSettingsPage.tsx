import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageCode } from '../../types/janaseva';

export const CitizenSettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useApp();
  const { t, uiLanguage, setUiLanguage } = useLanguage();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<LanguageCode>(
    uiLanguage || user?.preferred_language || 'en'
  );
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [anonymousDefault, setAnonymousDefault] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ preferred_language: language });
    setUiLanguage(language);
    setMessage('Language and notification preferences updated.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 6) {
      setMessage(
        'Please enter your current password and a new password of at least 6 characters.'
      );
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setMessage('Demo account password updated successfully.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Language & Notification Preferences */}
      <section className="jana-card p-6 sm:p-8">
        <h1 className="text-xl font-bold text-[#102A56]">
          {t('nav.settings')}
        </h1>
        <p className="text-xs text-[#63718A] mt-1 mb-6">
          Configure how JANASEVA AI displays the interface and communicates
          ticket updates with you.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#102A56] mb-1.5">
              {t('common.uiLanguage')}
            </label>
            <select
              value={language}
              onChange={(e) => {
                const nextLang = e.target.value as LanguageCode;
                setLanguage(nextLang);
                setUiLanguage(nextLang);
              }}
              className="w-full sm:w-72 px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
            >
              <option value="en">English (en)</option>
              <option value="te">Telugu — తెలుగు (te)</option>
              <option value="hi">Hindi — हिन्दी (hi)</option>
            </select>
          </div>

          <div className="space-y-2.5 pt-2">
            <label className="flex items-center gap-2.5 text-[#102A56] cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded border-sky-300"
              />
              <span>Receive SMS alerts when my complaint status changes</span>
            </label>

            <label className="flex items-center gap-2.5 text-[#102A56] cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-sky-300"
              />
              <span>Receive email digests with field engineer remarks</span>
            </label>

            <label className="flex items-center gap-2.5 text-[#102A56] cursor-pointer">
              <input
                type="checkbox"
                checked={anonymousDefault}
                onChange={(e) => setAnonymousDefault(e.target.checked)}
                className="rounded border-sky-300"
              />
              <span>
                Hide my name on public status boards (Privacy-by-Design)
              </span>
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="jana-btn-primary px-5 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </section>

      {/* Password Change Interface */}
      <section className="jana-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-[#102A56]">
          Change Account Password
        </h2>
        <p className="text-xs text-[#63718A] mt-1 mb-4">
          Update the password for your citizen portal login.
        </p>

        <form
          onSubmit={handlePasswordChange}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="jana-btn-secondary px-5 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </section>

      {/* Session Logout */}
      <section className="jana-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#102A56]">
            {t('common.logout')}
          </h2>
          <p className="text-xs text-[#63718A] mt-0.5">
            Safely end your active citizen session on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('common.logout')}</span>
        </button>
      </section>
    </div>
  );
};
