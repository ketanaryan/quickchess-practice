import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface StalemateModalProps {
  isOpen: boolean;
  onUndo: () => void;
  onRestart: () => void;
}

export const StalemateModal: React.FC<StalemateModalProps> = ({
  isOpen,
  onUndo,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-lichess-surface border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-600/50 mx-auto flex items-center justify-center shadow-lg shadow-amber-900/40 mb-3 text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
          Stalemate Occurred!
        </h3>
        <h2 className="text-xl font-black text-gray-100 mt-1">
          Draw — No Legal Moves!
        </h2>

        <div className="my-4 p-3.5 rounded-xl bg-lichess-dark/80 border border-lichess-border text-xs text-gray-300 text-left leading-relaxed">
          <p className="font-semibold text-amber-300 mb-1">💡 What happened?</p>
          <p>
            The defending King is not in check, but has <strong>no legal squares to move to</strong>. In chess, this results in an immediate draw (½ - ½).
          </p>
          <p className="mt-2 text-gray-400">
            <strong>Coaching Rule:</strong> When closing in with the Queen or pieces, always ensure the enemy King has at least one escape square until you deliver checkmate!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo Blunder Move</span>
          </button>

          <button
            onClick={onRestart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-lichess-dark hover:bg-lichess-surfaceHover border border-lichess-border text-xs font-bold text-gray-300 transition-colors"
          >
            Restart Exercise
          </button>
        </div>
      </div>
    </div>
  );
};
