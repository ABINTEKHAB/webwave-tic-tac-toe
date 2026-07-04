import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LudoStats {
  gamesPlayed: number;
  winsBot: number;
  winsP2P: number;
  colorWins: {
    red: number;
    green: number;
    yellow: number;
    blue: number;
  };
  winStreak: number;
  bestStreak: number;
}

const STATS_STORAGE_KEY = '@webwave_tic_tac_toe:ludo_stats';

const DEFAULT_STATS: LudoStats = {
  gamesPlayed: 0,
  winsBot: 0,
  winsP2P: 0,
  colorWins: {
    red: 0,
    green: 0,
    yellow: 0,
    blue: 0,
  },
  winStreak: 0,
  bestStreak: 0,
};

export const getLudoStats = async (): Promise<LudoStats> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATS,
        ...parsed,
        colorWins: { ...DEFAULT_STATS.colorWins, ...parsed.colorWins },
      };
    }
  } catch (e) {
    // Fail silent
  }
  return DEFAULT_STATS;
};

export const saveLudoStats = async (stats: LudoStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    // Fail silent
  }
};

export const recordLudoGame = async (
  isBotMode: boolean,
  winnerColor: 'red' | 'green' | 'yellow' | 'blue' | null,
  playerColor: 'red' | 'green' | 'yellow' | 'blue'
): Promise<LudoStats> => {
  const stats = await getLudoStats();
  stats.gamesPlayed += 1;

  if (winnerColor !== null) {
    // If player won
    if (winnerColor === playerColor) {
      if (isBotMode) {
        stats.winsBot += 1;
      } else {
        stats.winsP2P += 1;
      }
      stats.colorWins[winnerColor] += 1;
      stats.winStreak += 1;
      if (stats.winStreak > stats.bestStreak) {
        stats.bestStreak = stats.winStreak;
      }
    } else {
      // Player lost
      stats.winStreak = 0;
    }
  }

  await saveLudoStats(stats);
  return stats;
};

export const resetLudoStats = async (): Promise<LudoStats> => {
  await saveLudoStats(DEFAULT_STATS);
  return DEFAULT_STATS;
};
