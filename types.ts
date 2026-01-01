
export type Player = 'X' | 'O' | null;

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw' | null;
  winningLine: number[] | null;
}

export interface Score {
  player: number;
  ai: number;
  draws: number;
}

export enum Difficulty {
  EASY = 'Easy',
  HARD = 'Hard',
  GEMINI = 'Gemini AI'
}
