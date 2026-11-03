import React from 'react';
import HealthCheckCard from '../components/HealthCheckCard.jsx';

export default function LandingPage() {
  return (
    <main className="landing-container">
      <header className="hero-section">
        <p className="kicker">Neural Storm 2026 · Track HI-02 · Hyderabad Pilot</p>
        <h1 className="brand-title">JANASEVA AI</h1>
        <p className="brand-tagline">Every Voice Matters. Every Grievance Counts.</p>
        <p className="phase-notice">
          Phase 1 Development Foundation — React + Vite Frontend, Python FastAPI Backend,
          and Privacy-First SQLite Schema. Multilingual NLP models (English, Telugu, Hindi)
          are modularized for Phase 2 integration.
        </p>
      </header>

      <HealthCheckCard />
    </main>
  );
}
