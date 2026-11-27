import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Header } from './components/Header';
import { ChapterSidebar } from './components/ChapterSidebar';
import { ChessboardView } from './components/ChessboardView';
import { PracticePanel } from './components/PracticePanel';
import { CelebrationModal } from './components/CelebrationModal';
import { StalemateModal } from './components/StalemateModal';
import { PRACTICE_CHAPTERS } from './data/chapters';
import type { PracticeChapter, ChapterLevel, ChapterProgress, MoveRecord, MoveAccuracy } from './types/chess';
import { BOARD_THEMES, type BoardTheme } from './constants/boardThemes';
import { soundService } from './services/soundService';
import { ChessEngineService, evaluatePosition, type MoveAnalysis } from './services/chessEngine';
import { stockfishService } from './services/stockfishService';

export const App: React.FC = () => {
  // Navigation & Chapter State
  const [activeChapter, setActiveChapter] = useState<PracticeChapter>(PRACTICE_CHAPTERS[0]);
  const [activeLevel, setActiveLevel] = useState<ChapterLevel>(PRACTICE_CHAPTERS[0].levels[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Settings & Theme
  const [currentTheme, setCurrentTheme] = useState<BoardTheme>(() => {
    try {
      const saved = localStorage.getItem('qcfy_theme');
      return saved ? JSON.parse(saved) : BOARD_THEMES[0];
    } catch {
      return BOARD_THEMES[0];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qcfy_sound') !== 'false';
    } catch {
      return true;
    }
  });

  // Game Engine & State
  const [chess, setChess] = useState<Chess>(() => new Chess(activeLevel.fen));
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [whiteMoveCount, setWhiteMoveCount] = useState<number>(0);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const [currentHint, setCurrentHint] = useState<MoveAnalysis | null>(null);
  const [evalScore, setEvalScore] = useState<number>(() => evaluatePosition(new Chess(activeLevel.fen)));

  // Modals
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showStalemate, setShowStalemate] = useState<boolean>(false);

  // Speedrun Stopwatch & Interactive History Replayer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  // Live timer runs during active solving until victory/stalemate
  useEffect(() => {
    let timer: any = null;
    if (moveHistory.length > 0 && !showCelebration && !showStalemate) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [moveHistory.length, showCelebration, showStalemate]);

  // Progress tracking with local storage protection
  const [progressMap, setProgressMap] = useState<Record<string, ChapterProgress>>(() => {
    try {
      const saved = localStorage.getItem('qcfy_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sound service sync
  useEffect(() => {
    soundService.setEnabled(soundEnabled);
    try {
      localStorage.setItem('qcfy_sound', String(soundEnabled));
    } catch {
      // Ignored
    }
  }, [soundEnabled]);

  // Theme sync
  useEffect(() => {
    try {
      localStorage.setItem('qcfy_theme', JSON.stringify(currentTheme));
    } catch {
      // Ignored
    }
  }, [currentTheme]);

  // Progress sync
  useEffect(() => {
    try {
      localStorage.setItem('qcfy_progress', JSON.stringify(progressMap));
    } catch {
      // Ignored
    }
  }, [progressMap]);

  // Start or reset a level
  const loadLevel = useCallback((lvl: ChapterLevel) => {
    const newChess = new Chess(lvl.fen);
    setChess(newChess);
    setMoveHistory([]);
    setWhiteMoveCount(0);
    setLastMove(null);
    setHintMove(null);
    setCurrentHint(null);
    setElapsedSeconds(0);
    setViewingIndex(null);
    setEvalScore(evaluatePosition(newChess));
    setIsEngineThinking(false);
    setShowCelebration(false);
    setShowStalemate(false);
  }, []);

  // When chapter or level changes
  const handleSelectChapter = useCallback((chapter: PracticeChapter, level?: ChapterLevel) => {
    setActiveChapter(chapter);
    const targetLevel = level || chapter.levels[0];
    setActiveLevel(targetLevel);
    loadLevel(targetLevel);
    setIsSidebarOpen(false);
  }, [loadLevel]);

  // Sync completed session with backend API asynchronously
  const syncSessionWithApi = useCallback((moveCount: number, stars: number) => {
    try {
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      fetch(`${backendUrl}/api/practice/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: activeChapter.id,
          levelId: activeLevel.id,
          moveCount,
          benchmarkMoves: activeLevel.benchmarkMoves,
          stars,
        }),
      }).catch(() => {});
    } catch {
      // Offline safe
    }
  }, [activeChapter.id, activeLevel.id, activeLevel.benchmarkMoves]);

  // Check victory / draw status
  const evaluateGameState = useCallback((currentChess: Chess, currentMoves: number) => {
    if (currentChess.isCheckmate()) {
      soundService.playVictory();
      setShowCelebration(true);
      setEvalScore(100000);

      const targetMoves = activeLevel.benchmarkMoves;
      const stars = currentMoves <= targetMoves ? 3 : currentMoves <= Math.ceil(targetMoves * 1.5) ? 2 : 1;

      setProgressMap((prev) => {
        const existing = prev[activeChapter.id];
        const newBest = existing?.bestMoveCount ? Math.min(existing.bestMoveCount, currentMoves) : currentMoves;
        const newStars = existing?.stars ? Math.max(existing.stars, stars) : stars;

        return {
          ...prev,
          [activeChapter.id]: {
            chapterId: activeChapter.id,
            completed: true,
            bestMoveCount: newBest,
            stars: newStars,
          },
        };
      });

      syncSessionWithApi(currentMoves, stars);
      return;
    }

    if (currentChess.isStalemate() || currentChess.isDraw()) {
      soundService.playIllegal();
      setShowStalemate(true);
      setEvalScore(0);
      return;
    }

    if (currentChess.inCheck()) {
      soundService.playCheck();
    }
  }, [activeChapter.id, activeLevel.benchmarkMoves, syncSessionWithApi]);

  // Handle computer defending king move
  const triggerEngineMove = useCallback((currentChess: Chess, updatedWhiteCount: number) => {
    setIsEngineThinking(true);

    setTimeout(async () => {
      try {
        const bestMove = await stockfishService.getEngineMove(currentChess);
        if (bestMove) {
          const result = currentChess.move({
            from: bestMove.from,
            to: bestMove.to,
            promotion: bestMove.promotion || 'q',
          });

          if (result) {
            if (result.captured) {
              soundService.playCapture();
            } else {
              soundService.playMove();
            }

            const updated = new Chess(currentChess.fen());
            const newScore = evaluatePosition(updated);

            setLastMove({ from: result.from, to: result.to });
            setMoveHistory((prev) => [
              ...prev,
              {
                san: result.san,
                from: result.from,
                to: result.to,
                turn: 'b',
                fen: currentChess.fen(),
                evalScore: newScore,
              },
            ]);

            setChess(updated);
            setEvalScore(newScore);
            evaluateGameState(updated, updatedWhiteCount);
          }
        }
      } catch (err) {
        console.warn('Engine move error:', err);
      } finally {
        setIsEngineThinking(false);
      }
    }, 250);
  }, [evaluateGameState]);

  // Player makes a move - 100% INSTANT, NO LAG
  const handleMakeMove = (moveData: { from: string; to: string; promotion?: string }): boolean => {
    if (isEngineThinking || chess.isGameOver() || chess.turn() !== 'w') {
      return false;
    }

    try {
      const currentChess = new Chess(chess.fen());
      const moveResult = currentChess.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion || 'q',
      });

      if (!moveResult) {
        soundService.playIllegal();
        return false;
      }

      if (moveResult.captured) {
        soundService.playCapture();
      } else {
        soundService.playMove();
      }

      const scoreAfterMove = evaluatePosition(currentChess);

      let accuracy: MoveAccuracy = 'good';
      if (currentChess.isCheckmate()) {
        accuracy = 'brilliant';
      } else if (scoreAfterMove >= evalScore) {
        accuracy = 'best';
      } else if (currentChess.isStalemate()) {
        accuracy = 'blunder';
      }

      const newWhiteCount = whiteMoveCount + 1;
      setWhiteMoveCount(newWhiteCount);
      setLastMove({ from: moveResult.from, to: moveResult.to });
      setHintMove(null);
      setCurrentHint(null);

      const newHistory: MoveRecord[] = [
        ...moveHistory,
        {
          san: moveResult.san,
          from: moveResult.from,
          to: moveResult.to,
          turn: 'w',
          fen: currentChess.fen(),
          accuracy,
          evalScore: scoreAfterMove,
        },
      ];
      setMoveHistory(newHistory);
      setChess(currentChess);
      setEvalScore(scoreAfterMove);

      if (currentChess.isGameOver()) {
        evaluateGameState(currentChess, newWhiteCount);
        return true;
      }

      if (currentChess.inCheck()) {
        soundService.playCheck();
      }

      triggerEngineMove(currentChess, newWhiteCount);
      return true;
    } catch {
      soundService.playIllegal();
      return false;
    }
  };

  // Undo move pair
  const handleUndoMove = useCallback(() => {
    if (moveHistory.length === 0 || isEngineThinking) return;

    const newChess = new Chess(activeLevel.fen);
    let targetMovesToKeep = moveHistory.length;

    if (chess.turn() === 'w') {
      targetMovesToKeep = Math.max(0, moveHistory.length - 2);
    } else {
      targetMovesToKeep = Math.max(0, moveHistory.length - 1);
    }

    const trimmedHistory = moveHistory.slice(0, targetMovesToKeep);
    for (const record of trimmedHistory) {
      newChess.move({ from: record.from, to: record.to, promotion: 'q' });
    }

    setChess(newChess);
    setMoveHistory(trimmedHistory);
    setWhiteMoveCount(Math.ceil(trimmedHistory.length / 2));
    setLastMove(
      trimmedHistory.length > 0
        ? { from: trimmedHistory[trimmedHistory.length - 1].from, to: trimmedHistory[trimmedHistory.length - 1].to }
        : null
    );
    setHintMove(null);
    setCurrentHint(null);
    setEvalScore(evaluatePosition(newChess));
    setShowCelebration(false);
    setShowStalemate(false);
    soundService.playMove();
  }, [activeLevel.fen, chess, isEngineThinking, moveHistory]);

  // Hint button (queries Stockfish first, with heuristic fallback)
  const handleRequestHint = useCallback(async () => {
    if (chess.isGameOver() || isEngineThinking) return;

    try {
      const sfMove = await stockfishService.getEngineMove(chess, 10);
      if (sfMove) {
        const moves = chess.moves({ verbose: true });
        const matching = moves.find((m) => m.from === sfMove.from && m.to === sfMove.to);
        if (matching) {
          const fallbackHint = ChessEngineService.getHint(chess);
          let explanation = fallbackHint.hintExplanation;
          if (matching.san.includes('#')) {
            explanation = `Deliver checkmate with ${matching.san}!`;
          } else if (matching.piece === 'k') {
            explanation = `The defending King is boxed in on the edge! March your King to ${matching.to} to prepare the final checkmate.`;
          } else if (matching.piece === 'q') {
            explanation = `Position your Queen on ${matching.to} to restrict the King's escape squares while avoiding stalemate.`;
          }

          setCurrentHint({
            bestMove: `${matching.from}${matching.to}`,
            evalScore: fallbackHint.evalScore,
            hintExplanation: explanation,
          });
          setHintMove({ from: matching.from, to: matching.to });
          return;
        }
      }
    } catch {
      // Fallback to heuristic
    }

    const hint = ChessEngineService.getHint(chess);
    setCurrentHint(hint);
    if (hint.bestMove) {
      const from = hint.bestMove.substring(0, 2);
      const to = hint.bestMove.substring(2, 4);
      setHintMove({ from, to });
    }
  }, [chess, isEngineThinking]);

  // Advance to next exercise
  const handleNextExercise = () => {
    setShowCelebration(false);
    const currentLvlIndex = activeChapter.levels.findIndex((lvl) => lvl.id === activeLevel.id);

    if (currentLvlIndex !== -1 && currentLvlIndex < activeChapter.levels.length - 1) {
      const nextLvl = activeChapter.levels[currentLvlIndex + 1];
      setActiveLevel(nextLvl);
      loadLevel(nextLvl);
    } else {
      const currentChapIndex = PRACTICE_CHAPTERS.findIndex((c) => c.id === activeChapter.id);
      const nextChap = PRACTICE_CHAPTERS[(currentChapIndex + 1) % PRACTICE_CHAPTERS.length];
      setActiveChapter(nextChap);
      setActiveLevel(nextChap.levels[0]);
      loadLevel(nextChap.levels[0]);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowLeft') {
        handleUndoMove();
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'ArrowRight') {
        handleRequestHint();
      } else if (e.key === 'r' || e.key === 'R') {
        loadLevel(activeLevel);
      } else if (e.key === 'Escape') {
        setIsSidebarOpen(false);
        setShowCelebration(false);
        setShowStalemate(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndoMove, handleRequestHint, loadLevel, activeLevel]);

  // Stats calculation
  const totalStars = useMemo(
    () => Object.values(progressMap).reduce((sum, p) => sum + (p.stars || 0), 0),
    [progressMap]
  );
  const completedChaptersCount = useMemo(
    () => Object.values(progressMap).filter((p) => p.completed).length,
    [progressMap]
  );

  // Computed FEN for history timeline scrubbing
  const displayFen = useMemo(() => {
    if (viewingIndex === null) return undefined;
    if (viewingIndex === -1) return activeLevel.fen;
    if (viewingIndex >= 0 && viewingIndex < moveHistory.length) {
      return moveHistory[viewingIndex].fen;
    }
    return undefined;
  }, [viewingIndex, activeLevel.fen, moveHistory]);

  return (
    <div className="min-h-screen bg-lichess-dark text-gray-200 flex flex-col font-sans">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        totalStars={totalStars}
        completedChaptersCount={completedChaptersCount}
        totalChaptersCount={PRACTICE_CHAPTERS.length}
        onResetAllProgress={() => setProgressMap({})}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Practice Chapters Drawer (Accessible via Chapters button) */}
        <ChapterSidebar
          chapters={PRACTICE_CHAPTERS}
          activeChapter={activeChapter}
          activeLevel={activeLevel}
          onSelectChapter={handleSelectChapter}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          progressMap={progressMap}
        />

        {/* Main Chessboard & Study Area - Responsive Side-by-Side on md: screens */}
        <main className="flex-1 flex flex-col md:flex-row items-center md:items-start justify-center p-2 sm:p-4 gap-3 sm:gap-6 overflow-y-auto">
          {/* Board Container */}
          <div className="w-full md:flex-1 max-w-[500px] flex justify-center">
            <ChessboardView
              chess={chess}
              onMakeMove={handleMakeMove}
              theme={currentTheme}
              isEngineThinking={isEngineThinking}
              hintMove={hintMove}
              lastMove={lastMove}
              isCheck={chess.inCheck()}
              evalScore={evalScore}
              displayFen={displayFen}
              isReplaying={viewingIndex !== null}
            />
          </div>

          {/* Clean Study Panel on Right */}
          <PracticePanel
            chapters={PRACTICE_CHAPTERS}
            chapter={activeChapter}
            level={activeLevel}
            moveHistory={moveHistory}
            moveCount={whiteMoveCount}
            isCheck={chess.inCheck()}
            isCheckmate={chess.isCheckmate()}
            isStalemate={chess.isStalemate() || chess.isDraw()}
            isEngineThinking={isEngineThinking}
            onUndoMove={handleUndoMove}
            onRestartLevel={() => loadLevel(activeLevel)}
            onRequestHint={handleRequestHint}
            currentHint={currentHint}
            onSelectChapter={handleSelectChapter}
            progressMap={progressMap}
            viewingIndex={viewingIndex}
            onNavigateHistory={setViewingIndex}
            elapsedSeconds={elapsedSeconds}
            currentFen={chess.fen()}
          />
        </main>
      </div>

      {/* Checkmate Victory Modal with Lichess Post-Game Accuracy Curve */}
      <CelebrationModal
        isOpen={showCelebration}
        chapter={activeChapter}
        level={activeLevel}
        moveCount={whiteMoveCount}
        moveHistory={moveHistory}
        elapsedSeconds={elapsedSeconds}
        onNextChapter={handleNextExercise}
        onRestart={() => loadLevel(activeLevel)}
      />

      {/* Stalemate Warning Modal */}
      <StalemateModal
        isOpen={showStalemate}
        onUndo={handleUndoMove}
        onRestart={() => loadLevel(activeLevel)}
      />
    </div>
  );
};

export default App;
