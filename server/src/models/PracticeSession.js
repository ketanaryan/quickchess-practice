import mongoose from 'mongoose';

const practiceSessionSchema = new mongoose.Schema(
  {
    chapterId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    levelId: {
      type: String,
      required: true,
      trim: true,
    },
    moveCount: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
    },
    benchmarkMoves: {
      type: Number,
      required: true,
      min: 1,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    timeElapsedSeconds: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for rapid chapter stats lookups
practiceSessionSchema.index({ chapterId: 1, stars: -1, moveCount: 1 });

export const PracticeSession =
  mongoose.models.PracticeSession || mongoose.model('PracticeSession', practiceSessionSchema);
