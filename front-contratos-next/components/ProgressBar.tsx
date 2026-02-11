import React from 'react';

export default function ProgressBar({ step }: { step: number }) {
  return (
    <div className="progress-bar">
      <div className={`step ${step >= 0 ? 'active' : ''}`}>1</div>
      <div className="line"></div>
      <div className={`step ${step >= 1 ? 'active' : ''}`}>2</div>
      <div className="line"></div>
      <div className={`step ${step >= 2 ? 'active' : ''}`}>3</div>
    </div>
  );
}