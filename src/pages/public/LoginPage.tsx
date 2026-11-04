import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const LoginPage: React.FC = () => {
  const { loginAsDemo, loginWithCredentials } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('citizen@janaseva.demo');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError('Please enter your email address or mobile number.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('Please enter a valid password (minimum 4 characters).');
      return;
    }
    const loggedIn = loginWithCredentials(identifier, password);
    if (loggedIn.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/citizen/dashboard');
    }
  };

  const handleQuickDemo = (role: 'citizen' | 'admin') => {
    const user = loginAsDemo(role);
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/citizen/dashboard');
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left Column: Login Form */}
      <div className="md:col-span-7 jana-card p-8">
        <h1 className="text-2xl font-bold text-[#102A56]">
          {t('login.title')}
        </h1>
        <p className="text-xs text-[#63718A] mt-1 mb-6">
          {t('login.subtitle')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {forgotNotice && (
          <div className="mb-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#102A56]">
            Demo Environment Notice: Use either of the Demo Login credentials on
            the right, or enter any password with 4+ characters.
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-identifier"
              className="block text-xs font-semibold text-[#102A56] mb-1.5"
            >
              {t('login.emailOrMobile')}
            </label>
            <input
              id="login-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="citizen@janaseva.demo or +91 98480 22334"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-[#102A56] mb-1.5"
            >
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.password')}
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#63718A] hover:text-[#102A56] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-[#63718A] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-sky-300"
              />
              <span>{t('login.rememberMe')}</span>
            </label>

            <button
              type="button"
              onClick={() => setForgotNotice(true)}
              className="text-[#1D4ED8] hover:underline font-medium cursor-pointer"
            >
              {t('login.forgotPassword')}
            </button>
          </div>

          <button
            type="submit"
            className="jana-btn-primary w-full py-2.5 px-4 text-sm font-semibold rounded-xl cursor-pointer"
          >
            {t('login.signInBtn')}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-sky-200/70 text-xs text-[#63718A] text-center">
          {t('login.noAccount')}{' '}
          <Link
            to="/register"
            className="text-[#1D4ED8] font-semibold hover:underline"
          >
            {t('login.createAccount')}
          </Link>
        </div>
      </div>

      {/* Right Column: Instant Demo Access Panel */}
      <div className="md:col-span-5 jana-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#102A56]">
            {t('login.quickDemoTitle')}
          </h2>
          <p className="text-xs text-[#63718A] mt-1">
            {t('login.quickDemoDesc')}
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-sky-200/80 bg-[#FFFCF7] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#102A56]">
              <UserCheck className="w-4 h-4 text-[#1D4ED8]" />
              <span>{t('login.citizenDemo')}</span>
            </div>
            <div className="text-xs font-mono text-[#63718A]">
              citizen@janaseva.demo
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen')}
              className="jana-btn-primary w-full py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {t('login.openCitizenDashboard')}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-sky-200/80 bg-[#FFFCF7] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#102A56]">
              <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
              <span>{t('login.adminDemo')}</span>
            </div>
            <div className="text-xs font-mono text-[#63718A]">
              admin@janaseva.demo
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="jana-btn-accent w-full py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {t('login.openAdminDashboard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
