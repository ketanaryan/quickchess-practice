# Quick Chess For You (QCFY) — Interactive Chess Checkmate Practice

> **Full-Stack Developer Practical Coding Assignment**  
> Candidate: **Aryan**  
> Inspired by: [Lichess Checkmate Practice — Piece Checkmates](https://lichess.org/practice/checkmates/piece-checkmates-i/BJy6fEDf)

[![Unit Tests](https://img.shields.io/badge/tests-11%20passed-brightgreen.svg)]()
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)]()
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)]()

---

## 🌟 Executive Summary

This project is a high-performance, responsive web application for interactive endgame checkmate training. Built with modern React, TypeScript, Tailwind CSS, and Node.js/Express, it replicates and enhances the training experience of Lichess's renowned **Piece Checkmates I** series.

### Live Demo & Video Walkthrough
- **GitHub Repository**: `https://github.com/ketanaryan/quickchess-practice`
- **Live Demo Link**: Deployable instantly on Vercel / Render / Netlify (see [Deployment](#deployment)).

---

## 🚀 Key Features

### 1. All 6 Piece Checkmate Chapters Implemented
While the assignment required picking 1 or more of the 6 chapters, this submission implements **all 6 chapters**, complete with multiple tactical setups and benchmark ratings:

1. **Queen Checkmate** (*King + Queen vs. King*)
   - Knight-jump restriction technique & avoiding stalemate traps.
2. **Two Rooks Checkmate** (*The Lawnmower / Rolling Rooks*)
   - Leapfrogging ranks/files to roll the king to the rim.
3. **Rook Checkmate** (*King + Rook vs. King*)
   - The Box Method, king opposition, and waiting moves.
4. **Two Bishops Checkmate** (*King + 2 Bishops vs. King*)
   - Team barrier on alternating color diagonals into the corner.
5. **Bishop and Knight Checkmate** (*King + Bishop + Knight vs. King*)
   - The classical "W-maneuver" forcing the king into the matching corner.
6. **Arabian Checkmate** (*Rook + Knight Ancient Coordination*)
   - Knight controlling escape squares with decisive back-rank rook finish.

---

### 2. Intelligent AI Defending King (Dual-Engine Architecture)
- **Primary: Stockfish Engine via Web Worker**: Connects via UCI protocol (`position fen`, `go depth`) off the main thread for smooth 60fps animations.
- **Fail-Safe Minimax Endgame Engine (Alpha-Beta Pruning)**:
  - Specially weighted for endgames: pushes the defending King to stay in the center, avoids premature corner entrapment, maximizes mobility, and captures undefended hung pieces.
  - Ensures **zero latency** and **100% offline availability** even if WebAssembly or workers are blocked by browser sandboxes.

### 3. Pedagogical Coaching & Interactive Hint System
- **Dynamic Hints**: Calculates the best move and explains the strategic purpose in plain English (e.g., *"Step your King closer to support your Rook"* or *"Cut off the enemy king along the rank"*).
- **Benchmark Move Scoring**: 3-star rating system comparing player moves against optimal theoretical play.
- **Stalemate Protection Alert**: Stalemating in Queen practice is the #1 beginner blunder. When triggered, an educational modal explains why stalemate occurred and offers a one-click *"Undo Blunder"* button.

### 4. Board Experience & UX Polish
- **Web Audio API Sound Engine**: Zero-asset, zero-network synthesized sound effects for piece moves, captures, checks, victory fanfares, and error alerts.
- **Visual Cues**: Legal move target dots, last-move highlights, and red pulse glow when a king is in check.
- **Board Themes**: 4 customizable board aesthetics (Lichess Wood, Classic Green, Ocean Blue, Slate Minimal).
- **Celebration Confetti**: Dynamic particle burst on checkmate with summary cards.
- **Responsive Layout**: Fluid layout optimized for mobile screens, tablets, and desktop displays.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti |
| **Chess Engine** | `chess.js` (rule validation), `react-chessboard` (board UI), Stockfish.js & Custom Minimax Evaluator |
| **Audio** | Native Web Audio API Synthesizer (instant, dependency-free) |
| **Backend API** | Node.js, Express, CORS, RESTful API |
| **Testing** | Vitest, JSDOM, `@testing-library/react`, Node Test Runner |

---

## 📂 Project Architecture

```
quick-chess-for-you/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Navigation, sound, theme controls
│   │   │   ├── ChapterSidebar.tsx   # Chapter selector & progress drawer
│   │   │   ├── ChessboardView.tsx   # Interactive board with legal highlights
│   │   │   ├── PracticePanel.tsx    # Move history, stats & coaching tips
│   │   │   ├── CelebrationModal.tsx # Victory fanfare & stars
│   │   │   └── StalemateModal.tsx   # Educational stalemate recovery
│   │   ├── constants/               # Board themes & color schemes
│   │   ├── data/                    # 6 Practice chapters & FEN positions
│   │   ├── services/
│   │   │   ├── chessEngine.ts       # Minimax AI defender & hint generator
│   │   │   ├── stockfishService.ts  # Web Worker Stockfish integration
│   │   │   └── soundService.ts      # Web Audio API sound synthesizer
│   │   ├── test/                    # Unit tests for rules & engine
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── App.tsx                  # Main practice coordinator
│   │   └── main.tsx                 # React DOM mount point
│   └── package.json
├── server/                     # Express REST API Backend
│   ├── src/
│   │   ├── data/                    # Chapter definitions
│   │   └── index.js                 # Express routes & production static server
│   ├── test/                        # Node.js API test suite
│   └── package.json
├── package.json                # Root orchestration scripts
└── README.md                   # Project documentation
```

---

## ⚡ Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on v22.12.0)
- `npm` v9+

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ketanaryan/quickchess-practice.git
cd quickchess-practice

# Install client and server dependencies
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Running the Application

#### Option A: Run Full-Stack Simultaneously (Recommended)
From the root directory:
```bash
# Terminal 1: Run frontend dev server (Vite)
npm run dev

# Terminal 2 (Optional): Run Express backend API
npm run dev:server
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Express API runs on [http://localhost:4000](http://localhost:4000).

#### Option B: Run Unified Production Build
You can build the frontend and serve everything through the Express backend:
```bash
npm run build
npm start
```
- Open [http://localhost:4000](http://localhost:4000) to access the complete application served from Express!

---

## 🧪 Running Unit Tests

The test suite validates chess rules, FEN setup integrity, checkmate/stalemate detection, engine defenses, and backend endpoints.

```bash
# Run all tests (frontend + backend)
npm run test:client
npm run test:server
```

**Test Coverage Highlights**:
- Verification of checkmate and stalemate detection against standard test vectors.
- Validation that all 6 chapters contain legal, playable FEN setups.
- Ensuring AI defending king generates legal moves and stays on the board.
- Sound service resilience in headless / mock environments.

---

## 🌐 API Reference (Express Backend)

- `GET /health` — Service health check.
- `GET /api/chapters` — Retrieves all 6 practice chapters, levels, and pedagogical guides.
- `GET /api/chapters/:id` — Retrieves specific chapter details.
- `POST /api/practice/session` — Records completed session stats (moves, stars, timestamp).
- `GET /api/practice/stats` — Returns global attempt metrics and best scores.
- `POST /api/engine/evaluate` — Analyzes a FEN position and returns legal moves and terminal checks.

---

## 🚢 Deployment

### Deploying to Vercel (Frontend):
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Deploy!

### Deploying to Render / Railway (Full-Stack):
1. Create a Web Service pointing to this repository.
2. Build Command: `npm install && npm run build --prefix client && npm install --prefix server`
3. Start Command: `npm start`
4. Set Environment Variable: `PORT=10000`.

---

## 💡 Design Decisions & Architectural Trade-offs

1. **Dual-Tier AI Defender**: Rather than relying strictly on an external Stockfish script (which can fail due to CORS, ad-blockers, or slow mobile network), we implemented a resilient in-browser Minimax defender paired with a Stockfish worker fallback. This guarantees zero downtime and instant response.
2. **Web Audio API vs. MP3 Assets**: Instead of fetching `.mp3` or `.wav` files across the network, we synthesized tones mathematically. This eliminates asset 404s, reduces bundle size, and operates with 0ms latency.
3. **Local State with Server Sync**: User progress (stars, best moves) is stored in `localStorage` for instant offline access and can be optionally synced with the Express API.

---

## 👨‍💻 Author
**Aryan**  
Candidate for Full-Stack Developer — *Quick Chess For You*  
Email: [support@quickchessforyou.com](mailto:support@quickchessforyou.com)
