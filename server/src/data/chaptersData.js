export const PRACTICE_CHAPTERS = [
  {
    id: 'queen-mate',
    title: 'Queen Checkmate',
    subtitle: 'King + Queen vs. King',
    difficulty: 'Beginner',
    icon: 'Crown',
    description: 'Learn the most essential checkmate in chess. Use your Queen like a knight away from the enemy King to shrink their cage, then bring your own King to deliver the finishing blow.',
    strategyGuide: [
      'Keep the Queen a knight\'s jump away from the enemy King to mimic their movement and shrink the rectangle.',
      'Do NOT place the enemy King in check every move — focus on restricting squares.',
      'Once the enemy King is trapped on an edge or corner, FREEZE the Queen so you don\'t cause a stalemate!',
      'March your King over to support the Queen, then deliver checkmate right next to the defending King.'
    ],
    commonPitfall: 'STALEMATE! If the enemy King is on the corner and has no legal moves while not in check, the game ends in a draw.',
    levels: [
      {
        id: 'qm-center',
        name: 'Standard: King in the Center',
        fen: '8/8/8/4k3/8/8/8/3Q3K w - - 0 1',
        description: 'Black king is in the center of the board. Shrink the box and drive the king to the rank or file edge.',
        benchmarkMoves: 10
      },
      {
        id: 'qm-finishing',
        name: 'Corner Trap & Coordination',
        fen: '8/8/8/8/8/4k3/8/4KQ2 w - - 0 1',
        description: 'Black king is trying to break out. Coordinate Queen and King to seal the edge.',
        benchmarkMoves: 6
      },
      {
        id: 'qm-edge',
        name: 'Mate on the Rim (Kiss of Death)',
        fen: '5k2/8/5K2/8/8/8/8/4Q3 w - - 0 1',
        description: 'The defending king is already on the back rank! Bring the queen in for the decisive kiss of death.',
        benchmarkMoves: 2
      }
    ]
  },
  {
    id: 'two-rooks-mate',
    title: 'Two Rooks Checkmate',
    subtitle: 'The Lawnmower / Rolling Rooks',
    difficulty: 'Beginner',
    icon: 'Castle',
    description: 'Master the "Lawnmower" or rolling checkmate. One Rook guards the escape line while the second Rook pushes the King back one rank or file at a time.',
    strategyGuide: [
      'One rook acts as the "barrier", preventing the enemy King from stepping forward.',
      'The second rook delivers a check, forcing the King to step backwards towards the edge.',
      'Leapfrog the rooks one after another like cutting lawn grass.',
      'If the enemy King attacks your rook, slide it safely to the opposite side of the board along the same rank!'
    ],
    commonPitfall: 'Rook blunder! Don\'t let the defending King step forward and capture an undefended Rook.',
    levels: [
      {
        id: 'trm-open',
        name: 'Open Field Lawnmower',
        fen: '8/8/8/4k3/8/8/R7/1R5K w - - 0 1',
        description: 'Both rooks ready on the back ranks. Roll the defending king step-by-step to the 8th rank.',
        benchmarkMoves: 8
      },
      {
        id: 'trm-center',
        name: 'Alternating Cut-Off',
        fen: '8/8/8/8/3k4/8/7R/R3K3 w - - 0 1',
        description: 'Rooks are separated. Realign them and push the king to the rim.',
        benchmarkMoves: 7
      },
      {
        id: 'trm-rim',
        name: 'Final Row Finish',
        fen: '8/4k3/8/8/8/8/1R6/R6K w - - 0 1',
        description: 'The king is on the 7th rank. Set up the final rolling mate on the 8th rank.',
        benchmarkMoves: 3
      }
    ]
  },
  {
    id: 'rook-mate',
    title: 'Rook Checkmate',
    subtitle: 'King + Rook vs. King (The Box Method)',
    difficulty: 'Intermediate',
    icon: 'Shield',
    description: 'A single Rook cannot deliver checkmate on its own. You must actively coordinate your King and Rook to achieve "opposition" and drive the enemy King to the rim.',
    strategyGuide: [
      'Use the Rook to create a box/fence that restricts the defending King.',
      'Bring your King close to the enemy King.',
      'Look for opposition: When the kings face each other with one square between them, your Rook gives check to push the King back.',
      'If the enemy king avoids facing yours, make a "waiting move" with your Rook along the cutting rank to force them to step in front.'
    ],
    commonPitfall: 'Moving your King away from the action. Your King does half the work! The Rook alone cannot force the enemy back.',
    levels: [
      {
        id: 'rm-box',
        name: 'Classic Box Technique',
        fen: '8/8/8/4k3/R7/4K3/8/8 w - - 0 1',
        description: 'The Rook has already severed the 4th rank. Step up your king and shrink the box.',
        benchmarkMoves: 12
      },
      {
        id: 'rm-center',
        name: 'Center Board Grind',
        fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1',
        description: 'Start from the base position. Cut off the king on the 4th or 5th rank first.',
        benchmarkMoves: 16
      },
      {
        id: 'rm-opposition',
        name: 'Direct Opposition & Waiting Move',
        fen: '4k3/8/4K3/8/8/8/8/7R w - - 0 1',
        description: 'Defending king is on the edge facing your king! Mate is just one move away.',
        benchmarkMoves: 1
      }
    ]
  },
  {
    id: 'two-bishops-mate',
    title: 'Two Bishops Checkmate',
    subtitle: 'King + 2 Bishops vs. King',
    difficulty: 'Intermediate',
    icon: 'Layers',
    description: 'Two Bishops work in tandem like a barrier wall controlling light and dark diagonals. Trap the king in any of the four corners.',
    strategyGuide: [
      'Place the two bishops side-by-side to control a solid diagonal barrier that the enemy King cannot cross.',
      'Bring your King forward behind the bishops to support their advance.',
      'Gradually nudge the defending King into a corner of the board.',
      'Deliver checkmate with one bishop covering the corner and the other giving check, with your King guarding escape squares.'
    ],
    commonPitfall: 'Stalemate on the corner square! Make sure the enemy king has a square to step into before delivering the penultimate check.',
    levels: [
      {
        id: 'tbm-trapped',
        name: 'Corner Squeeze',
        fen: '7k/8/5K2/8/8/2BB4/8/8 w - - 0 1',
        description: 'The King is trapped near the h8 corner. Coordinate your dark and light bishops with your king to deliver checkmate cleanly without stalemate.',
        benchmarkMoves: 4
      },
      {
        id: 'tbm-center',
        name: 'Diagonal Net Coordination',
        fen: '8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1',
        description: 'Build the diagonal cross-barrier in the center and corner the opposing king.',
        benchmarkMoves: 18
      }
    ]
  },
  {
    id: 'bishop-knight-mate',
    title: 'Bishop & Knight Checkmate',
    subtitle: 'King + Bishop + Knight vs. King',
    difficulty: 'Advanced',
    icon: 'Compass',
    description: 'The hardest standard checkmate in chess! You can only checkmate the king in a corner matching the color of your bishop using the famous "W-maneuver" with your knight.',
    strategyGuide: [
      'Drive the defending King to an edge first.',
      'Remember: Checkmate can ONLY happen in a corner of your Bishop\'s square color!',
      'Use the Knight\'s "W-path" to push the king from the wrong corner to the winning corner.',
      'Coordinate all three pieces in close harmony to avoid stalemates or king escapes.'
    ],
    commonPitfall: 'Trying to checkmate in the wrong-colored corner. If you have a light-squared bishop, the King CANNOT be mated in a dark corner (h1, a8)!',
    levels: [
      {
        id: 'bkm-corner',
        name: 'Matching Corner Mate',
        fen: '7k/6N1/5K2/8/8/8/8/2B5 w - - 0 1',
        description: 'Dark king is trapped near the dark corner (h8) with your dark bishop. Deliver mate!',
        benchmarkMoves: 4
      },
      {
        id: 'bkm-edge',
        name: 'W-Maneuver Drive',
        fen: 'k7/8/1K6/8/8/8/8/1NB5 w - - 0 1',
        description: 'King is on a8. Coordinate bishop and knight to control b8 and c8.',
        benchmarkMoves: 6
      }
    ]
  },
  {
    id: 'arabian-mate',
    title: 'Arabian Checkmate',
    subtitle: 'Rook + Knight Ancient Coordination',
    difficulty: 'Beginner',
    icon: 'Sword',
    description: 'One of the oldest recorded checkmates in chess history. A Knight on the 6th rank protects the Rook on the 7th or 8th rank while sealing the corner escape squares.',
    strategyGuide: [
      'Position your knight on f6 (or c6, f3, c3) two squares diagonally away from the corner king.',
      'The knight guards the escape squares (e.g., g8 and h7).',
      'The rook slides in along the open rank or file to deliver checkmate backed by the knight.'
    ],
    commonPitfall: 'Leaving the rook unguarded by the knight when checking on the back rank.',
    levels: [
      {
        id: 'am-finish',
        name: 'Direct Arabian Mate',
        fen: '7k/5R2/4N3/8/8/8/8/7K w - - 0 1',
        description: 'White has knight on e6 and rook on f7. Deliver the classical Arabian mate!',
        benchmarkMoves: 2
      },
      {
        id: 'am-setup',
        name: 'Knight Jump & Rook Slide',
        fen: '7k/8/8/5N2/8/8/R7/7K w - - 0 1',
        description: 'Maneuver the knight to f6/e7 and bring the rook to the 7th rank.',
        benchmarkMoves: 4
      }
    ]
  }
];
