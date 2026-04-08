import React from 'react';
import { GeometricHeroProps } from '../types';


const GeometricHero: React.FC<GeometricHeroProps> = ({
  monthName,
  monthNum,
  heroImg,
  themeColor,
}) => {
  const darkerColor = darkenColor(themeColor, 45);
  const darkestColor = darkenColor(themeColor, 70);

  return (
    <div className="geo-hero">
      <div
        className="geo-hero__image"
        style={{ backgroundImage: `url(${heroImg})` }}
      />

      <div className="geo-hero__brand" style={{ backgroundColor: themeColor }}>
        <div className="geo-hero__brand-inner">
          <svg className="geo-hero__logo" viewBox="0 0 24 24" width="16" height="16" fill="none">
            <path d="M3 3l7 4v10l-7-4V3z" fill="rgba(255,255,255,0.9)" />
            <path d="M10 7l7-4v10l-7 4V7z" fill="rgba(255,255,255,0.6)" />
          </svg>
          <div className="geo-hero__brand-text-group">
            <span className="geo-hero__brand-title">TUF</span>
            <span className="geo-hero__brand-tagline">Your Year at a Glance</span>
          </div>
        </div>
      </div>

      <div
        className="geo-hero__accent-dark"
        style={{ backgroundColor: darkestColor }}
      />

      <div className="geo-hero__month-panel" style={{ backgroundColor: darkerColor }}>
        <span className="geo-hero__month-num">{monthNum}</span>
        <span className="geo-hero__month-name">{monthName}</span>
        <svg className="geo-hero__arrow" viewBox="0 0 30 20" width="22" height="14">
          <polygon points="0,0 20,10 0,20" fill="rgba(255,255,255,0.4)" />
        </svg>
      </div>

      <div className="geo-hero__hex-wrap">
        <div className="geo-hero__hex-border">
          <div className="geo-hero__hex-inner" style={{ backgroundImage: `url(${heroImg})` }}>
            <span className="geo-hero__year-text">2026</span>
          </div>
        </div>
      </div>

      <svg className="geo-hero__lines" viewBox="0 0 340 220" preserveAspectRatio="none">
        <line x1="0" y1="145" x2="180" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="0" y1="160" x2="160" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

/** Darken a hex color by subtracting from each channel */
function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.max(0, r - amount)}, ${Math.max(0, g - amount)}, ${Math.max(0, b - amount)})`;
}

export default GeometricHero;
