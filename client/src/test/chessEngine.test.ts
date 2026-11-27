import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { ChessEngineService } from '../services/chessEngine';
import { PRACTICE_CHAPTERS } from '../data/chapters';

describe('ChessEngineService and Rules', () => {
  it('correctly detects checkmate position', () => {
    // Fool's mate position: 1. f3 e5 2. g4 Qh4#
    const chess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it('correctly detects stalemate position', () => {
    // Classic stalemate position: Black king on a8, White queen on c7, White king on c6
    const chess = new Chess('k7/2Q5/2K5/8/8/8/8/8 b - - 0 1');
    expect(chess.isStalemate()).toBe(true);
    expect(chess.isCheckmate()).toBe(false);
    expect(chess.isGameOver()).toBe(true);
  });

  it('generates a valid legal defensive move for defending king', () => {
    // Queen mate starting position
    const chess = new Chess('8/8/8/4k3/8/8/8/3Q3K b - - 0 1');
    const bestMove = ChessEngineService.getBestDefensiveMove(chess, 2);

    expect(bestMove).not.toBeNull();
    if (bestMove) {
      expect(['e4', 'e6', 'd6', 'd5', 'd4', 'f4', 'f5', 'f6']).toContain(bestMove.to);
    }
  });

  it('generates an instructional hint for the attacking player', () => {
    const chess = new Chess('8/8/8/4k3/8/8/8/3Q3K w - - 0 1');
    const hint = ChessEngineService.getHint(chess);

    expect(hint).toBeDefined();
    expect(hint.bestMove).toBeTruthy();
    expect(hint.hintExplanation).toBeTypeOf('string');
    expect(hint.hintExplanation!.length).toBeGreaterThan(5);
  });
});

describe('Practice Chapters Integrity', () => {
  it('contains all 6 piece checkmate chapters', () => {
    expect(PRACTICE_CHAPTERS.length).toBe(6);
    const chapterIds = PRACTICE_CHAPTERS.map(c => c.id);
    expect(chapterIds).toContain('queen-mate');
    expect(chapterIds).toContain('two-rooks-mate');
    expect(chapterIds).toContain('rook-mate');
    expect(chapterIds).toContain('two-bishops-mate');
    expect(chapterIds).toContain('bishop-knight-mate');
    expect(chapterIds).toContain('arabian-mate');
  });

  it('ensures every level in every chapter has a valid FEN and legal setup', () => {
    for (const chapter of PRACTICE_CHAPTERS) {
      expect(chapter.levels.length).toBeGreaterThan(0);
      for (const level of chapter.levels) {
        // Must parse cleanly in chess.js without throwing error
        const chess = new Chess(level.fen);
        expect(chess.turn()).toBe('w'); // White must have first move
        expect(chess.isGameOver()).toBe(false); // Practice should not start in game over
        expect(level.benchmarkMoves).toBeGreaterThan(0);
      }
    }
  });
});
