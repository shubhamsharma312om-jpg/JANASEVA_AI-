import React from 'react';
import { DASHBOARD_BG_IMAGE } from '../../utils/departmentAssets';

interface DashboardMistBackgroundProps {
  intensity?: 'subtle' | 'medium';
}

export const DashboardMistBackground: React.FC<DashboardMistBackgroundProps> = ({
  intensity = 'medium',
}) => {
  const imageOpacity = intensity === 'medium' ? 'opacity-30' : 'opacity-20';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#FFFCF7]"
    >
      {/* Top-anchored Charminar & Hyderabad Civic Artwork with soft edge mask */}
      <div className="absolute inset-x-0 top-0 h-[560px] w-full overflow-hidden">
        <img
          src={DASHBOARD_BG_IMAGE}
          alt=""
          className={`h-full w-full object-cover object-top ${imageOpacity} transition-opacity duration-500`}
        />
        {/* Multi-stop vertical mist fade into creamy white #FFFCF7 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 252, 247, 0.35) 0%, rgba(255, 252, 247, 0.72) 52%, rgba(255, 252, 247, 0.95) 82%, #FFFCF7 100%)',
          }}
        />
        {/* Left & Right edge fog feathering so no rectangular border is ever visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 25%, rgba(255, 252, 247, 0.08) 0%, rgba(255, 252, 247, 0.75) 75%, #FFFCF7 100%)',
          }}
        />
      </div>

      {/* Subtle warm-sky ambient glow for glass cards */}
      <div
        className="absolute -top-24 right-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'rgba(135, 206, 250, 0.14)' }}
      />
      <div
        className="absolute top-64 left-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'rgba(254, 215, 170, 0.14)' }}
      />
    </div>
  );
};
