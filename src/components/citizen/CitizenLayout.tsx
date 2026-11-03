import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatLanguageName } from '../../utils/formatters';
import { DashboardMistBackground } from '../common/DashboardMistBackground';

export const CitizenLayout: React.FC = () => {
  const { user, loginAsDemo, logout } = useApp();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Ensure a citizen session is active if user navigates directly to /citizen/*
  useEffect(() => {
    if (!user) {
      loginAsDemo('citizen');
    }
  }, [user, loginAsDemo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citizen/complaints', label: 'My Complaints', icon: FileText },
    { to: '/citizen/register', label: 'Register Complaint', icon: FilePlus2 },
    { to: '/citizen/track', label: 'Track Complaint', icon: Search },
    { to: '/citizen/profile', label: 'Profile', icon: User },
    { to: '/citizen/settings', label: 'Settings', icon: Settings },
  ];

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center ${
      desktopCollapsed ? 'justify-center px-2.5' : 'gap-3 px-3.5'
    } py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'jana-btn-primary text-white shadow-sm'
        : 'text-[#102A56] hover:bg-sky-50/90 hover:text-[#1D4ED8]'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'jana-btn-primary text-white shadow-sm'
        : 'text-[#102A56] hover:bg-sky-50/90 hover:text-[#1D4ED8]'
    }`;

  return (
    <div className="relative min-h-screen bg-[#FFFCF7] text-[#102A56] flex">
      {/* Soft-Blended Mist Dashboard Background */}
      <DashboardMistBackground intensity="medium" />

      {/* Desktop Expandable / Collapsible Sidebar */}
      <aside
        className={`relative z-20 hidden lg:flex lg:flex-col ${
          desktopCollapsed ? 'lg:w-20' : 'lg:w-64'
        } bg-white/88 backdrop-blur-md border-r border-sky-200/80 shrink-0 transition-all duration-300 ease-in-out shadow-xs`}
      >
        <div
          className={`px-4 py-5 border-b border-sky-200/70 flex items-center ${
            desktopCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!desktopCollapsed ? (
            <div className="min-w-0">
              <Link
                to="/"
                className="text-lg font-bold tracking-tight text-[#102A56] block truncate"
              >
                JANASEVA AI
              </Link>
              <p className="text-xs text-[#63718A] mt-0.5 truncate">
                Citizen Grievance Portal
              </p>
            </div>
          ) : (
            <Link
              to="/"
              title="JANASEVA AI"
              className="w-9 h-9 rounded-xl jana-btn-primary flex items-center justify-center font-bold text-sm"
            >
              JS
            </Link>
          )}

          {!desktopCollapsed && (
            <button
              type="button"
              onClick={() => setDesktopCollapsed(true)}
              aria-label="Collapse Sidebar"
              title="Collapse Sidebar"
              className="p-1.5 text-[#63718A] hover:text-[#102A56] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
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
              aria-label="Expand Sidebar"
              title="Expand Sidebar"
              className="p-2 text-[#63718A] hover:text-[#102A56] hover:bg-sky-50 rounded-xl border border-sky-200/70 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <nav
          className="flex-1 p-3 space-y-1.5 overflow-y-auto"
          aria-label="Citizen Dashboard Sidebar"
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
                    desktopCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sky-200/70 space-y-2.5">
          {!desktopCollapsed && (
            <div className="px-2">
              <div className="text-xs font-semibold text-[#102A56] truncate">
                {user?.name || 'Arjun Reddy'}
              </div>
              <div className="text-xs text-[#63718A] truncate">
                {user?.email || 'citizen@janaseva.demo'}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title={desktopCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${
              desktopCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'
            } py-2 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50/90 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!desktopCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile / Tablet Smooth Sliding Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          mobileDrawerOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Semi-transparent Backdrop */}
        <div
          className="fixed inset-0 bg-[#102A56]/40 backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
        />

        {/* Sliding Drawer Panel */}
        <aside
          className={`relative z-50 w-64 bg-[#FFFCF7]/95 backdrop-blur-md h-full flex flex-col border-r border-sky-200/80 shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-5 py-4 border-b border-sky-200/70 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#102A56] block">
                JANASEVA AI
              </span>
              <span className="text-xs text-[#63718A]">
                Citizen Grievance Portal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close Citizen Menu"
              className="p-1.5 text-[#63718A] hover:text-[#102A56] hover:bg-sky-50 rounded-lg cursor-pointer"
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
          <div className="p-4 border-t border-sky-200/70">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-[#FFFCF7]/85 backdrop-blur-md border-b border-sky-200/70 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Citizen Menu"
              className="lg:hidden p-2 text-[#102A56] hover:bg-sky-50 rounded-xl border border-sky-200/70 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Expand/Collapse Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setDesktopCollapsed((prev) => !prev)}
              aria-label="Toggle Citizen Sidebar"
              title={desktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:inline-flex p-2 text-[#102A56] hover:bg-sky-50 rounded-xl border border-sky-200/70 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="text-xs text-[#63718A] font-medium">
              <span className="text-[#102A56] font-semibold">Citizen Workspace</span>
              <span className="mx-2">·</span>
              <span>
                Language: {formatLanguageName(user?.preferred_language || 'te')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/citizen/register"
              className="jana-btn-accent px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0"
            >
              + Register Complaint
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
