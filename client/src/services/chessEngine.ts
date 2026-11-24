import { Chess, Move, Square } from 'chess.js';

export interface MoveAnalysis {
  bestMove: string | null;
  evalScore: number;
  hintExplanation?: string;
}

// Distance between two squares
function getDistance(sq1: Square, sq2: Square): number {
  const f1 = sq1.charCodeAt(0) - 97;
  const r1 = parseInt(sq1[1], 10) - 1;
  const f2 = sq2.charCodeAt(0) - 97;
  const r2 = parseInt(sq2[1], 10) - 1;
  return Math.max(Math.abs(f1 - f2), Math.abs(r1 - r2));
}

// Check if a square is on the perimeter edge of the board
function isEdgeSquare(sq: Square): boolean {
  const f = sq.charCodeAt(0) - 97;
  const r = parseInt(sq[1], 10) - 1;
  return f === 0 || f === 7 || r === 0 || r === 7;
}

// Fast endgame evaluation function (pedagogically calibrated for checkmate drills)
export function evaluatePosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -100000 : 100000;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return -50000;
  }

  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whiteKingSq: Square | null = null;
  let blackKingSq: Square | null = null;

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = 0;
      switch (piece.type) {
        case 'p': val = 100; break;
        case 'n': val = 320; break;
        case 'b': val = 330; break;
        case 'r': val = 500; break;
        case 'q': val = 950; break;
        case 'k': val = 20000; break;
      }

      const sq = (String.fromCharCode(97 + c) + (8 - r)) as Square;

      if (piece.color === 'w') {
        whiteMaterial += val;
        if (piece.type === 'k') whiteKingSq = sq;
      } else {
        blackMaterial += val;
        if (piece.type === 'k') blackKingSq = sq;
      }
    }
  }

  let score = whiteMaterial - blackMaterial;

  if (blackKingSq && whiteKingSq) {
    const bf = blackKingSq.charCodeAt(0) - 97;
    const br = parseInt(blackKingSq[1], 10) - 1;
    const distFromCenter = Math.abs(bf - 3.5) + Math.abs(br - 3.5);
    score += distFromCenter * 40; // Push enemy king to the rim

    const isBlackOnEdge = isEdgeSquare(blackKingSq);
    const kingDistance = getDistance(whiteKingSq, blackKingSq);

    if (isBlackOnEdge) {
      // CRITICAL ENDGAME RULE:
      // When the defending king is trapped on the edge, the attacking King MUST march up!
      score += 250;
      score -= kingDistance * 75; // Heavy weight to bring White King close
    } else {
      score -= kingDistance * 15;
    }

    if (chess.turn() === 'b') {
      const movesCount = chess.moves().length;
      score -= movesCount * 20; // Restrict mobility
    }
  }

  return score;
}

// Lightweight Minimax with Alpha-Beta
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove: string | null } {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluatePosition(chess), bestMove: null };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluatePosition(chess), bestMove: null };
  }

  // Smart Move Ordering:
  // Checkmates first, then checks that matter, then king moves
  moves.sort((a, b) => {
    let scoreA = (a.captured ? 10 : 0) + (a.san.includes('#') ? 100 : 0);
    let scoreB = (b.captured ? 10 : 0) + (b.san.includes('#') ? 100 : 0);
    return scoreB - scoreA;
  });

  let bestMove: string | null = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      let evalResult = minimax(chess, depth - 1, alpha, beta, false);

      // Penalize pointless repetitive checks on an already-trapped edge king
      if (move.san.includes('+') && !move.san.includes('#')) {
        const board = chess.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === 'b') {
              const sq = (String.fromCharCode(97 + c) + (8 - r)) as Square;
              if (isEdgeSquare(sq)) {
                evalResult.score -= 350; // Heavily penalize shuffling checks!
              }
            }
          }
        }
      }

      chess.undo();

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move.lan;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalResult = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move.lan;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, bestMove };
  }
}

export class ChessEngineService {
  /**
   * Fast defensive move calculation for defending King
   */
  public static getBestDefensiveMove(chess: Chess, searchDepth: number = 2): Move | null {
    if (chess.isGameOver()) return null;

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0];

    const isMaximizing = chess.turn() === 'w';
    const result = minimax(chess, searchDepth, -Infinity, Infinity, isMaximizing);

    if (result.bestMove) {
      const foundMove = moves.find((m) => m.lan === result.bestMove);
      if (foundMove) return foundMove;
    }

    // High-speed fallback
    return moves[0];
  }

  /**
   * Generates a pedagogical, optimal hint for the attacking player
   */
  public static getHint(chess: Chess): MoveAnalysis {
    if (chess.isGameOver()) {
      return { bestMove: null, evalScore: 0, hintExplanation: 'The game has ended.' };
    }

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) {
      return { bestMove: null, evalScore: 0, hintExplanation: 'No legal moves available.' };
    }

    // Check if black king is already trapped on an edge
    let blackKingSq: Square | null = null;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === 'b') {
          blackKingSq = (String.fromCharCode(97 + c) + (8 - r)) as Square;
        }
      }
    }

    const isBlackOnEdge = blackKingSq ? isEdgeSquare(blackKingSq) : false;

    // Search depth 2 with our anti-shuffling penalty
    const searchResult = minimax(chess, 2, -Infinity, Infinity, true);
    const bestMoveLan = searchResult.bestMove || moves[0].lan;
    const bestMove = moves.find((m) => m.lan === bestMoveLan) || moves[0];

    let explanation = `Play ${bestMove.san}.`;
    if (bestMove.san.includes('#')) {
      explanation = `Deliver checkmate with ${bestMove.san}! Checkmate!`;
    } else if (bestMove.piece === 'k') {
      if (isBlackOnEdge) {
        explanation = `The enemy King is trapped on the edge! March your King to ${bestMove.to} to support the checkmating move.`;
      } else {
        explanation = `Step your King to ${bestMove.to} to support your pieces and control escape squares.`;
      }
    } else if (bestMove.piece === 'q') {
      if (isBlackOnEdge) {
        explanation = `Keep your Queen controlling the exit lines on ${bestMove.to} while your King marches in. Avoid stalemate!`;
      } else {
        explanation = `Move your Queen to ${bestMove.to} to shrink the defending king's cage.`;
      }
    } else if (bestMove.piece === 'r') {
      if (isBlackOnEdge) {
        explanation = `Your Rook cuts off the king. Bring your King forward to achieve opposition!`;
      } else {
        explanation = `Cut off a rank or file with your Rook on ${bestMove.to}.`;
      }
    } else if (bestMove.piece === 'b') {
      explanation = `Control key escape diagonals with your Bishop on ${bestMove.to}.`;
    } else if (bestMove.piece === 'n') {
      explanation = `Maneuver your Knight to ${bestMove.to} to seal escape squares.`;
    }

    return {
      bestMove: bestMove.lan,
      evalScore: searchResult.score,
      hintExplanation: explanation,
    };
  }
}
