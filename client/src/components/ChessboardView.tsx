import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, Move } from 'chess.js';
import { BoardTheme } from '../constants/boardThemes';
import { EvaluationBar } from './EvaluationBar';

interface ChessboardViewProps {
  chess: Chess;
  onMakeMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  theme: BoardTheme;
  isEngineThinking: boolean;
  hintMove: { from: string; to: string } | null;
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  evalScore: number;
  displayFen?: string;
  isReplaying?: boolean;
}

export const ChessboardView: React.FC<ChessboardViewProps> = ({
  chess,
  onMakeMove,
  theme,
  isEngineThinking,
  hintMove,
  lastMove,
  isCheck,
  evalScore,
  displayFen,
  isReplaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState<number>(380);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  // Responsive board sizing: optimized for split-screen window
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const availableHeight = window.innerHeight - 180;
        const maxFromWidth = containerWidth - 36;
        const target = Math.min(maxFromWidth, availableHeight, 460);
        setBoardWidth(Math.max(target, 260));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Find king square if in check
  const checkSquare = useMemo(() => {
    if (!isCheck) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return (String.fromCharCode(97 + c) + (8 - r)) as Square;
        }
      }
    }
    return null;
  }, [chess, isCheck]);

  // Generate legal move indicators
  const getMoveOptions = (square: Square) => {
    const moves = chess.moves({
      square,
      verbose: true,
    }) as Move[];

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      const isCapture = chess.get(move.to as Square);
      newSquares[move.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(20, 180, 80, 0.6) 24%, transparent 24%)',
        borderRadius: '50%',
        cursor: 'pointer',
      };
    });

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    setOptionSquares(newSquares);
    return true;
  };

  const onSquareClick = (square: Square) => {
    if (isEngineThinking || isReplaying) return;

    if (selectedSquare) {
      const moves = chess.moves({
        square: selectedSquare,
        verbose: true,
      }) as Move[];

      const foundMove = moves.find((m) => m.to === square);
      if (foundMove) {
        onMakeMove({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      getMoveOptions(square);
    } else {
      setSelectedSquare(null);
      setOptionSquares({});
    }
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string | null): boolean => {
    if (isEngineThinking || !targetSquare || isReplaying) return false;

    const success = onMakeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    setSelectedSquare(null);
    setOptionSquares({});
    return success;
  };

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };

    if (lastMove) {
      styles[lastMove.from] = {
        ...(styles[lastMove.from] || {}),
        background: 'rgba(255, 240, 100, 0.45)',
      };
      styles[lastMove.to] = {
        ...(styles[lastMove.to] || {}),
        background: 'rgba(255, 240, 100, 0.45)',
      };
    }

    if (hintMove) {
      styles[hintMove.from] = {
        ...(styles[hintMove.from] || {}),
        background: 'rgba(56, 189, 248, 0.55)',
        boxShadow: 'inset 0 0 0 3px #0284c7',
      };
      styles[hintMove.to] = {
        ...(styles[hintMove.to] || {}),
        background: 'rgba(56, 189, 248, 0.55)',
        boxShadow: 'inset 0 0 0 3px #0284c7',
      };
    }

    if (checkSquare) {
      styles[checkSquare] = {
        ...(styles[checkSquare] || {}),
        background: 'radial-gradient(ellipse at center, red 0%, rgba(255,0,0,0.85) 45%, rgba(169,0,0,0) 80%)',
      };
    }

    return styles;
  }, [optionSquares, lastMove, hintMove, checkSquare]);

  const customArrows = useMemo(() => {
    if (hintMove) {
      return [
        {
          startSquare: hintMove.from,
          endSquare: hintMove.to,
          color: 'rgb(14, 165, 233)',
        },
      ];
    }
    return [];
  }, [hintMove]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center p-1 sm:p-3 select-none relative w-full"
    >
      <div className="flex items-center justify-center">
        <EvaluationBar
          score={evalScore}
          isCheckmate={chess.isCheckmate()}
          isStalemate={chess.isStalemate() || chess.isDraw()}
          height={boardWidth}
        />

        <div
          className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-lichess-border/80 bg-lichess-dark flex items-center justify-center"
          style={{ width: boardWidth, height: boardWidth }}
        >
          <Chessboard
            options={{
              position: displayFen || chess.fen(),
              boardOrientation: 'white',
              boardStyle: {
                width: `${boardWidth}px`,
                height: `${boardWidth}px`,
              },
              darkSquareStyle: { backgroundColor: theme.darkSquare },
              lightSquareStyle: { backgroundColor: theme.lightSquare },
              squareStyles: isReplaying ? {} : customSquareStyles,
              arrows: isReplaying ? [] : customArrows,
              allowDragging: !isEngineThinking && !chess.isGameOver() && !isReplaying,
              animationDurationInMs: 180,
              onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
              onSquareClick: ({ square }) => onSquareClick(square as Square),
            }}
          />

          {isReplaying && (
            <div className="absolute top-2 left-2 bg-blue-950/90 text-blue-300 border border-blue-500/50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg pointer-events-none z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Timeline Review</span>
            </div>
          )}

          {isEngineThinking && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-700 flex items-center gap-1.5 shadow-lg pointer-events-none z-20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] text-gray-200 font-medium">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex items-center justify-between px-2 mt-1.5 text-[11px] text-gray-400"
        style={{ width: boardWidth }}
      >
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white border border-gray-400 inline-block" />
          <span>You (White)</span>
        </span>
        <span className="hidden sm:inline text-gray-400">
          <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-300">←</kbd> Undo, <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-300">H</kbd> Hint, <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-300">R</kbd> Restart
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-black border border-gray-700 inline-block" />
          <span>Computer (Black)</span>
        </span>
      </div>
    </div>
  );
};
