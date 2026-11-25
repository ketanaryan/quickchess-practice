import React, { useState } from 'react';
import { MoveRecord } from '../types/chess';
import { TrendingUp, CheckCircle, Zap } from 'lucide-react';

interface EvaluationGraphProps {
  moveHistory: MoveRecord[];
  initialScore?: number;
}

export const EvaluationGraph: React.FC<EvaluationGraphProps> = ({
  moveHistory,
  initialScore = 500,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    moveText: string;
    score: number;
    x: number;
    y: number;
  } | null>(null);

  // Extract evaluations at each step (starting with initial position)
  const dataPoints: { ply: number; moveText: string; score: number }[] = [
    { ply: 0, moveText: 'Start', score: Math.min(1000, Math.max(0, initialScore)) },
  ];

  let bestCount = 0;
  let goodCount = 0;
  let inaccuracyCount = 0;
  let blunderCount = 0;

  moveHistory.forEach((rec, idx) => {
    // In checkmate, score shoots up to max
    let clampedScore = 500;
    if (rec.evalScore !== undefined) {
      clampedScore = Math.min(1000, Math.max(0, rec.evalScore));
    }
    if (rec.san.includes('#')) {
      clampedScore = 1000;
    }

    const moveNum = Math.floor(idx / 2) + 1;
    const isWhite = rec.turn === 'w';
    const text = isWhite ? `${moveNum}. ${rec.san}` : `${moveNum}... ${rec.san}`;

    dataPoints.push({
      ply: idx + 1,
      moveText: text,
      score: clampedScore,
    });

    if (isWhite) {
      if (rec.accuracy === 'best' || rec.accuracy === 'brilliant') bestCount++;
      else if (rec.accuracy === 'good') goodCount++;
      else if (rec.accuracy === 'inaccuracy') inaccuracyCount++;
      else if (rec.accuracy === 'blunder') blunderCount++;
      else bestCount++;
    }
  });

  // Graph geometry
  const width = 360;
  const height = 110;
  const paddingX = 24;
  const paddingY = 16;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // X & Y scalers
  const maxScore = 1000; // Represents +10.0 pawns or mate
  const minScore = 0; // Represents equal/drawn
  const count = dataPoints.length;

  const points = dataPoints.map((pt, i) => {
    const x = paddingX + (count > 1 ? (i / (count - 1)) * innerWidth : innerWidth / 2);
    // Y axis inverted: high score = near top (paddingY)
    const normalized = (pt.score - minScore) / (maxScore - minScore);
    const y = height - paddingY - normalized * innerHeight;
    return { x, y, ...pt };
  });

  // Generate SVG path for line and area fill
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY} L ${points[0].x.toFixed(1)} ${height - paddingY} Z`;

  // Calculate estimated accuracy percentage
  const totalWhiteMoves = Math.ceil(moveHistory.length / 2);
  const accuracyPercent = totalWhiteMoves > 0
    ? Math.round(((bestCount * 1.0 + goodCount * 0.85 - inaccuracyCount * 0.2 - blunderCount * 0.5) / totalWhiteMoves) * 100)
    : 100;
  const finalAccuracy = Math.min(100, Math.max(65, accuracyPercent));

  return (
    <div className="w-full bg-lichess-dark/80 border border-lichess-border rounded-xl p-3 select-none">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Evaluation Curve (Lichess Advantage)</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-emerald-300">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>{finalAccuracy}% Accuracy</span>
        </div>
      </div>

      {/* Accuracy Badges Summary */}
      <div className="flex items-center justify-center gap-2 mb-2 text-[10px] font-semibold">
        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
          <CheckCircle className="w-3 h-3" /> Best: {bestCount}
        </span>
        <span className="flex items-center gap-1 text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-900/50">
          Good: {goodCount}
        </span>
        {inaccuracyCount > 0 && (
          <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
            Inaccuracies: {inaccuracyCount}
          </span>
        )}
        {blunderCount > 0 && (
          <span className="flex items-center gap-1 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
            Blunders: {blunderCount}
          </span>
        )}
      </div>

      {/* SVG Curve Container */}
      <div className="relative flex justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[360px] h-[110px] overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#3f3c38"
            strokeDasharray="2 2"
            strokeWidth="0.8"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#3f3c38"
            strokeWidth="1"
          />

          {/* Axis Labels */}
          <text x={paddingX - 4} y={paddingY + 4} fill="#888" fontSize="8" textAnchor="end" fontFamily="monospace">
            #Mate
          </text>
          <text x={paddingX - 4} y={height - paddingY} fill="#888" fontSize="8" textAnchor="end" fontFamily="monospace">
            +0.0
          </text>

          {/* Shaded Area under Curve */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.index === idx ? 4.5 : 2.5}
              fill={hoveredPoint?.index === idx ? '#38bdf8' : '#ffffff'}
              stroke="#059669"
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() =>
                setHoveredPoint({
                  index: idx,
                  moveText: pt.moveText,
                  score: pt.score,
                  x: pt.x,
                  y: pt.y,
                })
              }
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-950 border border-emerald-500/80 px-2 py-1 rounded shadow-xl text-[10px] text-gray-200 pointer-events-none transform -translate-x-1/2 -translate-y-8 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <span className="font-bold text-white">{hoveredPoint.moveText}</span>
            <span className="ml-1 text-emerald-400 font-mono">
              ({hoveredPoint.score >= 1000 ? '#Mate' : `+${(hoveredPoint.score / 100).toFixed(1)}`})
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] text-gray-400 mt-1 px-1">
        <span>Move 1</span>
        <span className="text-emerald-400">Steady Advantage Climb</span>
        <span>Checkmate!</span>
      </div>
    </div>
  );
};
