import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { PracticeChapter, ChapterLevel, MoveRecord } from '../types/chess';
import { EvaluationGraph } from './EvaluationGraph';

interface CelebrationModalProps {
  isOpen: boolean;
  chapter: PracticeChapter;
  level: ChapterLevel;
  moveCount: number;
  moveHistory: MoveRecord[];
  elapsedSeconds?: number;
  onNextChapter: () => void;
  onRestart: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  chapter,
  level,
  moveCount,
  moveHistory,
  elapsedSeconds,
  onNextChapter,
  onRestart,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStars = () => {
    if (moveCount <= level.benchmarkMoves) return 3;
    if (moveCount <= Math.ceil(level.benchmarkMoves * 1.5)) return 2;
    return 1;
  };

  const stars = getStars();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-lichess-surface border-2 border-emerald-500/80 rounded-2xl max-w-md w-full p-5 text-center shadow-2xl relative overflow-hidden my-auto">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-2.5 animate-bounce">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">
          Checkmate Delivered!
        </h3>
        <h2 className="text-xl font-black text-gray-100 mt-0.5">
          {chapter.title} Solved!
        </h2>
        <p className="text-xs text-gray-300 mt-0.5">{level.name}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1.5 my-3">
          {[1, 2, 3].map((starIdx) => (
            <Award
              key={starIdx}
              className={`w-7 h-7 transition-transform hover:scale-110 ${
                starIdx <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Stats card */}
        <div className={`bg-lichess-dark/80 border border-lichess-border rounded-xl p-2.5 mb-3 grid ${elapsedSeconds && elapsedSeconds > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 sm:gap-3`}>
          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Your Moves</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{moveCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-gray-400">Benchmark</div>
            <div className="text-lg font-bold font-mono text-gray-300 mt-0.5">≤ {level.benchmarkMoves}</div>
          </div>
          {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-amber-400">Speedrun</div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">{elapsedSeconds.toFixed(1)}s</div>
            </div>
          )}
        </div>

        {/* Lichess Post-Game Move Accuracy Graph (Centipawn Curve) */}
        <div className="mb-4">
          <EvaluationGraph moveHistory={moveHistory} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 px-3 rounded-xl bg-lichess-dark hover:bg-lichess-surfaceHover border border-lichess-border text-xs font-bold text-gray-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onNextChapter}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Next Exercise</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
