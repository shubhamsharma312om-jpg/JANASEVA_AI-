import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B192C] text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2 space-y-3">
          <div className="text-lg font-bold text-white tracking-tight">
            JANASEVA AI
          </div>
          <p className="text-slate-400 text-xs max-w-md leading-relaxed">
            Every Voice Matters. Every Grievance Counts. Multilingual citizen
            grievance redressal and civic accountability platform built for the
            Hyderabad Municipal Pilot (English, Telugu, and Hindi).
          </p>
          <div className="text-xs text-slate-400 pt-1">
            <span>Neural Storm 2026</span>
            <span className="mx-2">·</span>
            <span>Track HI-02: Human Impact</span>
            <span className="mx-2">·</span>
            <span>Hyderabad Pilot</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
            Public Portal
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-white transition-colors">
                Track Complaint Status
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About JANASEVA AI
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Civic Desk
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
            Citizen &amp; Admin Access
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/login" className="hover:text-white transition-colors">
                Citizen &amp; Admin Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white transition-colors">
                Create Citizen Account
              </Link>
            </li>
            <li>
              <Link
                to="/citizen/register"
                className="hover:text-white transition-colors"
              >
                Register a Grievance
              </Link>
            </li>
            <li className="pt-2 text-slate-500 font-mono">
              Helpline: 040-2111-1111 (Demo)
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            © 2026 JANASEVA AI. Demonstration platform for civic grievance management.
          </div>
          <div>
            Supported Languages: English · తెలుగు · हिन्दी
          </div>
        </div>
      </div>
    </footer>
  );
};
