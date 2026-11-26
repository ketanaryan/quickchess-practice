import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PracticeSession } from '../models/PracticeSession.js';
import { isMongoConnected } from '../db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists for file persistence
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]), 'utf-8');
  }
} catch {
  // Ignored if file system restricted
}

function readLocalSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(data) || [];
    }
  } catch {
    // Return empty array
  }
  return [];
}

function saveLocalSession(record) {
  try {
    const list = readLocalSessions();
    list.push(record);
    if (list.length > 1000) list.shift();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist local session to file:', err.message);
  }
}

export class SessionService {
  static async recordSession(data) {
    const sessionData = {
      chapterId: data.chapterId,
      levelId: data.levelId || 'default',
      moveCount: data.moveCount,
      benchmarkMoves: data.benchmarkMoves || 10,
      stars: data.stars || (data.moveCount <= data.benchmarkMoves ? 3 : data.moveCount <= Math.ceil(data.benchmarkMoves * 1.5) ? 2 : 1),
      accuracy: data.accuracy || 100,
      timeElapsedSeconds: data.timeElapsedSeconds || null,
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        const doc = await PracticeSession.create(sessionData);
        return { ...doc.toObject(), storage: 'mongodb' };
      } catch (err) {
        console.warn('Mongo insert failed, saving to file fallback:', err.message);
      }
    }

    // File-backed persistence fallback
    const fallbackRecord = {
      ...sessionData,
      _id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      storage: 'persistent_json_file',
    };
    saveLocalSession(fallbackRecord);
    return fallbackRecord;
  }

  static async getStats(chapters) {
    let allSessions = [];

    if (isMongoConnected()) {
      try {
        allSessions = await PracticeSession.find().sort({ createdAt: -1 }).limit(500).lean();
      } catch {
        allSessions = readLocalSessions();
      }
    } else {
      allSessions = readLocalSessions();
    }

    const totalCompleted = allSessions.length;
    const totalStars = allSessions.reduce((acc, s) => acc + (s.stars || 0), 0);

    const chapterStats = chapters.map((ch) => {
      const chSessions = allSessions.filter((s) => s.chapterId === ch.id);
      const bestMove = chSessions.length > 0 ? Math.min(...chSessions.map((s) => s.moveCount)) : null;
      return {
        chapterId: ch.id,
        title: ch.title,
        attempts: chSessions.length,
        bestMoveCount: bestMove,
      };
    });

    return {
      storageEngine: isMongoConnected() ? 'MongoDB (Mongoose)' : 'Resilient File Store (JSON)',
      totalCompleted,
      totalStars,
      recentSessions: allSessions.slice(0, 10),
      chapterBreakdown: chapterStats,
    };
  }
}
