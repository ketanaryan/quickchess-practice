import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { Chess } from 'chess.js';
import { PRACTICE_CHAPTERS } from './data/chaptersData.js';
import {
  globalLimiter,
  computeLimiter,
  sanitizeAndValidateFen,
  validateSessionPayload,
} from './middleware/security.js';
import { initDatabase, isMongoConnected } from './db/connection.js';
import { SessionService } from './services/sessionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize Database (MongoDB with resilient fallback)
initDatabase();

// Security Middleware: Helmet with hardened Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:*', 'https://cdnjs.cloudflare.com'],
        workerSrc: ["'self'", 'blob:', 'https://cdnjs.cloudflare.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Policy
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// Body Parser with strict 10kb limit to prevent payload flooding
app.use(express.json({ limit: '10kb' }));

// Apply Global Rate Limiting
app.use('/api', globalLimiter);

// Real-Time Socket.IO Integration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.emit('connected', {
    status: 'online',
    socketId: socket.id,
    database: isMongoConnected() ? 'MongoDB' : 'FileStore',
    timestamp: new Date().toISOString(),
  });

  socket.on('analyze_position', (data) => {
    try {
      const { fen } = data || {};
      const validation = sanitizeAndValidateFen(fen);
      if (!validation.valid) {
        socket.emit('analysis_error', { error: validation.error });
        return;
      }

      const chess = new Chess(validation.sanitizedFen);
      const moves = chess.moves({ verbose: true });

      socket.emit('analysis_result', {
        fen: validation.sanitizedFen,
        turn: chess.turn(),
        isGameOver: chess.isGameOver(),
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        legalMovesCount: moves.length,
        timestamp: Date.now(),
      });
    } catch {
      socket.emit('analysis_error', { error: 'Internal evaluation error' });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Quick Chess For You - Checkmate Practice API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: isMongoConnected() ? 'connected (MongoDB/Mongoose)' : 'active (Persistent File Store)',
    timestamp: new Date().toISOString(),
  });
});

// Get all chapters
app.get('/api/chapters', (req, res) => {
  res.json({
    success: true,
    count: PRACTICE_CHAPTERS.length,
    data: PRACTICE_CHAPTERS,
  });
});

// Get specific chapter
app.get('/api/chapters/:id', (req, res) => {
  const chapter = PRACTICE_CHAPTERS.find((c) => c.id === req.params.id);
  if (!chapter) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }
  res.json({ success: true, data: chapter });
});

// Record practice completion session with Mongoose / Persistent Storage
app.post('/api/practice/session', validateSessionPayload, async (req, res) => {
  try {
    const record = await SessionService.recordSession(req.body);
    res.status(201).json({
      success: true,
      message: 'Practice session recorded successfully',
      data: record,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to record session' });
  }
});

// Get global practice statistics
app.get('/api/practice/stats', async (req, res) => {
  try {
    const stats = await SessionService.getStats(PRACTICE_CHAPTERS);
    res.json({
      success: true,
      data: stats,
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
  }
});

// Engine position evaluation endpoint with rate limiter and FEN validation
app.post('/api/engine/evaluate', computeLimiter, (req, res) => {
  const { fen } = req.body;
  const validation = sanitizeAndValidateFen(fen);

  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  try {
    const chess = new Chess(validation.sanitizedFen);
    const moves = chess.moves({ verbose: true });

    res.json({
      success: true,
      data: {
        fen: validation.sanitizedFen,
        turn: chess.turn(),
        isGameOver: chess.isGameOver(),
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        legalMovesCount: moves.length,
        legalMoves: moves.map((m) => ({ san: m.san, from: m.from, to: m.to })),
      },
    });
  } catch {
    res.status(400).json({ success: false, error: 'Failed to parse FEN notation' });
  }
});

// Serve frontend static files in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Quick Chess For You API is running.');
    }
  });
});

// Centralized Error Handling Middleware: Prevents stack trace disclosure
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Malformed JSON payload' });
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: isProd ? 'Internal server error' : err.message || 'Internal server error',
  });
});

server.listen(PORT, () => {
  console.log(`[Quick Chess For You] Backend running on port ${PORT}`);
});
