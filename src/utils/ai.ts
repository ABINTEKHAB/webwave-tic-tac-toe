import {Difficulty, Player} from '../types';
import {calculateWinner} from './gameLogic';

type Mark = Exclude<Player, null>;

const CORNERS = [0, 2, 6, 8];

const getAvailableMoves = (board: Player[]) => {
  const moves: number[] = [];
  board.forEach((value, index) => {
    if (value === null) {
      moves.push(index);
    }
  });
  return moves;
};

const pickRandomMove = (moves: number[]) => {
  return moves[Math.floor(Math.random() * moves.length)];
};

const findImmediateMove = (board: Player[], mark: Mark) => {
  const moves = getAvailableMoves(board);
  for (const move of moves) {
    const nextBoard = [...board];
    nextBoard[move] = mark;
    if (calculateWinner(nextBoard).winner === mark) {
      return move;
    }
  }
  return null;
};

const pickMediumMove = (board: Player[], aiMark: Mark, humanMark: Mark) => {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    return -1;
  }

  const winningMove = findImmediateMove(board, aiMark);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findImmediateMove(board, humanMark);
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (board[4] === null) {
    return 4;
  }

  const openCorners = CORNERS.filter(index => board[index] === null);
  if (openCorners.length > 0) {
    return pickRandomMove(openCorners);
  }

  return pickRandomMove(moves);
};

const minimax = (
  board: Player[],
  currentTurn: Mark,
  aiMark: Mark,
  humanMark: Mark,
  depth: number,
): {score: number; move: number | null} => {
  const {winner} = calculateWinner(board);
  if (winner === aiMark) {
    return {score: 10 - depth, move: null};
  }
  if (winner === humanMark) {
    return {score: depth - 10, move: null};
  }
  if (winner === 'Draw') {
    return {score: 0, move: null};
  }

  const moves = getAvailableMoves(board);
  let bestScore = currentTurn === aiMark ? -Infinity : Infinity;
  let bestMove: number | null = null;

  for (const move of moves) {
    const nextBoard = [...board];
    nextBoard[move] = currentTurn;
    const nextTurn: Mark = currentTurn === 'X' ? 'O' : 'X';
    const result = minimax(nextBoard, nextTurn, aiMark, humanMark, depth + 1);

    if (currentTurn === aiMark) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    } else if (result.score < bestScore) {
      bestScore = result.score;
      bestMove = move;
    }
  }

  return {score: bestScore, move: bestMove};
};

export const getAiMove = (
  board: Player[],
  difficulty: Difficulty,
  aiMark: Mark,
  humanMark: Mark,
) => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) {
    return -1;
  }

  if (difficulty === 'Easy') {
    return pickRandomMove(availableMoves);
  }

  if (difficulty === 'Medium') {
    if (Math.random() < 0.2) {
      return pickRandomMove(availableMoves);
    }
    return pickMediumMove(board, aiMark, humanMark);
  }

  const result = minimax(board, aiMark, aiMark, humanMark, 0);
  return result.move ?? pickRandomMove(availableMoves);
};
