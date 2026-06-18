import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CareerStats {
  pvpPlayed: number;
  pvpWinsX: number;
  pvpWinsO: number;
  pvpDraws: number;
  pvaiPlayed: number;
  pvaiWinsUser: number;
  pvaiWinsAi: number;
  pvaiDraws: number;
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
  userSymbol?: 'X' | 'O'
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
      // Streak keeps going or pauses? Usually, a draw resets/pauses streak. Let's keep streak intact or reset.
      // Usually, draws don't break a win streak or do? Let's say it does not reset, but doesn't increment.
    }
  }

  await saveCareerStats(stats);
  return stats;
};

export const resetCareerStats = async (): Promise<CareerStats> => {
  await saveCareerStats(DEFAULT_STATS);
  return DEFAULT_STATS;
};
