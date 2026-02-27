export type Player = 'X' | 'O' | null;
export type GameMode = 'PVP' | 'PVAI';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw';
  winningLine: number[] | null;
}

export interface Score {
  x: number;
  o: number;
  draws: number;
}
