import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty } from '../types';

export interface CareerStats {
  pvpPlayed: number;
  pvpWinsX: number;
  pvpWinsO: number;
  pvpDraws: number;
  pvaiPlayed: number;
  pvaiWinsUser: number;
  pvaiWinsAi: number;
  pvaiDraws: number;

  // AI Difficulty Breakdown
  aiEasyPlayed: number;
  aiEasyWinsUser: number;
  aiEasyWinsAi: number;
  aiEasyDraws: number;

  aiMediumPlayed: number;
  aiMediumWinsUser: number;
  aiMediumWinsAi: number;
  aiMediumDraws: number;

  aiHardPlayed: number;
  aiHardWinsUser: number;
  aiHardWinsAi: number;
  aiHardDraws: number;

  currentStreak: number;
  bestStreak: number;
}

const STATS_STORAGE_KEY = '@webwave_tic_tac_toe:career_stats';

const DEFAULT_STATS: CareerStats = {
  pvpPlayed: 0,
  pvpWinsX: 0,
  pvpWinsO: 0,
  pvpDraws: 0,
  pvaiPlayed: 0,
  pvaiWinsUser: 0,
  pvaiWinsAi: 0,
  pvaiDraws: 0,

  aiEasyPlayed: 0,
  aiEasyWinsUser: 0,
  aiEasyWinsAi: 0,
  aiEasyDraws: 0,

  aiMediumPlayed: 0,
  aiMediumWinsUser: 0,
  aiMediumWinsAi: 0,
  aiMediumDraws: 0,

  aiHardPlayed: 0,
  aiHardWinsUser: 0,
  aiHardWinsAi: 0,
  aiHardDraws: 0,

  currentStreak: 0,
  bestStreak: 0,
};

export const getCareerStats = async (): Promise<CareerStats> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch (e) {
    // Fail silent
  }
  return DEFAULT_STATS;
};

export const saveCareerStats = async (stats: CareerStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    // Fail silent
  }
};

export const recordMatchResult = async (
  mode: 'PVP' | 'PVAI',
  winner: 'X' | 'O' | 'Draw',
  userSymbol?: 'X' | 'O',
  difficulty?: Difficulty
): Promise<CareerStats> => {
  const stats = await getCareerStats();

  if (mode === 'PVP') {
    stats.pvpPlayed += 1;
    if (winner === 'X') {
      stats.pvpWinsX += 1;
    } else if (winner === 'O') {
      stats.pvpWinsO += 1;
    } else {
      stats.pvpDraws += 1;
    }
  } else {
    stats.pvaiPlayed += 1;
    const isUserWinner = winner === userSymbol;
    const isAiWinner = winner !== 'Draw' && winner !== userSymbol;

    if (isUserWinner) {
      stats.pvaiWinsUser += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else if (isAiWinner) {
      stats.pvaiWinsAi += 1;
      stats.currentStreak = 0;
    } else {
      stats.pvaiDraws += 1;
    }

    // AI Difficulty Breakdown
    if (difficulty === 'Easy') {
      stats.aiEasyPlayed += 1;
      if (isUserWinner) stats.aiEasyWinsUser += 1;
      else if (isAiWinner) stats.aiEasyWinsAi += 1;
      else stats.aiEasyDraws += 1;
    } else if (difficulty === 'Medium') {
      stats.aiMediumPlayed += 1;
      if (isUserWinner) stats.aiMediumWinsUser += 1;
      else if (isAiWinner) stats.aiMediumWinsAi += 1;
      else stats.aiMediumDraws += 1;
    } else if (difficulty === 'Hard') {
      stats.aiHardPlayed += 1;
      if (isUserWinner) stats.aiHardWinsUser += 1;
      else if (isAiWinner) stats.aiHardWinsAi += 1;
      else stats.aiHardDraws += 1;
    }
  }

  await saveCareerStats(stats);
  return stats;
};

export const resetCareerStats = async (): Promise<CareerStats> => {
  await saveCareerStats(DEFAULT_STATS);
  return DEFAULT_STATS;
};

export const resetStatsForMode = async (
  mode: 'PVP' | 'PVAI',
  difficulty?: Difficulty
): Promise<CareerStats> => {
  const stats = await getCareerStats();

  if (mode === 'PVP') {
    stats.pvpPlayed = 0;
    stats.pvpWinsX = 0;
    stats.pvpWinsO = 0;
    stats.pvpDraws = 0;
  } else {
    if (difficulty === 'Easy') {
      stats.pvaiPlayed -= stats.aiEasyPlayed;
      stats.pvaiWinsUser -= stats.aiEasyWinsUser;
      stats.pvaiWinsAi -= stats.aiEasyWinsAi;
      stats.pvaiDraws -= stats.aiEasyDraws;

      stats.aiEasyPlayed = 0;
      stats.aiEasyWinsUser = 0;
      stats.aiEasyWinsAi = 0;
      stats.aiEasyDraws = 0;
    } else if (difficulty === 'Medium') {
      stats.pvaiPlayed -= stats.aiMediumPlayed;
      stats.pvaiWinsUser -= stats.aiMediumWinsUser;
      stats.pvaiWinsAi -= stats.aiMediumWinsAi;
      stats.pvaiDraws -= stats.aiMediumDraws;

      stats.aiMediumPlayed = 0;
      stats.aiMediumWinsUser = 0;
      stats.aiMediumWinsAi = 0;
      stats.aiMediumDraws = 0;
    } else if (difficulty === 'Hard') {
      stats.pvaiPlayed -= stats.aiHardPlayed;
      stats.pvaiWinsUser -= stats.aiHardWinsUser;
      stats.pvaiWinsAi -= stats.aiHardWinsAi;
      stats.pvaiDraws -= stats.aiHardDraws;

      stats.aiHardPlayed = 0;
      stats.aiHardWinsUser = 0;
      stats.aiHardWinsAi = 0;
      stats.aiHardDraws = 0;
    }

    if (stats.pvaiPlayed < 0) stats.pvaiPlayed = 0;
    if (stats.pvaiWinsUser < 0) stats.pvaiWinsUser = 0;
    if (stats.pvaiWinsAi < 0) stats.pvaiWinsAi = 0;
    if (stats.pvaiDraws < 0) stats.pvaiDraws = 0;

    stats.currentStreak = 0;
  }

  await saveCareerStats(stats);
  return stats;
};
