export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type MoveAccuracy = 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'blunder';

export interface ChapterLevel {
  id: string;
  name: string;
  fen: string;
  description: string;
  benchmarkMoves: number;
}

export interface PracticeChapter {
  id: string;
  title: string;
  subtitle: string;
  difficulty: DifficultyLevel;
  icon: string;
  description: string;
  strategyGuide: string[];
  commonPitfall: string;
  levels: ChapterLevel[];
}

export interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  bestMoveCount: number;
  stars: number; // 1, 2, or 3
}

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  turn: 'w' | 'b';
  fen: string;
  accuracy?: MoveAccuracy;
  evalScore?: number;
}
