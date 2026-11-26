import mongoose from 'mongoose';

let isConnected = false;

export async function initDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quick_chess';

  try {
    // Attempt connection with a strict 2-second timeout to avoid blocking server start
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    isConnected = true;
    console.log('[Database] MongoDB connected successfully via Mongoose.');
  } catch (err) {
    isConnected = false;
    console.log('[Database] No active MongoDB daemon detected.');
    console.log('[Database] Gracefully activated Resilient File-Backed Persistence Store.');
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
