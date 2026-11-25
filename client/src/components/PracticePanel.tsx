import React, { useState } from 'react';
import {
  RotateCcw,
  Lightbulb,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown,
  Castle,
  Shield,
  Layers,
  Compass,
  Sword,
  CheckCircle2,
} from 'lucide-react';
import { PracticeChapter, ChapterLevel, MoveRecord, ChapterProgress } from '../types/chess';
import { MoveAnalysis } from '../services/chessEngine';

interface PracticePanelProps {
  chapters: PracticeChapter[];
  chapter: PracticeChapter;
  level: ChapterLevel;
  moveHistory: MoveRecord[];
  moveCount: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isEngineThinking: boolean;
  onUndoMove: () => void;
  onRestartLevel: () => void;
  onRequestHint: () => void;
  currentHint: MoveAnalysis | null;
  onSelectChapter: (chapter: PracticeChapter, level?: ChapterLevel) => void;
  progressMap: Record<string, ChapterProgress>;
}

export const PracticePanel: React.FC<PracticePanelProps> = ({
  chapters,
  chapter,
  level,
  moveHistory,
  moveCount,
  isCheck,
  isCheckmate,
  isStalemate,
  isEngineThinking,
  onUndoMove,
  onRestartLevel,
  onRequestHint,
  currentHint,
  onSelectChapter,
  progressMap,
}) => {
  const [showStrategy, setShowStrategy] = useState<boolean>(true);
  const [showChapterMenu, setShowChapterMenu] = useState<boolean>(false);

  const getChapterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'Castle': return <Castle className="w-4 h-4 text-sky-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Compass': return <Compass className="w-4 h-4 text-rose-400" />;
      case 'Sword': return <Sword className="w-4 h-4 text-indigo-400" />;
      default: return <Crown className="w-4 h-4 text-amber-400" />;
    }
  };

  const currentChapterIndex = chapters.findIndex((c) => c.id === chapter.id);

  const handlePrevChapter = () => {
    const prevIndex = (currentChapterIndex - 1 + chapters.length) % chapters.length;
    onSelectChapter(chapters[prevIndex], chapters[prevIndex].levels[0]);
  };

  const handleNextChapter = () => {
    const nextIndex = (currentChapterIndex + 1) % chapters.length;
    onSelectChapter(chapters[nextIndex], chapters[nextIndex].levels[0]);
  };

  const movePairs: { white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

  const getProjectedStars = () => {
    if (moveCount <= level.benchmarkMoves) return 3;
    if (moveCount <= Math.ceil(level.benchmarkMoves * 1.5)) return 2;
    return 1;
  };

  const projectedStars = getProjectedStars();

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col gap-2.5 select-none shrink-0">
      {/* Sleek Lichess-style Chapter Navigation Card */}
      <div className="bg-lichess-surface border border-lichess-border rounded-xl p-3 shadow-md relative">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 pb-1.5 border-b border-lichess-border/60">
          <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
            Chapter {currentChapterIndex + 1} of {chapters.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevChapter}
              className="p-1 rounded bg-lichess-dark hover:bg-lichess-surfaceHover text-gray-300 hover:text-white transition-colors"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-emerald-400 px-1">
              {currentChapterIndex + 1}/{chapters.length}
            </span>
            <button
              onClick={handleNextChapter}
              className="p-1 rounded bg-lichess-dark hover:bg-lichess-surfaceHover text-gray-300 hover:text-white transition-colors"
              title="Next Chapter"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clickable Chapter Selector Title Button */}
        <div className="relative">
          <button
            onClick={() => setShowChapterMenu(!showChapterMenu)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-lichess-dark hover:bg-lichess-surfaceHover border border-lichess-border/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-md bg-lichess-surface border border-lichess-border shrink-0">
                {getChapterIcon(chapter.icon)}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-100 truncate flex items-center gap-1.5">
                  <span>{chapter.title}</span>
                  {progressMap[chapter.id]?.completed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-gray-400 truncate">{chapter.subtitle}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showChapterMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Chapters Dropdown Menu */}
          {showChapterMenu && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-lichess-surface border-2 border-emerald-500/60 rounded-xl shadow-2xl py-1.5 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select from 6 Practice Chapters:
              </div>
              {chapters.map((ch, idx) => {
                const isCurrent = ch.id === chapter.id;
                const isDone = progressMap[ch.id]?.completed;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onSelectChapter(ch, ch.levels[0]);
                      setShowChapterMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                        : 'text-gray-200 hover:bg-lichess-surfaceHover'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0">{getChapterIcon(ch.icon)}</span>
                      <span className="text-xs truncate">
                        {idx + 1}. {ch.title}
                      </span>
                    </div>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Position / Setup segmented pills */}
        <div className="mt-2.5 pt-2 border-t border-lichess-border/60">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center justify-between">
            <span>Setup Position:</span>
            <span className="text-sky-400 flex items-center gap-1 font-mono">
              <Target className="w-3 h-3" />
              Target: ≤ {level.benchmarkMoves} moves
            </span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {chapter.levels.map((lvl, idx) => {
              const isSelected = lvl.id === level.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => onSelectChapter(chapter, lvl)}
                  className={`flex-1 min-w-[70px] py-1 px-1.5 rounded-md text-[10px] font-semibold text-center truncate transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-lichess-dark text-gray-300 hover:bg-lichess-surfaceHover hover:text-white border border-lichess-border/60'
                  }`}
                  title={lvl.name}
                >
                  {idx + 1}. {lvl.name.split(':')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Status & Move Counter Card */}
      <div className="bg-lichess-surface border border-lichess-border rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Status
            </span>
            <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
              {isCheckmate ? (
                <span className="text-emerald-400 animate-bounce">🏆 Checkmate! Victory!</span>
              ) : isStalemate ? (
                <span className="text-amber-400">⚠️ Stalemate (Draw)</span>
              ) : isCheck ? (
                <span className="text-rose-400 animate-pulse">⚡ Check!</span>
              ) : isEngineThinking ? (
                <span className="text-sky-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
                  Computer moving...
                </span>
              ) : (
                <span className="text-gray-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  White to move
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Moves
            </span>
            <div className="text-sm font-mono font-bold text-gray-100">
              <span className={moveCount > level.benchmarkMoves ? 'text-amber-400' : 'text-emerald-400'}>
                {moveCount}
              </span>
              <span className="text-gray-400 text-xs"> / {level.benchmarkMoves}</span>
              <span className="text-[10px] text-amber-400 ml-1.5 font-sans">
                {'★'.repeat(projectedStars)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-lichess-border/70">
          <button
            onClick={onUndoMove}
            disabled={moveHistory.length === 0 || isEngineThinking}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-lichess-dark hover:bg-lichess-surfaceHover disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-gray-200 border border-lichess-border transition-colors"
            title="Undo move (Keyboard: ←)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>

          <button
            onClick={onRequestHint}
            disabled={isCheckmate || isStalemate || isEngineThinking}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-sky-300 border border-sky-800/60 transition-colors"
            title="Get coaching hint (Keyboard: H)"
          >
            <Lightbulb className="w-3 h-3 text-sky-400" />
            <span>Hint</span>
          </button>

          <button
            onClick={onRestartLevel}
            disabled={isEngineThinking}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-lichess-dark hover:bg-lichess-surfaceHover disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-gray-200 border border-lichess-border transition-colors"
            title="Restart exercise (Keyboard: R)"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restart</span>
          </button>
        </div>

        {/* Coach Hint Box */}
        {currentHint && (
          <div className="mt-2 p-2 rounded-lg bg-sky-950/40 border border-sky-700/50 text-xs text-sky-200 animate-in fade-in duration-150">
            <div className="flex items-center gap-1 font-bold text-sky-400 mb-0.5 text-[11px]">
              <Sparkles className="w-3 h-3" />
              <span>Coach Insight:</span>
            </div>
            <p className="leading-snug text-[11px]">{currentHint.hintExplanation}</p>
          </div>
        )}
      </div>

      {/* Move History */}
      <div className="bg-lichess-surface border border-lichess-border rounded-xl p-2.5 shadow-md max-h-[120px] flex flex-col">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Notation</span>
          <span className="text-[10px] text-gray-400 font-normal">{moveHistory.length} plies</span>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 font-mono text-xs space-y-0.5">
          {movePairs.length === 0 ? (
            <div className="text-gray-400 italic text-center py-2 text-[11px]">Make a move to start!</div>
          ) : (
            movePairs.map((pair, idx) => (
              <div
                key={idx}
                className="flex items-center py-0.5 px-1.5 rounded hover:bg-lichess-surfaceHover text-[11px]"
              >
                <span className="w-6 text-gray-400">{idx + 1}.</span>
                <span className="w-14 font-semibold text-gray-100">{pair.white?.san}</span>
                <span className="w-14 text-gray-400">{pair.black?.san || '...'}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Strategy Guide Accordion */}
      <div className="bg-lichess-surface border border-lichess-border rounded-xl overflow-hidden shadow-md">
        <button
          onClick={() => setShowStrategy(!showStrategy)}
          className="w-full p-2 flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider hover:bg-lichess-surfaceHover transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strategy & Pitfalls</span>
          </div>
          {showStrategy ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {showStrategy && (
          <div className="p-2.5 border-t border-lichess-border/70 space-y-2 text-xs bg-lichess-dark/30">
            <ul className="space-y-1 text-gray-300 list-disc list-inside text-[11px]">
              {chapter.strategyGuide.map((tip, idx) => (
                <li key={idx} className="leading-snug">
                  <span className="text-gray-200">{tip}</span>
                </li>
              ))}
            </ul>

            <div className="p-1.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-tight text-[10px]">{chapter.commonPitfall}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
