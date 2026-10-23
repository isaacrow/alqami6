import React from 'react';

export const AlqamiLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Authentic 8-Pointed Star (Rub el Hizb / Khatam) Heritage Emblem */}
    <path
      d="M24 3L29 14.5L41 11L37.5 23L48 27.5L37.5 32L41 44L29 40.5L24 52L19 40.5L7 44L10.5 32L0 27.5L10.5 23L7 11L19 14.5L24 3Z"
      fill="currentColor"
      fillOpacity="0.16"
    />
    <path
      d="M24 7L27.8 15.8L37.2 13.2L34.5 22.8L43.5 26.5L34.5 30.2L37.2 39.8L27.8 37.2L24 46L20.2 37.2L10.8 39.8L13.5 30.2L4.5 26.5L13.5 22.8L10.8 13.2L20.2 15.8L24 7Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="26.5" r="6" stroke="currentColor" strokeWidth="2" />
    <circle cx="24" cy="26.5" r="2.2" fill="currentColor" />
  </svg>
);
