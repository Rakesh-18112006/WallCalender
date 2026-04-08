import React from 'react';
import MonthContent from './MonthContent';

interface PrevFlipOverlayProps {
  prevAnim: number | null;
}

const PrevFlipOverlay: React.FC<PrevFlipOverlayProps> = ({ prevAnim }) => {
  if (prevAnim === null) return null;
  
  return (
    <div className="prev-flip-overlay">
      <div className="prev-flip-page">
        <MonthContent mIdx={prevAnim} />
      </div>
    </div>
  );
};

export default PrevFlipOverlay;
