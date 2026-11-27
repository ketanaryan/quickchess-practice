import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PRACTICE_CHAPTERS } from '../src/data/chaptersData.js';
import { Chess } from 'chess.js';
import { sanitizeAndValidateFen } from '../src/middleware/security.js';

describe('Backend API and Data Integrity', () => {
  test('PRACTICE_CHAPTERS includes all piece checkmate chapters', () => {
    assert.strictEqual(PRACTICE_CHAPTERS.length, 6);
    const ids = PRACTICE_CHAPTERS.map(c => c.id);
    assert.ok(ids.includes('queen-mate'));
    assert.ok(ids.includes('two-rooks-mate'));
    assert.ok(ids.includes('rook-mate'));
  });

  test('All chapter levels have valid FEN strings and are playable', () => {
    for (const chapter of PRACTICE_CHAPTERS) {
      for (const level of chapter.levels) {
        const chess = new Chess(level.fen);
        assert.strictEqual(chess.turn(), 'w');
        assert.strictEqual(chess.isGameOver(), false);
        assert.ok(chess.moves().length > 0);
      }
    }
  });

  test('Chess evaluation of terminal state', () => {
    const mateChess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    assert.strictEqual(mateChess.isCheckmate(), true);

    const stalemateChess = new Chess('k7/2Q5/2K5/8/8/8/8/8 b - - 0 1');
    assert.strictEqual(stalemateChess.isStalemate(), true);
  });
});

describe('Security Hardening & Input Sanitization', () => {
  test('Sanitizes and accepts valid chess FEN strings', () => {
    const validFen = '8/8/8/4k3/8/8/8/3Q3K w - - 0 1';
    const result = sanitizeAndValidateFen(validFen);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitizedFen, validFen);
  });

  test('Rejects oversized or buffer-bloat FEN strings', () => {
    const longMaliciousFen = '8/8/8/4k3/8/8/8/3Q3K w - - 0 1' + 'A'.repeat(200);
    const result = sanitizeAndValidateFen(longMaliciousFen);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('bounds'));
  });

  test('Rejects FEN with illegal king counts (ReDoS/illegal position prevention)', () => {
    // 2 White Kings
    const twoKingsFen = '8/8/8/4k3/8/8/8/3QKK2 w - - 0 1';
    const result = sanitizeAndValidateFen(twoKingsFen);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('King'));
  });

  test('Rejects malformed token counts in FEN', () => {
    const invalidTokens = '8/8/8/4k3/8/8/8/3Q3K';
    const result = sanitizeAndValidateFen(invalidTokens);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('tokens'));
  });
});
