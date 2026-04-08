import React from 'react';

interface SpiralRingsProps {
  count?: number;
}

const SpiralRings: React.FC<SpiralRingsProps> = ({ count = 9 }) => {
  return (
    <div className="spiral-rings-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`ring-${i}`} className="spiral-ring">
          <div className="spiral-ring-wire" />
        </div>
      ))}
    </div>
  );
};

export default SpiralRings;
