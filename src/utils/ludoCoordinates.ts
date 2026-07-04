export interface LudoCoord {
  x: number;
  y: number;
}

// Global 52-cell track path starting from Red launch point: (1, 6)
export const LUDO_TRACK: LudoCoord[] = [
  { x: 1, y: 6 },   // 0: Red Start
  { x: 2, y: 6 },   // 1
  { x: 3, y: 6 },   // 2
  { x: 4, y: 6 },   // 3
  { x: 5, y: 6 },   // 4
  { x: 6, y: 5 },   // 5
  { x: 6, y: 4 },   // 6
  { x: 6, y: 3 },   // 7
  { x: 6, y: 2 },   // 8
  { x: 6, y: 1 },   // 9
  { x: 6, y: 0 },   // 10
  { x: 7, y: 0 },   // 11
  { x: 8, y: 0 },   // 12
  { x: 8, y: 1 },   // 13: Green Start
  { x: 8, y: 2 },   // 14
  { x: 8, y: 3 },   // 15
  { x: 8, y: 4 },   // 16
  { x: 8, y: 5 },   // 17
  { x: 9, y: 6 },   // 18
  { x: 10, y: 6 },  // 19
  { x: 11, y: 6 },  // 20
  { x: 12, y: 6 },  // 21
  { x: 13, y: 6 },  // 22
  { x: 14, y: 6 },  // 23
  { x: 14, y: 7 },  // 24
  { x: 14, y: 8 },  // 25
  { x: 13, y: 8 },  // 26
  { x: 12, y: 8 },  // 27
  { x: 11, y: 8 },  // 28
  { x: 10, y: 8 },  // 29
  { x: 9, y: 8 },   // 30
  { x: 8, y: 9 },   // 31
  { x: 8, y: 10 },  // 32
  { x: 8, y: 11 },  // 33
  { x: 8, y: 12 },  // 34
  { x: 8, y: 13 },  // 35
  { x: 8, y: 14 },  // 36
  { x: 7, y: 14 },  // 37
  { x: 6, y: 14 },  // 38
  { x: 6, y: 13 },  // 39
  { x: 6, y: 12 },  // 40
  { x: 6, y: 11 },  // 41
  { x: 6, y: 10 },  // 42
  { x: 6, y: 9 },   // 43
  { x: 5, y: 8 },   // 44
  { x: 4, y: 8 },   // 45
  { x: 3, y: 8 },   // 46
  { x: 2, y: 8 },   // 47
  { x: 1, y: 8 },   // 48
  { x: 0, y: 8 },   // 49
  { x: 0, y: 7 },   // 50
  { x: 0, y: 6 }    // 51
];

// Home run coordinates
export const LUDO_HOME_RUNS: Record<'RED' | 'GREEN' | 'YELLOW' | 'BLUE', LudoCoord[]> = {
  RED: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 }
  ],
  GREEN: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 }
  ],
  YELLOW: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 }
  ],
  BLUE: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 }
  ]
};

// Home center coordinates
export const LUDO_HOMES: Record<'RED' | 'GREEN' | 'YELLOW' | 'BLUE', LudoCoord> = {
  RED: { x: 6, y: 7 },
  GREEN: { x: 7, y: 6 },
  YELLOW: { x: 8, y: 7 },
  BLUE: { x: 7, y: 8 }
};

// Yard positions for players (perfectly centered 2x2 grids inside each corner 6x6 yard panel)
export const LUDO_YARDS: Record<'RED' | 'GREEN' | 'YELLOW' | 'BLUE', LudoCoord[]> = {
  RED: [
    { x: 1.9, y: 1.9 },
    { x: 3.1, y: 1.9 },
    { x: 1.9, y: 3.1 },
    { x: 3.1, y: 3.1 }
  ],
  GREEN: [
    { x: 10.9, y: 1.9 },
    { x: 12.1, y: 1.9 },
    { x: 10.9, y: 3.1 },
    { x: 12.1, y: 3.1 }
  ],
  YELLOW: [
    { x: 10.9, y: 10.9 },
    { x: 12.1, y: 10.9 },
    { x: 10.9, y: 12.1 },
    { x: 12.1, y: 12.1 }
  ],
  BLUE: [
    { x: 1.9, y: 10.9 },
    { x: 3.1, y: 10.9 },
    { x: 1.9, y: 12.1 },
    { x: 3.1, y: 12.1 }
  ]
};

// Safe zone cell indices on global LUDO_TRACK
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
export const STAR_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
