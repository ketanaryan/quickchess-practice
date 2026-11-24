import { Chess } from 'chess.js';
import { ChessEngineService } from './chessEngine';

export class StockfishService {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private isStockfishActive: boolean = false;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    try {
      // Stockfish.js from standard CDN as worker
      const stockfishWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';
      
      // Attempt to load stockfish in Web Worker
      const workerBlob = new Blob(
        [`importScripts("${stockfishWorkerUrl}");`],
        { type: 'application/javascript' }
      );
      const blobUrl = URL.createObjectURL(workerBlob);
      this.worker = new Worker(blobUrl);

      this.worker.onmessage = (event) => {
        const line = typeof event.data === 'string' ? event.data : '';
        if (line === 'readyok') {
          this.isReady = true;
          this.isStockfishActive = true;
        }
      };

      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
    } catch {
      // Graceful fallback to minimax service
      this.isStockfishActive = false;
    }
  }

  public async getEngineMove(chess: Chess, depth: number = 8): Promise<{ from: string; to: string; promotion?: string } | null> {
    if (chess.isGameOver()) return null;

    // If Stockfish worker is ready, query it with timeout
    if (this.worker && this.isStockfishActive && this.isReady) {
      return new Promise((resolve) => {
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // Fallback to internal engine
            const fallback = ChessEngineService.getBestDefensiveMove(chess);
            resolve(fallback ? { from: fallback.from, to: fallback.to, promotion: fallback.promotion } : null);
          }
        }, 800); // 800ms max wait for Stockfish

        const handler = (event: MessageEvent) => {
          const line = typeof event.data === 'string' ? event.data : '';
          if (line.startsWith('bestmove')) {
            clearTimeout(timeout);
            if (this.worker) {
              this.worker.removeEventListener('message', handler);
            }
            if (!resolved) {
              resolved = true;
              const parts = line.split(' ');
              const moveStr = parts[1];
              if (moveStr && moveStr !== '(none)') {
                const from = moveStr.substring(0, 2);
                const to = moveStr.substring(2, 4);
                const promotion = moveStr.length > 4 ? moveStr[4] : undefined;
                resolve({ from, to, promotion });
                return;
              }
              const fallback = ChessEngineService.getBestDefensiveMove(chess);
              resolve(fallback ? { from: fallback.from, to: fallback.to, promotion: fallback.promotion } : null);
            }
          }
        };

        if (this.worker) {
          this.worker.addEventListener('message', handler);
          this.worker.postMessage(`position fen ${chess.fen()}`);
          this.worker.postMessage(`go depth ${depth}`);
        }
      });
    }

    // Direct instant minimax fallback
    const bestMove = ChessEngineService.getBestDefensiveMove(chess);
    return bestMove ? { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion } : null;
  }
}

export const stockfishService = new StockfishService();
