export interface BoardTheme {
  id: string;
  name: string;
  darkSquare: string;
  lightSquare: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'lichess-wood',
    name: 'Lichess Wood',
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
  },
  {
    id: 'classic-green',
    name: 'Classic Green',
    darkSquare: '#769656',
    lightSquare: '#eeeed2',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    darkSquare: '#4e78a0',
    lightSquare: '#d8e6f3',
  },
  {
    id: 'slate-dark',
    name: 'Slate Minimal',
    darkSquare: '#4a5568',
    lightSquare: '#cbd5e1',
  },
];
