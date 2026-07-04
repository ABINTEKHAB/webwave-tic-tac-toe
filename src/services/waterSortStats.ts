import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WaterSortStats {
  levelsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  totalMoves: number;
}

const STATS_STORAGE_KEY = '@webwave_tic_tac_toe:watersort_stats';

const DEFAULT_STATS: WaterSortStats = {
  levelsCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalMoves: 0,
};

export const getWaterSortStats = async (): Promise<WaterSortStats> => {
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

export const saveWaterSortStats = async (stats: WaterSortStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    // Fail silent
  }
};

export const recordWaterSortLevelCompleted = async (moves: number): Promise<WaterSortStats> => {
  const stats = await getWaterSortStats();
  stats.levelsCompleted += 1;
  stats.currentStreak += 1;
  stats.totalMoves += moves;
  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak;
  }
  await saveWaterSortStats(stats);
  return stats;
};

export const resetWaterSortStats = async (): Promise<WaterSortStats> => {
  await saveWaterSortStats(DEFAULT_STATS);
  return DEFAULT_STATS;
};
