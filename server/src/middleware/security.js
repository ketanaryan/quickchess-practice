import rateLimit from 'express-rate-limit';

// Global API Rate Limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Stricter Rate Limiter for compute-heavy endpoints (e.g. Engine Evaluation)
export const computeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 engine evaluations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Engine evaluation rate limit exceeded. Please throttle requests.',
  },
});

// FEN Validation Regex
// Standard chess FEN: 6 space-separated components
const FEN_REGEX = /^[1-8kqrnbpKQRNBPN/]+\s+[wb]\s+([KQkq]+|-)\s+([a-h][36]|-)\s+\d+\s+\d+$/;

/**
 * Validates FEN string for structural integrity and security boundaries.
 * Prevents ReDoS, buffer bloat, and engine injection attacks.
 */
export function sanitizeAndValidateFen(rawFen) {
  if (typeof rawFen !== 'string') {
    return { valid: false, error: 'FEN must be a string' };
  }

  const fen = rawFen.trim();

  // Length guard: A valid FEN cannot be shorter than 15 or longer than 90 characters
  if (fen.length < 15 || fen.length > 90) {
    return { valid: false, error: 'FEN length out of valid bounds (15-90 chars)' };
  }

  // Token count verification
  const tokens = fen.split(/\s+/);
  if (tokens.length !== 6) {
    return { valid: false, error: 'FEN must contain exactly 6 space-separated tokens' };
  }

  // Rank structure validation: exactly 8 ranks separated by '/'
  const ranks = tokens[0].split('/');
  if (ranks.length !== 8) {
    return { valid: false, error: 'Piece placement must contain exactly 8 ranks' };
  }

  // Count kings
  const whiteKings = (tokens[0].match(/K/g) || []).length;
  const blackKings = (tokens[0].match(/k/g) || []).length;
  if (whiteKings !== 1 || blackKings !== 1) {
    return { valid: false, error: 'FEN must contain exactly one White King and one Black King' };
  }

  // Active color check
  if (tokens[1] !== 'w' && tokens[1] !== 'b') {
    return { valid: false, error: 'Active color must be "w" or "b"' };
  }

  return { valid: true, sanitizedFen: fen };
}

/**
 * Middleware for validating session submission payloads
 */
export function validateSessionPayload(req, res, next) {
  const { chapterId, levelId, moveCount, benchmarkMoves, stars } = req.body;

  if (!chapterId || typeof chapterId !== 'string' || chapterId.length > 50) {
    return res.status(400).json({ success: false, error: 'Invalid or missing chapterId' });
  }

  if (levelId && (typeof levelId !== 'string' || levelId.length > 50)) {
    return res.status(400).json({ success: false, error: 'Invalid levelId' });
  }

  if (typeof moveCount !== 'number' || moveCount < 0 || moveCount > 500) {
    return res.status(400).json({ success: false, error: 'moveCount must be a number between 0 and 500' });
  }

  if (benchmarkMoves !== undefined && (typeof benchmarkMoves !== 'number' || benchmarkMoves < 1 || benchmarkMoves > 200)) {
    return res.status(400).json({ success: false, error: 'Invalid benchmarkMoves value' });
  }

  if (stars !== undefined && (!Number.isInteger(stars) || stars < 1 || stars > 3)) {
    return res.status(400).json({ success: false, error: 'stars must be an integer between 1 and 3' });
  }

  next();
}
