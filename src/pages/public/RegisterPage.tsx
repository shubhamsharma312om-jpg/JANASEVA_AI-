import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageCode } from '../../types/janaseva';

export const RegisterPage: React.FC = () => {
  const { registerCitizenAccount } = useApp();
  const { t, setUiLanguage } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] =
    useState<LanguageCode>('en');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(t('validation.fullNameRequired'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(t('validation.invalidEmail'));
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError(t('validation.invalidMobile'));
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions to create an account.');
      return;
    }

    registerCitizenAccount({
      name: fullName,
      email,
      mobile,
      preferred_language: preferredLanguage,
    });
    setUiLanguage(preferredLanguage);
    navigate('/citizen/dashboard');
  };

  return (
    <div className="max-w-xl w-full mx-auto px-6 py-12">
      <div className="jana-card p-8">
        <h1 className="text-2xl font-bold text-[#102A56]">
          {t('register.title')}
        </h1>
        <p className="text-xs text-[#63718A] mt-1 mb-6">
          {t('register.subtitle')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
              {t('register.fullName')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Arjun Reddy"
              className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                {t('register.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                {t('register.mobile')}
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98480 22334"
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
              {t('register.preferredLanguage')}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                {t('register.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A56] mb-1.5">
                {t('register.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-[#63718A] pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-sky-300"
            />
            <span>
              I agree to the JANASEVA AI Privacy-by-Design Civic Charter and
              Terms of Service.
            </span>
          </label>

          <button
            type="submit"
            className="jana-btn-accent w-full py-2.5 px-4 text-sm font-semibold rounded-xl cursor-pointer"
          >
            {t('register.createBtn')}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-sky-200/70 text-xs text-[#63718A] text-center">
          {t('register.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="text-[#1D4ED8] font-semibold hover:underline"
          >
            {t('register.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};
