import React from 'react';
import { Crown, Castle, Shield, Layers, Compass, Sword, CheckCircle2, Star, X } from 'lucide-react';
import { PracticeChapter, ChapterLevel, ChapterProgress } from '../types/chess';

interface ChapterSidebarProps {
  chapters: PracticeChapter[];
  activeChapter: PracticeChapter;
  activeLevel: ChapterLevel;
  onSelectChapter: (chapter: PracticeChapter, level?: ChapterLevel) => void;
  isOpen: boolean;
  onClose: () => void;
  progressMap: Record<string, ChapterProgress>;
}

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  chapters,
  activeChapter,
  activeLevel,
  onSelectChapter,
  isOpen,
  onClose,
  progressMap,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'Castle': return <Castle className="w-5 h-5 text-sky-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-purple-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-rose-400" />;
      case 'Sword': return <Sword className="w-5 h-5 text-indigo-400" />;
      default: return <Crown className="w-5 h-5 text-amber-400" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">Beginner</span>;
      case 'Intermediate':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/50">Intermediate</span>;
      case 'Advanced':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/50">Advanced</span>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 w-80 bg-lichess-surface border-r border-lichess-border z-40 transition-transform duration-200 ease-in-out shrink-0 overflow-y-auto flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-lichess-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
              Piece Checkmates I
            </h2>
            <p className="text-xs text-emerald-400 font-semibold">
              All 6 Chapters Available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-lichess-surfaceHover text-gray-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-3 space-y-2">
          {chapters.map((chapter, index) => {
            const isSelected = activeChapter.id === chapter.id;
            const progress = progressMap[chapter.id];
            const isCompleted = progress?.completed;
            const stars = progress?.stars || 0;

            return (
              <div
                key={chapter.id}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-lichess-surfaceHover/80 border-emerald-500/70 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-lichess-dark/50 border-lichess-border/50 hover:bg-lichess-surfaceHover/50 hover:border-lichess-border'
                }`}
              >
                <button
                  onClick={() => onSelectChapter(chapter, chapter.levels[0])}
                  className="w-full text-left p-3 flex items-start gap-3"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-lichess-surface border border-lichess-border shrink-0">
                    {getIcon(chapter.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] text-gray-400 font-medium">Chapter {index + 1} of 6</span>
                      {getDifficultyBadge(chapter.difficulty)}
                    </div>

                    <h3 className="text-sm font-bold text-gray-100 truncate flex items-center gap-1.5">
                      {chapter.title}
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline shrink-0" />
                      )}
                    </h3>

                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {chapter.subtitle}
                    </p>

                    {/* Progress Stars */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      {progress?.bestMoveCount ? (
                        <span className="text-[10px] text-gray-400 ml-1.5">
                          Best: {progress.bestMoveCount} moves
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>

                {/* Sub-levels for active chapter */}
                {isSelected && (
                  <div className="border-t border-lichess-border/60 bg-black/20 p-2 space-y-1 rounded-b-xl">
                    <div className="text-[10px] uppercase font-semibold text-gray-400 px-2 py-0.5">
                      Positions:
                    </div>
                    {chapter.levels.map((lvl, lvlIdx) => {
                      const isLvlActive = activeLevel.id === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => onSelectChapter(chapter, lvl)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isLvlActive
                              ? 'bg-emerald-600/25 text-emerald-300 font-semibold border border-emerald-500/40'
                              : 'text-gray-300 hover:bg-lichess-surfaceHover/70'
                          }`}
                        >
                          <span className="truncate">
                            {lvlIdx + 1}. {lvl.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                            ≤ {lvl.benchmarkMoves} moves
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-lichess-border bg-lichess-dark/40 text-[11px] text-gray-400 text-center">
          Designed for <span className="text-gray-200 font-semibold">Quick Chess For You</span>
        </div>
      </aside>
    </>
  );
};
