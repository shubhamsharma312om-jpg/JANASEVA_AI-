import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { DashboardMistBackground } from '../common/DashboardMistBackground';
import { LanguageSelector } from '../common/LanguageSelector';

export const AdminLayout: React.FC = () => {
  const { user, loginAsDemo, logout, backendConnected } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Ensure admin session if navigating directly to /admin/*
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      loginAsDemo('admin');
    }
  }, [user, loginAsDemo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    },
    {
      to: '/admin/complaints',
      label: t('nav.allComplaints'),
      icon: ClipboardList,
    },
    {
      to: '/admin/departments',
      label: t('nav.departments'),
      icon: Building2,
    },
    { to: '/admin/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { to: '/admin/users', label: t('nav.userManagement'), icon: Users },
    { to: '/admin/settings', label: t('nav.settings'), icon: Settings },
  ];

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center ${
      desktopCollapsed ? 'justify-center px-2.5' : 'gap-3 px-3.5'
    } py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'jana-btn-accent text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'jana-btn-accent text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
    }`;

  return (
    <div className="relative min-h-screen bg-[#FFFCF7] text-[#102A56] flex">
      {/* Soft-Blended Mist Dashboard Background */}
      <DashboardMistBackground intensity="medium" />

      {/* Dark Navy Expandable / Collapsible Admin Sidebar */}
      <aside
        className={`relative z-20 hidden lg:flex lg:flex-col ${
          desktopCollapsed ? 'lg:w-20' : 'lg:w-64'
        } bg-[#102A56] text-white border-r border-slate-800 shrink-0 transition-all duration-300 ease-in-out shadow-md`}
      >
        <div
          className={`px-4 py-5 border-b border-slate-800/90 flex items-center ${
            desktopCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!desktopCollapsed ? (
            <div className="min-w-0">
              <Link
                to="/"
                className="text-lg font-bold tracking-tight text-white block truncate"
              >
                {t('app.name')}
              </Link>
              <p className="text-xs text-sky-300/90 mt-0.5 truncate">
                {t('app.portal.admin')}
              </p>
            </div>
          ) : (
            <Link
              to="/"
              title={t('app.portal.admin')}
              className="w-9 h-9 rounded-xl jana-btn-accent flex items-center justify-center font-bold text-sm"
            >
              JS
            </Link>
          )}

          {!desktopCollapsed && (
            <button
              type="button"
              onClick={() => setDesktopCollapsed(true)}
              aria-label="Collapse Admin Sidebar"
              title="Collapse Sidebar"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {desktopCollapsed && (
          <div className="px-3 pt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setDesktopCollapsed(false)}
              aria-label="Expand Admin Sidebar"
              title="Expand Sidebar"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <nav
          className="flex-1 p-3 space-y-1.5 overflow-y-auto"
          aria-label="Admin Dashboard Sidebar"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={desktopCollapsed ? item.label : undefined}
                className={desktopLinkClass}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span
                  className={`transition-all duration-200 overflow-hidden ${
                    desktopCollapsed
                      ? 'w-0 opacity-0 hidden'
                      : 'w-auto opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800/90 space-y-2.5">
          {!desktopCollapsed && (
            <div className="px-2">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || 'Dr. Vikramaditya Rao, IAS'}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {user?.email || 'admin@janaseva.demo'}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title={desktopCollapsed ? t('common.logout') : undefined}
            className={`w-full flex items-center ${
              desktopCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
            } py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!desktopCollapsed && <span>{t('common.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile / Tablet Smooth Sliding Admin Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          mobileDrawerOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-[#102A56]/55 backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
        />
        <aside
          className={`relative z-50 w-64 bg-[#102A56] text-white h-full flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white block">
                {t('app.name')}
              </span>
              <span className="text-xs text-sky-300">
                {t('app.portal.admin')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close Admin Menu"
              className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={mobileLinkClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-3">
            <LanguageSelector variant="dark" className="w-full justify-center" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-[#FFFCF7]/85 backdrop-blur-md border-b border-sky-200/70 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Admin Menu"
              className="lg:hidden p-2 text-[#102A56] hover:bg-sky-50 rounded-xl border border-sky-200/70 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setDesktopCollapsed((prev) => !prev)}
              aria-label="Toggle Admin Sidebar"
              title={desktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:inline-flex p-2 text-[#102A56] hover:bg-sky-50 rounded-xl border border-sky-200/70 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="text-xs text-[#63718A] font-medium">
              <span className="text-[#102A56] font-semibold">
                {t('nav.municipalAdmin')}
              </span>
              <span className="mx-2">·</span>
              <span>
                {backendConnected
                  ? 'SQLite (janaseva.db) + Demo Records'
                  : 'Local Demo Persistence'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="light" />
            <Link
              to="/citizen/dashboard"
              onClick={() => loginAsDemo('citizen')}
              className="jana-btn-secondary px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0"
            >
              {t('nav.switchToCitizen')}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
