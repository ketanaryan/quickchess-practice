import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, Move } from 'chess.js';
import { BoardTheme } from '../constants/boardThemes';

interface ChessboardViewProps {
  chess: Chess;
  onMakeMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  theme: BoardTheme;
  isEngineThinking: boolean;
  hintMove: { from: string; to: string } | null;
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
}

export const ChessboardView: React.FC<ChessboardViewProps> = ({
  chess,
  onMakeMove,
  theme,
  isEngineThinking,
  hintMove,
  lastMove,
  isCheck,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState<number>(480);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  // Responsive board sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newWidth = Math.min(containerWidth - 32, 540);
        setBoardWidth(Math.max(newWidth, 280));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Generate legal move indicators for clicked square
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

    // Highlight selected piece square
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    setOptionSquares(newSquares);
    return true;
  };

  const onSquareClick = (square: Square) => {
    if (isEngineThinking) return;

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
    if (isEngineThinking || !targetSquare) return false;

    const success = onMakeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    setSelectedSquare(null);
    setOptionSquares({});
    return success;
  };

  // Custom square styles (last move, check, hint, selection)
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };

    if (lastMove) {
      styles[lastMove.from] = {
        ...(styles[lastMove.from] || {}),
        backgroundColor: 'rgba(255, 240, 100, 0.45)',
      };
      styles[lastMove.to] = {
        ...(styles[lastMove.to] || {}),
        backgroundColor: 'rgba(255, 240, 100, 0.45)',
      };
    }

    if (hintMove) {
      styles[hintMove.from] = {
        ...(styles[hintMove.from] || {}),
        backgroundColor: 'rgba(56, 189, 248, 0.55)',
        boxShadow: 'inset 0 0 0 3px #0284c7',
      };
      styles[hintMove.to] = {
        ...(styles[hintMove.to] || {}),
        backgroundColor: 'rgba(56, 189, 248, 0.55)',
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
      className="flex flex-col items-center justify-center p-2 sm:p-4 select-none relative w-full"
    >
      <div
        className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-lichess-border/80 bg-lichess-dark flex items-center justify-center"
        style={{ width: boardWidth, height: boardWidth }}
      >
        <Chessboard
          options={{
            position: chess.fen(),
            boardOrientation: 'white',
            boardStyle: {
              width: `${boardWidth}px`,
              height: `${boardWidth}px`,
            },
            darkSquareStyle: { backgroundColor: theme.darkSquare },
            lightSquareStyle: { backgroundColor: theme.lightSquare },
            squareStyles: customSquareStyles,
            arrows: customArrows,
            allowDragging: !isEngineThinking && !chess.isGameOver(),
            animationDurationInMs: 220,
            onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
            onSquareClick: ({ square }) => onSquareClick(square as Square),
          }}
        />

        {/* Engine thinking overlay indicator */}
        {isEngineThinking && (
          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700 flex items-center gap-2 shadow-lg animate-fade-in pointer-events-none z-20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs text-gray-200 font-medium">Computer moving...</span>
          </div>
        )}
      </div>

      {/* Board bottom coordinates helper note */}
      <div className="flex items-center justify-between w-full max-w-[540px] px-2 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-400 inline-block" />
          <span>You play White</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-black border border-gray-700 inline-block" />
          <span>Computer defends Black</span>
        </span>
      </div>
    </div>
  );
};
