import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DashboardMistBackground } from './DashboardMistBackground';

export const PublicLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#FFFCF7] text-[#102A56]">
      <DashboardMistBackground intensity="subtle" />
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col">
        <Outlet />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};
