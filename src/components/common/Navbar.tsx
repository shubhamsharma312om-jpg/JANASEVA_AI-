import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Navbar: React.FC = () => {
  const { user } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePrimaryAction = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/citizen/dashboard');
    }
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-[#102A56] transition-colors whitespace-nowrap shrink-0 pb-1 ${
      isActive
        ? 'text-[#102A56] font-semibold border-b-2 border-[#48A9E8]'
        : 'text-[#63718A]'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFCF7]/90 backdrop-blur-md border-b border-sky-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-[#102A56] whitespace-nowrap shrink-0"
        >
          {t('app.name')}
        </Link>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/track" className={navLinkClass}>
            {t('nav.trackComplaint')}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {t('nav.contact')}
          </NavLink>
        </nav>

        {/* Zone 3: Language Selector + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LanguageSelector variant="light" />

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            {user
              ? user.role === 'admin'
                ? t('nav.adminDashboard')
                : t('nav.citizenDashboard')
              : t('common.login')}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Mobile Navigation"
            className="md:hidden p-2 text-[#102A56] hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Smooth Mobile Dropdown Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-sky-200/70 bg-[#FFFCF7]/95 backdrop-blur-md ${
          mobileMenuOpen
            ? 'max-h-80 border-t py-4 px-6 opacity-100'
            : 'max-h-0 py-0 px-6 opacity-0'
        }`}
      >
        <div className="space-y-2.5 text-sm font-medium">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#102A56] hover:text-[#48A9E8] transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#102A56] hover:text-[#48A9E8] transition-colors"
          >
            {t('nav.trackComplaint')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#102A56] hover:text-[#48A9E8] transition-colors"
          >
            {t('nav.about')}
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#102A56] hover:text-[#48A9E8] transition-colors"
          >
            {t('nav.contact')}
          </Link>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#1D4ED8] font-semibold"
          >
            {user ? t('nav.citizenDashboard') : `${t('common.login')} / ${t('common.register')}`}
          </Link>
        </div>
      </div>
    </header>
  );
};
