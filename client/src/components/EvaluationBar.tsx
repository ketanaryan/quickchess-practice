import React from 'react';

interface EvaluationBarProps {
  score: number; // Positive is winning for White
  isCheckmate: boolean;
  isStalemate: boolean;
  height: number;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  score,
  isCheckmate,
  isStalemate,
  height,
}) => {
  // Calculate percentage of White's bar (0% to 100%)
  // In checkmate practice, White always has huge advantage (from 60% to 100%)
  let whitePercent = 50;

  if (isCheckmate) {
    whitePercent = 100;
  } else if (isStalemate) {
    whitePercent = 50;
  } else {
    // Sigmoid or bounded scaling
    const normalized = Math.max(-2000, Math.min(2000, score));
    whitePercent = 50 + (normalized / 2000) * 45;
  }

  // Display label
  let label = '+0.0';
  if (isCheckmate) {
    label = '#Mate';
  } else if (isStalemate) {
    label = '0.0';
  } else if (score > 10000) {
    label = '+M';
  } else {
    const pawns = (score / 100).toFixed(1);
    label = score >= 0 ? `+${pawns}` : pawns;
  }

  return (
    <div
      className="hidden sm:flex flex-col items-center justify-between w-6 rounded-md overflow-hidden bg-black/80 border border-lichess-border shadow-inner relative select-none mr-2"
      style={{ height: `${height}px` }}
      title={`Engine Evaluation: ${label}`}
    >
      {/* Black's section (top) */}
      <div
        className="w-full bg-[#363431] transition-all duration-300 ease-out"
        style={{ height: `${100 - whitePercent}%` }}
      />

      {/* White's section (bottom) */}
      <div
        className="w-full bg-gradient-to-t from-gray-200 to-white transition-all duration-300 ease-out flex items-end justify-center pb-1"
        style={{ height: `${whitePercent}%` }}
      >
        <span className="text-[9px] font-mono font-bold text-gray-900 leading-none">
          {label}
        </span>
      </div>
    </div>
  );
};
