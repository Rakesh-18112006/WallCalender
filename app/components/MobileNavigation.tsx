import React from 'react';
import { MONTHS_DATA } from '../mocks/monthsData';

interface MobileNavigationProps {
  currentPage: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onGoPrev: () => void;
  onGoNext: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  canGoPrev,
  canGoNext,
  onGoPrev,
  onGoNext,
}) => {
  return (
    <div className="flex mt-10 mb-20 items-center justify-between gap-5 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/30 w-[280px]">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white active:scale-90 transition-transform disabled:opacity-30"
        onClick={onGoPrev}
        disabled={!canGoPrev}
      >
        <span className="rotate-180">▼</span>
      </button>
      <div className="flex flex-col items-center">
        <span className="text-[8px] uppercase tracking-widest text-white/60 font-bold">Month</span>
        <span className="text-sm font-bold min-w-[80px] text-center text-white">
          {MONTHS_DATA[currentPage]?.name}
        </span>
      </div>
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white active:scale-90 transition-transform disabled:opacity-30"
        onClick={onGoNext}
        disabled={!canGoNext}
      >
        ▼
      </button>
    </div>
  );
};

export default MobileNavigation;
