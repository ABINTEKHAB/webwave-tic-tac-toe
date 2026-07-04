// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//       Animated,
//       BackHandler,
//       Easing,
//       ImageBackground,
//       Modal,
//       Platform,
//       Pressable,
//       ScrollView,
//       StatusBar,
//       StyleSheet,
//       Text,
//       View,
//       useWindowDimensions,
//       Alert,
// } from 'react-native';
// import Icon from '@react-native-vector-icons/ionicons';

// const BACKGROUND_IMG = require('../assets/images/bgr_2.png');
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useTheme } from '../theme/ThemeContext';
// import { radii, spacing, typography } from '../theme/tokens';
// import { getContentWidth, scaleSize } from '../theme/responsive';
// import PauseModal from '../components/PauseModal';
// import AdBanner from '../components/AdBanner';
// import { useGameSounds } from '../hooks/useGameSounds';
// import { hexToRgba } from '../theme/themes';
// import { useAdMob } from '../hooks/useAdMob';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//       getWaterSortStats,
//       recordWaterSortLevelCompleted,
//       resetWaterSortStats,
//       WaterSortStats,
// } from '../services/waterSortStats';

// interface WaterSortScreenProps {
//       onGoHome: () => void;
//       onOpenSettings: () => void;
//       adsReady: boolean;
//       soundEnabled: boolean;
//       vibrationEnabled: boolean;
// }

// type LiquidColor = 'cyan' | 'pink' | 'warning' | 'accent' | 'purple' | 'orange' | 'yellow';

// const STORAGE_LEVEL_KEY = '@webwave_tic_tac_toe:water_sort_level';

// // 7 distinct neon colors
// const ALL_COLORS: LiquidColor[] = ['cyan', 'pink', 'warning', 'accent', 'purple', 'orange', 'yellow'];

// const HANDCRAFTED_LEVELS: LiquidColor[][][] = [
//       // Level 1: 3 filled, 2 empty
//       [
//             ['cyan', 'pink', 'cyan', 'pink'],
//             ['pink', 'cyan', 'pink', 'warning'],
//             ['warning', 'warning', 'warning', 'cyan'],
//             [],
//             [],
//       ],
//       // Level 2: 3 filled, 2 empty
//       [
//             ['warning', 'pink', 'cyan', 'warning'],
//             ['pink', 'cyan', 'pink', 'cyan'],
//             ['cyan', 'warning', 'warning', 'pink'],
//             [],
//             [],
//       ],
//       // Level 3: 4 filled, 2 empty (4 colors)
//       [
//             ['cyan', 'pink', 'warning', 'accent'],
//             ['accent', 'warning', 'pink', 'cyan'],
//             ['pink', 'cyan', 'accent', 'warning'],
//             ['warning', 'accent', 'cyan', 'pink'],
//             [],
//             [],
//       ],
//       // Level 4: 4 filled, 2 empty
//       [
//             ['accent', 'cyan', 'pink', 'accent'],
//             ['warning', 'warning', 'cyan', 'pink'],
//             ['cyan', 'accent', 'warning', 'pink'],
//             ['pink', 'accent', 'cyan', 'warning'],
//             [],
//             [],
//       ],
//       // Level 5: 4 filled, 2 empty (Challenging mix)
//       [
//             ['pink', 'warning', 'accent', 'cyan'],
//             ['cyan', 'pink', 'warning', 'accent'],
//             ['accent', 'cyan', 'pink', 'warning'],
//             ['warning', 'accent', 'cyan', 'pink'],
//             [],
//             [],
//       ],
// ];

// // Seeded Random helper for deterministic level generation
// class SeededRandom {
//       private seed: number;
//       constructor(seed: number) {
//             this.seed = seed;
//       }
//       next(): number {
//             this.seed = (this.seed * 9301 + 49297) % 233280;
//             return this.seed / 233280;
//       }
//       range(min: number, max: number): number {
//             return Math.floor(min + this.next() * (max - min));
//       }
//       shuffle<T>(array: T[]): T[] {
//             const copy = [...array];
//             for (let i = copy.length - 1; i > 0; i--) {
//                   const j = this.range(0, i + 1);
//                   const temp = copy[i];
//                   copy[i] = copy[j];
//                   copy[j] = temp;
//             }
//             return copy;
//       }
// }

// // Generate deterministic level based on level index (0-indexed)
// const getWaterSortLevel = (levelIdx: number): LiquidColor[][] => {
//       if (levelIdx < HANDCRAFTED_LEVELS.length) {
//             return HANDCRAFTED_LEVELS[levelIdx].map(t => [...t]);
//       }

//       const rng = new SeededRandom(levelIdx * 1234 + 567);
//       let colorCount = 4;
//       if (levelIdx >= 40) colorCount = 7;
//       else if (levelIdx >= 25) colorCount = 6;
//       else if (levelIdx >= 10) colorCount = 5;

//       const selectedColors = ALL_COLORS.slice(0, colorCount);
//       const segments: LiquidColor[] = [];
//       selectedColors.forEach(c => {
//             for (let i = 0; i < 4; i++) {
//                   segments.push(c);
//             }
//       });

//       const shuffled = rng.shuffle(segments);
//       const tubesList: LiquidColor[][] = [];
//       for (let i = 0; i < colorCount; i++) {
//             tubesList.push(shuffled.slice(i * 4, (i + 1) * 4));
//       }
//       // Add 2 empty tubes
//       tubesList.push([]);
//       tubesList.push([]);
//       return tubesList;
// };

// interface ParticleConfig {
//       angle: number;
//       distance: number;
//       color: string;
//       shape: 'square' | 'circle' | 'triangle' | 'bar';
//       size: number;
//       spin: number;
//       delay: number;
// }

// const TubeCompleteBlast = ({ triggerCount }: { triggerCount: number }) => {
//       const progress = useRef(new Animated.Value(0)).current;

//       const particles = useRef<ParticleConfig[]>(
//             Array.from({ length: 22 }, () => {
//                   const angle = (Math.random() * 220 - 20) * (Math.PI / 180);
//                   const distance = 45 + Math.random() * 110;
//                   const color = ['#00d2ff', '#1d72f2', '#7bf10a', '#e21a62', '#ffd215', '#b026ff', '#ff5e00'][
//                         Math.floor(Math.random() * 7)
//                   ];
//                   const shape = ['square', 'circle', 'triangle', 'bar'][Math.floor(Math.random() * 4)] as any;
//                   const size = 6 + Math.random() * 8;
//                   const spin = Math.random() * 720 - 360;
//                   const delay = Math.random() * 180;
//                   return { angle, distance, color, shape, size, spin, delay };
//             })
//       ).current;

//       useEffect(() => {
//             if (triggerCount > 0) {
//                   progress.setValue(0);
//                   Animated.timing(progress, {
//                         toValue: 1,
//                         duration: 1000,
//                         useNativeDriver: true,
//                   }).start();
//             }
//       }, [triggerCount]);

//       if (triggerCount === 0) return null;

//       return (
//             <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
//                   {particles.map((p, i) => {
//                         const translateX = progress.interpolate({
//                               inputRange: [0, 1],
//                               outputRange: [24, 24 + Math.cos(p.angle) * p.distance],
//                         });

//                         const translateY = progress.interpolate({
//                               inputRange: [0, 0.25, 1],
//                               outputRange: [0, -30, Math.sin(p.angle) * p.distance + 40],
//                         });

//                         const rotate = progress.interpolate({
//                               inputRange: [0, 1],
//                               outputRange: ['0deg', `${p.spin}deg`],
//                         });

//                         const opacity = progress.interpolate({
//                               inputRange: [0, 0.75, 1],
//                               outputRange: [1, 1, 0],
//                         });

//                         const scale = progress.interpolate({
//                               inputRange: [0, 0.15, 1],
//                               outputRange: [0.1, 1.2, 0.4],
//                         });

//                         return (
//                               <Animated.View
//                                     key={`p-${i}`}
//                                     style={{
//                                           position: 'absolute',
//                                           opacity,
//                                           transform: [{ translateX }, { translateY }, { rotate }, { scale }],
//                                           zIndex: 99,
//                                     }}
//                               >
//                                     {p.shape === 'circle' && (
//                                           <View
//                                                 style={{
//                                                       width: p.size,
//                                                       height: p.size,
//                                                       borderRadius: p.size / 2,
//                                                       backgroundColor: p.color,
//                                                       shadowColor: p.color,
//                                                       shadowOffset: { width: 0, height: 0 },
//                                                       shadowOpacity: 0.8,
//                                                       shadowRadius: 3,
//                                                 }}
//                                           />
//                                     )}
//                                     {p.shape === 'square' && (
//                                           <View
//                                                 style={{
//                                                       width: p.size,
//                                                       height: p.size,
//                                                       backgroundColor: p.color,
//                                                       shadowColor: p.color,
//                                                       shadowOffset: { width: 0, height: 0 },
//                                                       shadowOpacity: 0.8,
//                                                       shadowRadius: 3,
//                                                 }}
//                                           />
//                                     )}
//                                     {p.shape === 'bar' && (
//                                           <View
//                                                 style={{
//                                                       width: p.size * 1.6,
//                                                       height: 3,
//                                                       backgroundColor: p.color,
//                                                       shadowColor: p.color,
//                                                       shadowOffset: { width: 0, height: 0 },
//                                                       shadowOpacity: 0.8,
//                                                       shadowRadius: 3,
//                                                 }}
//                                           />
//                                     )}
//                                     {p.shape === 'triangle' && (
//                                           <View
//                                                 style={{
//                                                       width: 0,
//                                                       height: 0,
//                                                       backgroundColor: 'transparent',
//                                                       borderStyle: 'solid',
//                                                       borderLeftWidth: p.size / 2,
//                                                       borderRightWidth: p.size / 2,
//                                                       borderBottomWidth: p.size,
//                                                       borderLeftColor: 'transparent',
//                                                       borderRightColor: 'transparent',
//                                                       borderBottomColor: p.color,
//                                                       shadowColor: p.color,
//                                                       shadowOffset: { width: 0, height: 0 },
//                                                       shadowOpacity: 0.8,
//                                                       shadowRadius: 3,
//                                                 }}
//                                           />
//                                     )}
//                               </Animated.View>
//                         );
//                   })}
//             </View>
//       );
// };

// const WaterSortScreen = ({
//       onGoHome,
//       onOpenSettings,
//       adsReady,
//       soundEnabled,
//       vibrationEnabled,
// }: WaterSortScreenProps) => {
//       const { width, height } = useWindowDimensions();
//       const { theme } = useTheme();
//       const { colors, shadows } = theme;

//       const styles = useMemo(() => getStyles(colors, shadows, theme.name), [colors, shadows, theme.name]);

//       const contentWidth = getContentWidth(width, 16, 560);
//       const compact = height < 760;

//       // Sound and Ad Hooks
//       const { playSound } = useGameSounds(soundEnabled);
//       const { incrementRoundsAndMaybeShowAd, showInterstitial, showRewarded } = useAdMob(adsReady, false);

//       // States
//       const [level, setLevel] = useState(0);
//       const [tubes, setTubes] = useState<LiquidColor[][]>([]);
//       const [selectedTube, setSelectedTube] = useState<number | null>(null);
//       const [history, setHistory] = useState<LiquidColor[][][]>([]);
//       const [solved, setSolved] = useState(false);
//       const [pauseVisible, setPauseVisible] = useState(false);

//       // Undo & Extra Tube Mechanics
//       const [undoCount, setUndoCount] = useState(5);
//       const [extraTubeAdCount, setExtraTubeAdCount] = useState(0);
//       const [showExtraTubeModal, setShowExtraTubeModal] = useState(false);
//       const [extraTubeAdded, setExtraTubeAdded] = useState(false);

//       // Statistics
//       const [stats, setStats] = useState<WaterSortStats | null>(null);
//       const [showStatsModal, setShowStatsModal] = useState(false);
//       const [movesCount, setMovesCount] = useState(0);

//       // Tube complete local animations state
//       const [completedTubes, setCompletedTubes] = useState<boolean[]>([]);
//       const [blastTriggers, setBlastTriggers] = useState<number[]>(new Array(15).fill(0));

//       // Confetti particles
//       const [confettiActive, setConfettiActive] = useState(false);
//       const confettiAnims = useRef(
//             Array.from({ length: 60 }, () => ({
//                   y: new Animated.Value(-100),
//                   x: new Animated.Value(0),
//                   rotate: new Animated.Value(0),
//                   color: ['#00f5ff', '#ff75c3', '#39ff14', '#ffff00', '#b026ff', '#ff5e00', '#00d2ff', '#e21a62'][Math.floor(Math.random() * 8)],
//                   size: Math.random() * 10 + 12,
//                   shape: Math.random() > 0.5 ? 'circle' : 'square',
//             }))
//       ).current;

//       // Animation states for fluid sorting
//       const [pourState, setPourState] = useState<{
//             srcIdx: number;
//             destIdx: number;
//             color: LiquidColor;
//             count: number;
//             oldTubes: LiquidColor[][];
//             newTubes: LiquidColor[][];
//       } | null>(null);

//       const pourAnimation = useRef(new Animated.Value(0)).current;

//       // Load level progress and stats
//       useEffect(() => {
//             AsyncStorage.getItem(STORAGE_LEVEL_KEY)
//                   .then(val => {
//                         if (val) {
//                               setLevel(parseInt(val, 10));
//                         } else {
//                               setLevel(0);
//                         }
//                   })
//                   .catch(() => setLevel(0));

//             getWaterSortStats().then(setStats).catch(() => { });
//       }, []);

//       // Set up level board when level changes
//       useEffect(() => {
//             const rawLevel = getWaterSortLevel(level);
//             setTubes(rawLevel);
//             setSelectedTube(null);
//             setHistory([]);
//             setSolved(false);
//             setPourState(null);
//             setMovesCount(0);
//             setUndoCount(5);
//             setExtraTubeAdCount(0);
//             setExtraTubeAdded(false);
//             setCompletedTubes(new Array(rawLevel.length).fill(false));
//             setConfettiActive(false);
//       }, [level]);

//       // Check solved state
//       const checkSolvedState = useCallback(
//             (currentTubes: LiquidColor[][]) => {
//                   const isCompleted = currentTubes.every(tube => {
//                         if (tube.length === 0) return true;
//                         if (tube.length < 4) return false;
//                         const first = tube[0];
//                         return tube.every(seg => seg === first);
//                   });

//                   if (isCompleted) {
//                         setSolved(true);
//                         setBlastTriggers(prev => {
//                               return prev.map((val, idx) => {
//                                     if (idx < currentTubes.length) {
//                                           return val + 1;
//                                     }
//                                     return val;
//                               });
//                         });
//                         setConfettiActive(true);
//                         playSound('win');
//                         if (vibrationEnabled) {
//                               import('react-native').then(({ Vibration }) => {
//                                     Vibration.vibrate([0, 50, 30, 50]);
//                               });
//                         }
//                         // Save completed level stats
//                         recordWaterSortLevelCompleted(movesCount)
//                               .then(setStats)
//                               .catch(() => { });

//                         // Ad trigger moved to Next Level / Replay buttons to let user see victory card first

//                         // Confetti start
//                         confettiAnims.forEach(anim => {
//                               anim.y.setValue(-50);
//                               anim.x.setValue(Math.random() * width - width / 2);
//                               anim.rotate.setValue(0);
//                               Animated.parallel([
//                                     Animated.timing(anim.y, {
//                                           toValue: height + 50,
//                                           duration: 1500 + Math.random() * 2000,
//                                           easing: Easing.linear,
//                                           useNativeDriver: true,
//                                     }),
//                                     Animated.timing(anim.rotate, {
//                                           toValue: 1,
//                                           duration: 1500 + Math.random() * 2000,
//                                           easing: Easing.linear,
//                                           useNativeDriver: true,
//                                     }),
//                               ]).start();
//                         });
//                   }
//             },
//             [playSound, vibrationEnabled, movesCount, confettiAnims, width, height, incrementRoundsAndMaybeShowAd, setBlastTriggers]
//       );

//       // Pour effect animation listener
//       useEffect(() => {
//             if (pourState) {
//                   pourAnimation.setValue(0);
//                   Animated.timing(pourAnimation, {
//                         toValue: 1,
//                         duration: 800,
//                         useNativeDriver: false,
//                   }).start(() => {
//                         setTubes(pourState.newTubes);
//                         setPourState(null);

//                         // Check if any specific tube is now fully completed
//                         const nextCompleted = pourState.newTubes.map(t => {
//                               if (t.length === 4) {
//                                     const first = t[0];
//                                     return t.every(seg => seg === first);
//                               }
//                               return false;
//                         });

//                         // Trigger local sparkle + chime if a new tube is complete
//                         nextCompleted.forEach((isComp, idx) => {
//                               if (isComp && !completedTubes[idx]) {
//                                     setBlastTriggers(prev => {
//                                           const next = [...prev];
//                                           next[idx] += 1;
//                                           return next;
//                                     });
//                                     playSound('ting'); // completed tube chime
//                                     if (vibrationEnabled) {
//                                           import('react-native').then(({ Vibration }) => {
//                                                 Vibration.vibrate(20);
//                                           });
//                                     }
//                               }
//                         });
//                         setCompletedTubes(nextCompleted);

//                         checkSolvedState(pourState.newTubes);
//                   });
//             }
//       }, [pourState, checkSolvedState, completedTubes, playSound, vibrationEnabled]);

//       // Back button exit confirmation
//       useEffect(() => {
//             const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//                   if (pauseVisible) {
//                         setPauseVisible(false);
//                         return true;
//                   }
//                   setPauseVisible(true);
//                   return true;
//             });
//             return () => backHandler.remove();
//       }, [pauseVisible]);

//       // Pour logic
//       const selectOrPour = (idx: number) => {
//             if (solved || pourState !== null) return;
//             playSound('tap');

//             if (selectedTube === null) {
//                   if (tubes[idx].length > 0) {
//                         setSelectedTube(idx);
//                   }
//             } else {
//                   const srcIdx = selectedTube;
//                   setSelectedTube(null);

//                   if (srcIdx === idx) return;

//                   const srcTube = tubes[srcIdx];
//                   const destTube = tubes[idx];

//                   if (destTube.length >= 4) {
//                         playSound('tap');
//                         return;
//                   }

//                   const srcTop = srcTube[srcTube.length - 1];
//                   const destTop = destTube[destTube.length - 1];

//                   if (destTube.length > 0 && destTop !== srcTop) {
//                         playSound('tap');
//                         return;
//                   }

//                   const newTubes = tubes.map(t => [...t]);
//                   const movingColor = srcTop;
//                   let segmentsToMove = 0;

//                   for (let i = srcTube.length - 1; i >= 0; i--) {
//                         if (srcTube[i] === movingColor) {
//                               segmentsToMove++;
//                         } else {
//                               break;
//                         }
//                   }

//                   const destSpace = 4 - destTube.length;
//                   const pourCount = Math.min(segmentsToMove, destSpace);
//                   if (pourCount === 0) {
//                         playSound('draw');
//                         return;
//                   }

//                   setHistory(prev => [...prev, tubes.map(t => [...t])]);
//                   setMovesCount(m => m + 1);

//                   for (let i = 0; i < pourCount; i++) {
//                         newTubes[srcIdx].pop();
//                         newTubes[idx].push(movingColor);
//                   }

//                   playSound('pour');

//                   setPourState({
//                         srcIdx,
//                         destIdx: idx,
//                         color: movingColor,
//                         count: pourCount,
//                         oldTubes: tubes.map(t => [...t]),
//                         newTubes: newTubes.map(t => [...t]),
//                   });
//             }
//       };

//       // Undo move with ad trigger
//       const handleUndo = () => {
//             if (history.length === 0 || solved || pourState !== null) return;
//             playSound('tap');

//             if (undoCount <= 0) {
//                   // Force user to watch an ad to get 5 more undos
//                   showInterstitial();
//                   setUndoCount(5);
//                   return;
//             }

//             const newHistory = [...history];
//             const prevState = newHistory.pop();
//             if (prevState) {
//                   // Trigger Interstitial ad on every undo
//                   showInterstitial();
//                   setTubes(prevState);
//                   setHistory(newHistory);
//                   setSelectedTube(null);
//                   setMovesCount(m => Math.max(0, m - 1));
//                   setUndoCount(u => u - 1);
//             }
//       };

//       const handleRestart = () => {
//             if (pourState !== null) return;
//             incrementRoundsAndMaybeShowAd();
//             const rawLevel = getWaterSortLevel(level);
//             setTubes(rawLevel);
//             setSelectedTube(null);
//             setHistory([]);
//             setSolved(false);
//             setMovesCount(0);
//             setCompletedTubes(new Array(rawLevel.length).fill(false));
//             playSound('tap');
//             setPauseVisible(false);
//       };

//       const handleNextLevel = () => {
//             incrementRoundsAndMaybeShowAd();
//             const nextL = level + 1;
//             setLevel(nextL);
//             AsyncStorage.setItem(STORAGE_LEVEL_KEY, nextL.toString()).catch(() => { });
//             playSound('tap');
//       };

//       const handleWatchAdForExtraTube = () => {
//             showRewarded(
//                   () => {
//                         if (extraTubeAdCount < 4) {
//                               setExtraTubeAdCount(c => c + 1);
//                         } else {
//                               // Completed 5 ads: Unlock extra tube!
//                               setExtraTubeAdCount(5);
//                               setTubes(prev => [...prev, []]);
//                               setCompletedTubes(prev => [...prev, false]);
//                               setExtraTubeAdded(true);
//                               setShowExtraTubeModal(false);
//                         }
//                   },
//                   () => {
//                         Alert.alert("Notice", "Ad is not ready yet. Please try again in a few seconds.");
//                   }
//             );
//       };

//       // Color mappings
//       const getSegmentColor = (colorName: LiquidColor) => {
//             if (theme.name === 'nordic') {
//                   switch (colorName) {
//                         case 'cyan': return '#1d3557';
//                         case 'pink': return '#a8483b';
//                         case 'warning': return '#224b33';
//                         case 'accent': return '#c99738';
//                         case 'purple': return '#4a2c5f';
//                         case 'orange': return '#a65d21';
//                         case 'yellow': return '#9a8e2a';
//                   }
//             }
//             switch (colorName) {
//                   case 'cyan': return '#00d2ff'; // Neon Cyan
//                   case 'pink': return '#1d72f2'; // Deep Blue
//                   case 'warning': return '#7bf10a'; // Lime Green
//                   case 'accent': return '#e21a62'; // Pinkish Magenta
//                   case 'purple': return '#b026ff'; // Purple
//                   case 'orange': return '#ff5e00'; // Orange
//                   case 'yellow': return '#ffd215'; // Golden Yellow
//             }
//       };

//       // Physical vial tilt animation style
//       const getVialAnimationStyle = (idx: number) => {
//             if (pourState === null) {
//                   const isSelected = selectedTube === idx;
//                   return {
//                         transform: [{ translateY: isSelected ? -12 : 0 }],
//                   };
//             }

//             if (idx === pourState.srcIdx) {
//                   const total = tubes.length;
//                   const topCount = Math.ceil(total / 2);

//                   const getCoords = (i: number) => {
//                         const row = i < topCount ? 0 : 1;
//                         const col = i < topCount ? i : i - topCount;
//                         const count = row === 0 ? topCount : total - topCount;
//                         const rowWidth = count * 72 + (count - 1) * 20;
//                         const x = -rowWidth / 2 + col * 92 + 36;
//                         const y = row * 215;
//                         return { x, y };
//                   };

//                   const srcCoords = getCoords(pourState.srcIdx);
//                   const destCoords = getCoords(pourState.destIdx);

//                   const dx = destCoords.x - srcCoords.x;
//                   const dy = destCoords.y - srcCoords.y;
//                   const isRight = dx >= 0;

//                   const hoverX = dx + (isRight ? -78 : 78);
//                   const hoverY = dy - 58;
//                   const targetRotate = isRight ? '75deg' : '-75deg';

//                   const rotate = pourAnimation.interpolate({
//                         inputRange: [0, 0.25, 0.75, 1],
//                         outputRange: ['0deg', targetRotate, targetRotate, '0deg'],
//                   });

//                   const translateX = pourAnimation.interpolate({
//                         inputRange: [0, 0.25, 0.75, 1],
//                         outputRange: [0, hoverX, hoverX, 0],
//                   });

//                   const translateY = pourAnimation.interpolate({
//                         inputRange: [0, 0.25, 0.75, 1],
//                         outputRange: [-12, hoverY, hoverY, 0],
//                   });

//                   return {
//                         transform: [{ translateX }, { translateY }, { rotate }],
//                         zIndex: 10,
//                   };
//             }

//             return {};
//       };

//       // Dynamic scaling calculations
//       const totalTubes = tubes.length;
//       const topCount = Math.ceil(totalTubes / 2);
//       const rowMaxCount = Math.max(topCount, totalTubes - topCount);

//       // Base constants
//       const BASE_VIAL_WIDTH = 60;
//       const BASE_GAP = 18;
//       const HORIZONTAL_PADDING = 32;
//       const availableWidth = contentWidth - HORIZONTAL_PADDING;

//       const baseTotalWidth = rowMaxCount * BASE_VIAL_WIDTH + (rowMaxCount - 1) * BASE_GAP;
//       const vialScale = baseTotalWidth > availableWidth ? availableWidth / baseTotalWidth : 1;

//       // Scaled dimensions
//       const vialWidth = BASE_VIAL_WIDTH * vialScale;
//       const vialBodyWidth = 48 * vialScale;
//       const vialBodyHeight = 162 * vialScale;
//       const vialCapWidth = 56 * vialScale;
//       const segmentHeight = 40 * vialScale;
//       const gapSize = BASE_GAP * vialScale;

//       const groupSegments = (tube: LiquidColor[]) => {
//             const groups: { color: LiquidColor; count: number }[] = [];
//             for (const color of tube) {
//                   if (groups.length > 0 && groups[groups.length - 1].color === color) {
//                         groups[groups.length - 1].count++;
//                   } else {
//                         groups.push({ color, count: 1 });
//                   }
//             }
//             return groups;
//       };

//       const renderVialSegments = (currentTube: LiquidColor[], idx: number) => {
//             const isSrc = pourState !== null && idx === pourState.srcIdx;
//             const isDest = pourState !== null && idx === pourState.destIdx;

//             if (pourState === null) {
//                   const groups = groupSegments(currentTube);
//                   let currentIdx = 0;
//                   return groups.map((group, groupIdx) => {
//                         const isFirst = currentIdx === 0;
//                         const isLast = currentIdx + group.count === currentTube.length;
//                         currentIdx += group.count;
//                         return (
//                               <View
//                                     key={`seg-${groupIdx}`}
//                                     style={[
//                                           styles.segment,
//                                           {
//                                                 backgroundColor: getSegmentColor(group.color),
//                                                 height: segmentHeight * group.count,
//                                           },
//                                           isFirst && styles.segmentBottom,
//                                           isLast && styles.segmentTop,
//                                     ]}
//                               />
//                         );
//                   });
//             }

//             const oldTube = pourState.oldTubes[idx] || [];

//             if (isSrc) {
//                   const staticCount = oldTube.length - pourState.count;
//                   const elements: React.ReactNode[] = [];

//                   const staticTube = oldTube.slice(0, staticCount);
//                   const staticGroups = groupSegments(staticTube);
//                   let currentIdx = 0;
//                   staticGroups.forEach((group, gIdx) => {
//                         const isFirst = currentIdx === 0;
//                         const isLast = currentIdx + group.count === staticCount && pourState.count === 0;
//                         elements.push(
//                               <View
//                                     key={`seg-static-${gIdx}`}
//                                     style={[
//                                           styles.segment,
//                                           {
//                                                 backgroundColor: getSegmentColor(group.color),
//                                                 height: segmentHeight * group.count,
//                                           },
//                                           isFirst && styles.segmentBottom,
//                                           isLast && styles.segmentTop,
//                                     ]}
//                               />
//                         );
//                         currentIdx += group.count;
//                   });

//                   if (pourState.count > 0) {
//                         const shrinkHeight = pourAnimation.interpolate({
//                               inputRange: [0, 1],
//                               outputRange: [segmentHeight * pourState.count, 0],
//                         });
//                         const shrinkOpacity = pourAnimation.interpolate({
//                               inputRange: [0.8, 1],
//                               outputRange: [1, 0],
//                         });

//                         elements.push(
//                               <Animated.View
//                                     key={`seg-shrink`}
//                                     style={[
//                                           styles.segment,
//                                           {
//                                                 backgroundColor: getSegmentColor(pourState.color),
//                                                 height: shrinkHeight,
//                                                 opacity: shrinkOpacity,
//                                           },
//                                           staticCount === 0 && styles.segmentBottom,
//                                           styles.segmentTop,
//                                     ]}
//                               />
//                         );
//                   }
//                   return elements;
//             }

//             if (isDest) {
//                   const elements: React.ReactNode[] = [];
//                   const staticGroups = groupSegments(oldTube);
//                   let currentIdx = 0;
//                   staticGroups.forEach((group, gIdx) => {
//                         const isFirst = currentIdx === 0;
//                         const isLast = currentIdx + group.count === oldTube.length && pourState.count === 0;
//                         elements.push(
//                               <View
//                                     key={`seg-static-${gIdx}`}
//                                     style={[
//                                           styles.segment,
//                                           {
//                                                 backgroundColor: getSegmentColor(group.color),
//                                                 height: segmentHeight * group.count,
//                                           },
//                                           isFirst && styles.segmentBottom,
//                                           isLast && styles.segmentTop,
//                                     ]}
//                               />
//                         );
//                         currentIdx += group.count;
//                   });

//                   if (pourState.count > 0) {
//                         const growHeight = pourAnimation.interpolate({
//                               inputRange: [0, 1],
//                               outputRange: [0, segmentHeight * pourState.count],
//                         });
//                         const growOpacity = pourAnimation.interpolate({
//                               inputRange: [0, 0.25],
//                               outputRange: [0, 1],
//                         });

//                         elements.push(
//                               <Animated.View
//                                     key={`seg-grow`}
//                                     style={[
//                                           styles.segment,
//                                           {
//                                                 backgroundColor: getSegmentColor(pourState.color),
//                                                 height: growHeight,
//                                                 opacity: growOpacity,
//                                           },
//                                           oldTube.length === 0 && styles.segmentBottom,
//                                           styles.segmentTop,
//                                     ]}
//                               />
//                         );
//                   }
//                   return elements;
//             }

//             const staticGroups = groupSegments(oldTube);
//             let currentIdx = 0;
//             return staticGroups.map((group, groupIdx) => {
//                   const isFirst = currentIdx === 0;
//                   const isLast = currentIdx + group.count === oldTube.length;
//                   currentIdx += group.count;
//                   return (
//                         <View
//                               key={`seg-${groupIdx}`}
//                               style={[
//                                     styles.segment,
//                                     {
//                                           backgroundColor: getSegmentColor(group.color),
//                                           height: segmentHeight * group.count,
//                                     },
//                                     isFirst && styles.segmentBottom,
//                                     isLast && styles.segmentTop,
//                               ]}
//                         />
//                   );
//             });
//       };

//       const renderCap = (isSelected: boolean, isTubeComplete: boolean) => {
//             const capBorderColor = isTubeComplete
//                   ? colors.warning
//                   : isSelected
//                         ? colors.cyanPrimary
//                         : '#ffffff';

//             return (
//                   <View
//                         style={{
//                               flexDirection: 'row',
//                               width: vialCapWidth,
//                               height: 10 * vialScale,
//                               alignItems: 'flex-end',
//                               marginBottom: -3.2 * vialScale,
//                               zIndex: 3,
//                         }}
//                   >
//                         <View
//                               style={{
//                                     width: 4 * vialScale,
//                                     height: 10 * vialScale,
//                                     borderLeftWidth: 2.2 * vialScale,
//                                     borderTopWidth: 2.2 * vialScale,
//                                     borderBottomWidth: 2.2 * vialScale,
//                                     borderColor: capBorderColor,
//                                     borderTopLeftRadius: 4 * vialScale,
//                                     borderBottomLeftRadius: 4 * vialScale,
//                               }}
//                         />
//                         <View
//                               style={{
//                                     flex: 1,
//                                     height: 10 * vialScale,
//                                     borderTopWidth: 2.2 * vialScale,
//                                     borderColor: capBorderColor,
//                               }}
//                         />
//                         <View
//                               style={{
//                                     width: 4 * vialScale,
//                                     height: 10 * vialScale,
//                                     borderRightWidth: 2.2 * vialScale,
//                                     borderTopWidth: 2.2 * vialScale,
//                                     borderBottomWidth: 2.2 * vialScale,
//                                     borderColor: capBorderColor,
//                                     borderTopRightRadius: 4 * vialScale,
//                                     borderBottomRightRadius: 4 * vialScale,
//                               }}
//                         />
//                   </View>
//             );
//       };

//       const renderVial = (tube: LiquidColor[], idx: number) => {
//             const isSelected = selectedTube === idx;
//             const vialAnimStyle = getVialAnimationStyle(idx);
//             const isDest = pourState !== null && idx === pourState.destIdx;
//             const oldTube = pourState ? pourState.oldTubes[idx] || [] : [];
//             const isTubeComplete = completedTubes[idx] || false;

//             return (
//                   <Pressable
//                         key={`vial-${idx}`}
//                         onPress={() => selectOrPour(idx)}
//                         disabled={pourState !== null}
//                         style={[styles.vialWrapper, { width: vialWidth }]}
//                         android_disableSound={true}
//                   >
//                         <Animated.View style={[styles.vialContainer, { width: vialWidth }, vialAnimStyle]}>
//                               {renderCap(isSelected, isTubeComplete)}
//                               <View
//                                     style={[
//                                           styles.vialBody,
//                                           {
//                                                 width: vialBodyWidth,
//                                                 height: vialBodyHeight,
//                                                 borderWidth: 2.2 * vialScale,
//                                                 borderBottomLeftRadius: 24 * vialScale,
//                                                 borderBottomRightRadius: 24 * vialScale
//                                           },
//                                           isSelected && { borderColor: colors.cyanPrimary, ...shadows.cyanSoft },
//                                           isTubeComplete && { borderColor: colors.warning },
//                                     ]}
//                               >
//                                     {renderVialSegments(tube, idx)}
//                                     <View style={[styles.vialReflection, { right: 5 * vialScale, top: 8 * vialScale, bottom: 8 * vialScale, width: 4 * vialScale, borderRadius: 2 * vialScale }]} pointerEvents="none" />
//                                     {isDest && (
//                                           <Animated.View
//                                                 style={[
//                                                       styles.pouringStream,
//                                                       {
//                                                             backgroundColor: getSegmentColor(pourState.color),
//                                                             shadowColor: getSegmentColor(pourState.color),
//                                                             left: 21 * vialScale,
//                                                             width: 6 * vialScale,
//                                                             borderRadius: 3 * vialScale,
//                                                             opacity: pourAnimation.interpolate({
//                                                                   inputRange: [0.15, 0.3, 0.7, 0.85],
//                                                                   outputRange: [0, 1, 1, 0],
//                                                             }),
//                                                             bottom: pourAnimation.interpolate({
//                                                                   inputRange: [0, 1],
//                                                                   outputRange: [oldTube.length * segmentHeight, (oldTube.length + pourState.count) * segmentHeight],
//                                                             }),
//                                                       },
//                                                 ]}
//                                           />
//                                     )}
//                                     <TubeCompleteBlast triggerCount={blastTriggers[idx] || 0} />
//                               </View>
//                         </Animated.View>
//                         <Text style={[styles.vialLabel, { fontSize: Math.max(8, 10 * vialScale) }, isSelected && { color: colors.cyanPrimary }]}>
//                               TUBE {idx + 1}
//                         </Text>
//                   </Pressable>
//             );
//       };

//       return (
//             <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
//                   <StatusBar barStyle="light-content" backgroundColor={colors.backgroundBase} translucent={false} hidden={false} />

//                   <View style={styles.container}>
//                         <ImageBackground source={BACKGROUND_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
//                         <View pointerEvents="none" style={styles.topGlow} />
//                         <View pointerEvents="none" style={styles.midGlow} />

//                         {/* Header Row */}
//                         <View style={[styles.headerRow, { width: contentWidth }]}>
//                               <View style={styles.headerLeft}>
//                                     <Pressable
//                                           onPress={() => {
//                                                 playSound('tap');
//                                                 onGoHome();
//                                           }}
//                                           accessibilityRole="button"
//                                           accessibilityLabel="Go back to hub"
//                                           style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
//                                           android_disableSound={true}
//                                     >
//                                           <Icon name="arrow-back" size={18} color="#ffffff" />
//                                     </Pressable>
//                               </View>
//                               <View style={styles.headerCenter}>
//                                     <Text style={styles.headerTitle}>WATER SORT</Text>
//                                     <Text style={styles.headerSubtitle}>LEVEL {level}</Text>
//                               </View>
//                               <View style={styles.headerRight}>
//                                     <Pressable
//                                           onPress={() => {
//                                                 playSound('tap');
//                                                 setPauseVisible(true);
//                                           }}
//                                           accessibilityRole="button"
//                                           accessibilityLabel="Pause Game"
//                                           style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
//                                           android_disableSound={true}
//                                     >
//                                           <Icon name="pause" size={18} color="#ffffff" />
//                                     </Pressable>
//                               </View>
//                         </View>

//                         {/* Confetti Particles solved layer */}
//                         {confettiActive && (
//                               <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
//                                     {confettiAnims.map((anim, i) => (
//                                           <Animated.View
//                                                 key={`confetti-${i}`}
//                                                 style={[
//                                                       styles.confetti,
//                                                       {
//                                                             left: width / 2,
//                                                             transform: [
//                                                                   { translateY: anim.y },
//                                                                   { translateX: anim.x },
//                                                                   {
//                                                                         rotate: anim.rotate.interpolate({
//                                                                               inputRange: [0, 1],
//                                                                               outputRange: ['0deg', '360deg'],
//                                                                         }),
//                                                                   },
//                                                             ],
//                                                             backgroundColor: anim.color,
//                                                             borderRadius: anim.shape === 'circle' ? anim.size / 2 : 2,
//                                                             width: anim.size,
//                                                             height: anim.size,
//                                                       },
//                                                 ]}
//                                           />
//                                     ))}
//                               </View>
//                         )}

//                         {/* Puzzle Board Space */}
//                         <ScrollView contentContainerStyle={styles.boardScroll} bounces={false}>
//                               <View style={[styles.vialsGridContainer, { width: contentWidth }]}>
//                                     <View style={styles.vialsRow}>
//                                           {tubes.slice(0, topCount).map((tube, subIdx) => renderVial(tube, subIdx))}
//                                     </View>
//                                     <View style={styles.vialsRow}>
//                                           {tubes.slice(topCount).map((tube, subIdx) => renderVial(tube, topCount + subIdx))}
//                                     </View>
//                               </View>
//                         </ScrollView>

//                         {/* Bottom controls row (Restart, Undo, Add Tube) */}
//                         <View style={[styles.bottomControlRow, { width: contentWidth }]}>
//                               {/* Restart Button */}
//                               <Pressable
//                                     onPress={handleRestart}
//                                     style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
//                                     accessibilityRole="button"
//                                     accessibilityLabel="Restart Level"
//                               >
//                                     <Icon name="refresh" size={20} color="#ffffff" />
//                               </Pressable>

//                               {/* Undo Button with small number badge on top-right */}
//                               <Pressable
//                                     onPress={handleUndo}
//                                     disabled={history.length === 0 || solved || pourState !== null}
//                                     style={({ pressed }) => [
//                                           styles.actionBtn,
//                                           pressed && styles.actionBtnPressed,
//                                           (history.length === 0 || pourState !== null) && { opacity: 0.5 },
//                                     ]}
//                                     accessibilityRole="button"
//                                     accessibilityLabel="Undo Move"
//                                     android_disableSound={true}
//                               >
//                                     <Icon name="arrow-undo-outline" size={20} color="#ffffff" />
//                                     <View style={styles.undoBadge}>
//                                           <Text style={styles.undoBadgeText}>{undoCount}</Text>
//                                     </View>
//                               </Pressable>

//                               {/* Add Tube Button */}
//                               <Pressable
//                                     onPress={() => {
//                                           if (!extraTubeAdded) {
//                                                 playSound('tap');
//                                                 setShowExtraTubeModal(true);
//                                           }
//                                     }}
//                                     disabled={extraTubeAdded || solved}
//                                     style={({ pressed }) => [
//                                           styles.actionBtn,
//                                           pressed && styles.actionBtnPressed,
//                                           (extraTubeAdded || solved) && { opacity: 0.5 },
//                                     ]}
//                                     accessibilityRole="button"
//                                     accessibilityLabel="Add Extra Tube"
//                                     android_disableSound={true}
//                               >
//                                     <View style={styles.addTubeBtnInner}>
//                                           <Icon name="flask-outline" size={16} color="#ffffff" />
//                                           <Icon name="add" size={10} color="#ffffff" style={styles.addSymbol} />
//                                     </View>
//                                     <Icon name="play-circle-outline" size={10} color="#ffffff" style={styles.adVideoIcon} />
//                               </Pressable>
//                         </View>

//                         {/* Solved Popup Dialog with Reply & Next */}
//                         {solved && (
//                               <View style={styles.solvedCardWrap}>
//                                     <View style={[styles.solvedCard, { width: Math.min(contentWidth, 340) }]}>
//                                           <View style={styles.solvedIconOrb}>
//                                                 <Icon name="sparkles-outline" size={30} color={colors.cyanBright} />
//                                           </View>
//                                           <Text style={styles.solvedTitle}>LEVEL COMPLETED</Text>
//                                           <Text style={styles.solvedSubtitle}>All elements sorted in {movesCount} moves!</Text>

//                                           <View style={styles.solvedBtnRow}>
//                                                 <Pressable
//                                                       onPress={handleRestart}
//                                                       style={({ pressed }) => [styles.solvedReplayBtn, pressed && styles.btnPressed]}
//                                                       android_disableSound={true}
//                                                 >
//                                                       <Icon name="refresh" size={16} color={colors.pinkPrimary} />
//                                                       <Text style={styles.solvedReplayText}>REPLAY</Text>
//                                                 </Pressable>

//                                                 <Pressable
//                                                       onPress={handleNextLevel}
//                                                       style={({ pressed }) => [styles.solvedNextBtn, pressed && styles.btnPressed]}
//                                                       android_disableSound={true}
//                                                 >
//                                                       <Text style={styles.solvedNextText}>NEXT LEVEL</Text>
//                                                       <Icon name="arrow-forward" size={16} color={colors.textPrimary} />
//                                                 </Pressable>
//                                           </View>
//                                     </View>
//                               </View>
//                         )}

//                         {/* Add Tube Confirmation Modal */}
//                         <Modal
//                               transparent
//                               visible={showExtraTubeModal}
//                               animationType="fade"
//                               onRequestClose={() => setShowExtraTubeModal(false)}
//                         >
//                               <Pressable
//                                     style={styles.modalBackdrop}
//                                     onPress={() => {
//                                           playSound('tap');
//                                           setShowExtraTubeModal(false);
//                                     }}
//                                     android_disableSound={true}
//                               >
//                                     <View style={[styles.modalCard, { width: Math.min(contentWidth, 340) }]}>
//                                           <View style={styles.modalHeaderTag}>
//                                                 <Icon name="flask-outline" size={18} color={colors.warning} />
//                                                 <Text style={styles.modalHeaderTagText}>EXTRA VIAL</Text>
//                                           </View>

//                                           <Text style={styles.modalTitle}>Unlock Extra Tube</Text>
//                                           <Text style={styles.modalSubtitle}>Watch 5 short video ads to add an empty tube to this level.</Text>

//                                           <View style={styles.progressBarTrack}>
//                                                 <View style={[styles.progressBarFill, { width: `${(extraTubeAdCount / 5) * 100}%` }]} />
//                                           </View>
//                                           <Text style={styles.progressText}>{extraTubeAdCount} / 5 ADS WATCHED</Text>

//                                           <Pressable
//                                                 onPress={() => {
//                                                       playSound('tap');
//                                                       handleWatchAdForExtraTube();
//                                                 }}
//                                                 style={({ pressed }) => [styles.modalWatchBtn, pressed && styles.btnPressed]}
//                                                 android_disableSound={true}
//                                           >
//                                                 <Icon name="play-circle" size={18} color={colors.backgroundBase} />
//                                                 <Text style={styles.modalWatchText}>WATCH VIDEO AD</Text>
//                                           </Pressable>

//                                           <Pressable
//                                                 onPress={() => {
//                                                       playSound('tap');
//                                                       setShowExtraTubeModal(false);
//                                                 }}
//                                                 style={styles.modalCancelBtn}
//                                                 android_disableSound={true}
//                                           >
//                                                 <Text style={styles.modalCancelText}>CANCEL</Text>
//                                           </Pressable>
//                                     </View>
//                               </Pressable>
//                         </Modal>

//                         {/* Water Sort Stats Modal */}
//                         <Modal
//                               transparent
//                               visible={showStatsModal}
//                               animationType="fade"
//                               onRequestClose={() => setShowStatsModal(false)}
//                         >
//                               <Pressable
//                                     style={styles.modalBackdrop}
//                                     onPress={() => {
//                                           playSound('tap');
//                                           setShowStatsModal(false);
//                                     }}
//                                     android_disableSound={true}
//                               >
//                                     <View style={[styles.modalCard, { width: Math.min(contentWidth, 340) }]}>
//                                           <View style={styles.modalHeaderTag}>
//                                                 <Icon name="trophy-outline" size={18} color={colors.warning} />
//                                                 <Text style={styles.modalHeaderTagText}>CAREER STATS</Text>
//                                           </View>

//                                           <Text style={styles.modalTitle}>Water Sort Records</Text>
//                                           <Text style={styles.modalSubtitle}>Your lifetime achievements</Text>

//                                           {stats ? (
//                                                 <View style={styles.statsContent}>
//                                                       <View style={styles.statLine}>
//                                                             <Text style={styles.statLabel}>Completed Levels</Text>
//                                                             <Text style={styles.statVal}>{stats.levelsCompleted}</Text>
//                                                       </View>
//                                                       <View style={styles.statLine}>
//                                                             <Text style={styles.statLabel}>Current Streak</Text>
//                                                             <Text style={[styles.statVal, { color: colors.cyanPrimary }]}>{stats.currentStreak} 🔥</Text>
//                                                       </View>
//                                                       <View style={styles.statLine}>
//                                                             <Text style={styles.statLabel}>Best Streak</Text>
//                                                             <Text style={[styles.statVal, { color: colors.pinkPrimary }]}>{stats.bestStreak} 🏆</Text>
//                                                       </View>
//                                                       <View style={styles.statLine}>
//                                                             <Text style={styles.statLabel}>Total Moves</Text>
//                                                             <Text style={styles.statVal}>{stats.totalMoves}</Text>
//                                                       </View>

//                                                       <Pressable
//                                                             onPress={async () => {
//                                                                   playSound('tap');
//                                                                   const res = await resetWaterSortStats();
//                                                                   setStats(res);
//                                                             }}
//                                                             style={styles.modalResetBtn}
//                                                             android_disableSound={true}
//                                                       >
//                                                             <Text style={styles.modalResetText}>RESET ALL RECORDS</Text>
//                                                       </Pressable>
//                                                 </View>
//                                           ) : (
//                                                 <Text style={styles.modalSubtitle}>Loading statistics...</Text>
//                                           )}

//                                           <Pressable
//                                                 onPress={() => {
//                                                       playSound('tap');
//                                                       setShowStatsModal(false);
//                                                 }}
//                                                 style={styles.modalCancelBtn}
//                                                 android_disableSound={true}
//                                           >
//                                                 <Text style={styles.modalCancelText}>CLOSE</Text>
//                                           </Pressable>
//                                     </View>
//                               </Pressable>
//                         </Modal>

//                         {/* Ad Banner bottom */}
//                         {adsReady && (
//                               <View style={styles.adWrap}>
//                                     <AdBanner compact />
//                               </View>
//                         )}
//                   </View>
//             </SafeAreaView>
//       );
// };

// const getStyles = (colors: any, shadows: any, themeName?: string) =>
//       StyleSheet.create({
//             safeArea: {
//                   flex: 1,
//                   backgroundColor: colors.backgroundBase,
//             },
//             container: {
//                   flex: 1,
//                   backgroundColor: colors.backgroundBase,
//             },
//             topGlow: {
//                   position: 'absolute',
//                   width: 520,
//                   height: 520,
//                   borderRadius: 520,
//                   top: -290,
//                   left: -70,
//                   backgroundColor: colors.glowPrimary,
//             },
//             midGlow: {
//                   position: 'absolute',
//                   width: 440,
//                   height: 440,
//                   borderRadius: 440,
//                   right: -240,
//                   top: 260,
//                   backgroundColor: colors.glowPrimary,
//             },
//             headerRow: {
//                   alignSelf: 'center',
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   paddingHorizontal: spacing.md,
//                   paddingTop: spacing.sm,
//                   marginBottom: spacing.lg,
//                   zIndex: 10,
//                   width: '100%',
//             },
//             headerLeft: {
//                   flexDirection: 'row',
//                   alignItems: 'center',
//             },
//             headerRight: {
//                   flexDirection: 'row',
//                   alignItems: 'center',
//             },
//             movesBadge: {
//                   backgroundColor: 'rgba(255, 255, 255, 0.08)',
//                   borderColor: 'rgba(255, 255, 255, 0.12)',
//                   borderWidth: 1,
//                   borderRadius: radii.sm,
//                   paddingHorizontal: 8,
//                   paddingVertical: 4,
//                   marginLeft: 8,
//             },
//             movesBadgeText: {
//                   color: colors.textSecondary,
//                   fontSize: 10,
//                   fontFamily: typography.family.bold,
//             },
//             headerCenter: {
//                   flex: 1,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//             },
//             headerTitle: {
//                   color: colors.textPrimary,
//                   fontSize: 15,
//                   letterSpacing: typography.tracking.wide,
//                   textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
//                   textShadowOffset: { width: 0, height: 0 },
//                   textShadowRadius: 6,
//                   fontFamily: typography.family.black,
//             },
//             headerSubtitle: {
//                   color: colors.pinkPrimary,
//                   fontSize: 10,
//                   letterSpacing: 1.5,
//                   marginTop: 2,
//                   fontFamily: typography.family.black,
//             },
//             iconBtn: {
//                   width: 38,
//                   height: 38,
//                   borderRadius: radii.md,
//                   borderWidth: 1.2,
//                   borderColor: 'rgba(255, 255, 255, 0.08)',
//                   backgroundColor: colors.cardSurfaceSoft,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//             },
//             iconBtnPressed: {
//                   opacity: 0.8,
//                   transform: [{ scale: 0.95 }],
//             },
//             boardScroll: {
//                   flexGrow: 1,
//                   justifyContent: 'center',
//                   paddingBottom: spacing.lg,
//             },
//             vialsGridContainer: {
//                   alignSelf: 'center',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: 22,
//                   paddingHorizontal: spacing.md,
//             },
//             vialsRow: {
//                   flexDirection: 'row',
//                   justifyContent: 'center',
//                   gap: 18,
//             },
//             vialWrapper: {
//                   alignItems: 'center',
//                   width: 60,
//             },
//             vialContainer: {
//                   alignItems: 'center',
//                   width: 60,
//                   position: 'relative',
//             },
//             vialCap: {
//                   width: 56,
//                   height: 10,
//                   borderWidth: 2.2,
//                   borderColor: '#ffffff',
//                   backgroundColor: '#03052f', // match background theme
//                   borderTopLeftRadius: 4,
//                   borderTopRightRadius: 4,
//                   borderBottomLeftRadius: 6,
//                   borderBottomRightRadius: 6,
//                   marginBottom: -3.5,
//                   zIndex: 3,
//             },
//             vialBody: {
//                   width: 48,
//                   height: 162,
//                   borderWidth: 2.2,
//                   borderTopWidth: 0,
//                   borderColor: '#ffffff', // solid white border
//                   backgroundColor: 'rgba(255, 255, 255, 0.06)',
//                   borderBottomLeftRadius: 24,
//                   borderBottomRightRadius: 24,
//                   overflow: 'hidden',
//                   paddingBottom: 2,
//                   flexDirection: 'column-reverse',
//                   zIndex: 2,
//             },
//             vialReflection: {
//                   position: 'absolute',
//                   right: 5,
//                   top: 8,
//                   bottom: 8,
//                   width: 4,
//                   borderRadius: 2,
//                   backgroundColor: 'rgba(255, 255, 255, 0.16)',
//                   zIndex: 4,
//             },
//             segment: {
//                   height: 40,
//                   marginHorizontal: 0,
//                   marginVertical: 0,
//             },
//             pouringStream: {
//                   position: 'absolute',
//                   top: 0,
//                   left: 21,
//                   width: 6,
//                   borderRadius: 3,
//                   opacity: 0,
//                   shadowOffset: { width: 0, height: 0 },
//                   shadowOpacity: 0.8,
//                   shadowRadius: 4,
//                   elevation: 3,
//             },
//             segmentBottom: {
//                   borderBottomLeftRadius: 20,
//                   borderBottomRightRadius: 20,
//             },
//             segmentTop: {
//                   borderTopLeftRadius: 2,
//                   borderTopRightRadius: 2,
//             },
//             vialLabel: {
//                   marginTop: 8,
//                   color: colors.textSecondary,
//                   fontSize: 9,
//                   letterSpacing: 0.5,
//                   fontFamily: typography.family.bold,
//             },
//             tubeSparkle: {
//                   position: 'absolute',
//                   width: 6,
//                   height: 6,
//                   borderRadius: 3,
//                   backgroundColor: '#ffff00',
//                   shadowColor: '#ffff00',
//                   shadowOffset: { width: 0, height: 0 },
//                   shadowOpacity: 0.9,
//                   shadowRadius: 4,
//             },
//             confetti: {
//                   position: 'absolute',
//                   zIndex: 5,
//             },
//             bottomControlRow: {
//                   alignSelf: 'center',
//                   flexDirection: 'row',
//                   justifyContent: 'center',
//                   gap: 32,
//                   paddingVertical: spacing.md,
//                   alignItems: 'center',
//                   zIndex: 10,
//             },
//             actionBtn: {
//                   width: 54,
//                   height: 54,
//                   borderRadius: radii.md,
//                   borderWidth: 2,
//                   borderColor: colors.cyanBorder,
//                   backgroundColor: colors.cardSurfaceSoft,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   position: 'relative',
//                   ...shadows.cyanSoft,
//             },
//             actionBtnPressed: {
//                   opacity: 0.8,
//                   transform: [{ scale: 0.95 }],
//             },
//             undoBadge: {
//                   position: 'absolute',
//                   top: -6,
//                   right: -6,
//                   backgroundColor: colors.pinkPrimary,
//                   borderRadius: 9,
//                   width: 18,
//                   height: 18,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   borderWidth: 1,
//                   borderColor: '#ffffff',
//             },
//             undoBadgeText: {
//                   color: '#ffffff',
//                   fontSize: 8,
//                   fontFamily: typography.family.black,
//             },
//             addTubeBtnInner: {
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//             },
//             addSymbol: {
//                   marginLeft: -2,
//                   marginTop: -6,
//             },
//             adVideoIcon: {
//                   position: 'absolute',
//                   bottom: 2,
//                   right: 2,
//             },
//             solvedCardWrap: {
//                   ...StyleSheet.absoluteFillObject,
//                   backgroundColor: colors.overlayDark,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   paddingHorizontal: spacing.lg,
//                   zIndex: 20,
//             },
//             solvedCard: {
//                   borderRadius: radii.xxl,
//                   borderWidth: 2,
//                   borderColor: colors.cyanBorder,
//                   backgroundColor: colors.cardSurfaceStrong,
//                   padding: spacing.lg,
//                   alignItems: 'center',
//                   ...shadows.cyanStrong,
//             },
//             solvedIconOrb: {
//                   width: 60,
//                   height: 60,
//                   borderRadius: 30,
//                   borderWidth: 1.5,
//                   borderColor: colors.cyanBorder,
//                   backgroundColor: colors.cardSurfaceSoft,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   marginBottom: spacing.sm,
//                   ...shadows.cyanSoft,
//             },
//             solvedTitle: {
//                   color: colors.cyanPrimary,
//                   fontSize: 18,
//                   letterSpacing: 1.2,
//                   textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
//                   textShadowOffset: { width: 0, height: 0 },
//                   textShadowRadius: 8,
//                   textAlign: 'center',
//                   fontFamily: typography.family.black,
//             },
//             solvedSubtitle: {
//                   color: colors.textSecondary,
//                   fontSize: 11,
//                   textAlign: 'center',
//                   marginTop: 4,
//                   marginBottom: spacing.md,
//                   fontFamily: typography.family.semibold,
//             },
//             solvedBtnRow: {
//                   flexDirection: 'row',
//                   gap: spacing.sm,
//                   width: '100%',
//             },
//             solvedReplayBtn: {
//                   flex: 1,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: spacing.xs,
//                   borderColor: colors.pinkBorder,
//                   borderWidth: 1.6,
//                   backgroundColor: colors.cardSurfaceAlt,
//                   borderRadius: radii.lg,
//                   paddingVertical: spacing.sm,
//                   minHeight: 48,
//                   ...shadows.pinkSoft,
//             },
//             solvedReplayText: {
//                   color: colors.textPrimary,
//                   fontSize: 13,
//                   fontFamily: typography.family.black,
//             },
//             solvedNextBtn: {
//                   flex: 1,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: spacing.xs,
//                   borderColor: colors.cyanPrimary,
//                   borderWidth: 1.6,
//                   backgroundColor: colors.cardSurface,
//                   borderRadius: radii.lg,
//                   paddingVertical: spacing.sm,
//                   minHeight: 48,
//                   ...shadows.cyanSoft,
//             },
//             solvedNextText: {
//                   color: colors.textPrimary,
//                   fontSize: 13,
//                   fontFamily: typography.family.black,
//             },
//             btnPressed: {
//                   opacity: 0.82,
//                   transform: [{ scale: 0.985 }],
//             },
//             modalBackdrop: {
//                   flex: 1,
//                   backgroundColor: colors.overlayDark,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   paddingHorizontal: spacing.lg,
//             },
//             modalCard: {
//                   backgroundColor: colors.cardSurfaceStrong,
//                   borderRadius: radii.xxl,
//                   borderWidth: 2,
//                   borderColor: colors.cyanBorder,
//                   padding: spacing.lg,
//                   alignItems: 'center',
//                   ...shadows.cyanStrong,
//             },
//             modalHeaderTag: {
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 6,
//                   borderRadius: radii.pill,
//                   borderWidth: 1,
//                   borderColor: colors.warning,
//                   backgroundColor: 'rgba(255, 203, 85, 0.08)',
//                   paddingVertical: 4,
//                   paddingHorizontal: 12,
//                   marginBottom: spacing.sm,
//             },
//             modalHeaderTagText: {
//                   color: colors.warning,
//                   fontSize: 9,
//                   letterSpacing: 1,
//                   fontFamily: typography.family.black,
//             },
//             modalTitle: {
//                   color: colors.textPrimary,
//                   fontSize: 18,
//                   textAlign: 'center',
//                   marginBottom: 4,
//                   fontFamily: typography.family.black,
//             },
//             modalSubtitle: {
//                   color: colors.textSecondary,
//                   fontSize: 11,
//                   textAlign: 'center',
//                   marginBottom: spacing.md,
//                   lineHeight: 16,
//                   fontFamily: typography.family.body,
//             },
//             progressBarTrack: {
//                   width: '100%',
//                   height: 8,
//                   backgroundColor: 'rgba(255,255,255,0.08)',
//                   borderRadius: 4,
//                   overflow: 'hidden',
//                   marginBottom: 6,
//             },
//             progressBarFill: {
//                   height: '100%',
//                   backgroundColor: colors.warning,
//             },
//             progressText: {
//                   color: colors.warning,
//                   fontSize: 9,
//                   marginBottom: spacing.md,
//                   fontFamily: typography.family.bold,
//             },
//             modalWatchBtn: {
//                   width: '100%',
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: spacing.xs,
//                   backgroundColor: colors.warning,
//                   borderRadius: radii.lg,
//                   paddingVertical: spacing.sm,
//                   minHeight: 48,
//             },
//             modalWatchText: {
//                   color: colors.backgroundBase,
//                   fontSize: 13,
//                   letterSpacing: 0.5,
//                   fontFamily: typography.family.black,
//             },
//             modalCancelBtn: {
//                   marginTop: spacing.sm,
//                   paddingVertical: spacing.xs,
//             },
//             modalCancelText: {
//                   color: colors.textSecondary,
//                   fontSize: 11,
//                   fontFamily: typography.family.bold,
//             },
//             statsContent: {
//                   width: '100%',
//                   marginVertical: spacing.xs,
//             },
//             statLine: {
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   paddingVertical: 8,
//                   borderBottomWidth: 1,
//                   borderBottomColor: 'rgba(255, 255, 255, 0.05)',
//             },
//             statLabel: {
//                   color: colors.textSecondary,
//                   fontSize: 12,
//                   fontFamily: typography.family.semibold,
//             },
//             statVal: {
//                   color: colors.textPrimary,
//                   fontSize: 12,
//                   fontFamily: typography.family.black,
//             },
//             modalResetBtn: {
//                   marginTop: spacing.md,
//                   alignSelf: 'center',
//                   borderWidth: 1,
//                   borderColor: colors.pinkBorder,
//                   paddingVertical: 6,
//                   paddingHorizontal: 12,
//                   borderRadius: radii.sm,
//             },
//             modalResetText: {
//                   color: colors.pinkPrimary,
//                   fontSize: 9,
//                   fontFamily: typography.family.bold,
//             },
//             adWrap: {
//                   width: '100%',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   paddingBottom: Platform.OS === 'ios' ? 0 : 4,
//                   marginTop: spacing.xs,
//             },
//       });

// export default WaterSortScreen;




import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
      Animated,
      BackHandler,
      Easing,
      ImageBackground,
      Modal,
      Platform,
      Pressable,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      View,
      useWindowDimensions,
      Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
const BACKGROUND_IMG = require('../assets/images/bgr_2.png');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';
import { getContentWidth, scaleSize } from '../theme/responsive';
import PauseModal from '../components/PauseModal';
import AdBanner from '../components/AdBanner';
import { useGameSounds } from '../hooks/useGameSounds';
import { hexToRgba } from '../theme/themes';
import { useAdMob } from '../hooks/useAdMob';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
      getWaterSortStats,
      recordWaterSortLevelCompleted,
      resetWaterSortStats,
      WaterSortStats,
} from '../services/waterSortStats';
interface WaterSortScreenProps {
      onGoHome: () => void;
      onOpenSettings: () => void;
      adsReady: boolean;
      soundEnabled: boolean;
      vibrationEnabled: boolean;
}
type LiquidColor = 'cyan' | 'pink' | 'warning' | 'accent' | 'purple' | 'orange' | 'yellow';
const STORAGE_LEVEL_KEY = '@webwave_tic_tac_toe:water_sort_level';
// 7 distinct neon colors
const ALL_COLORS: LiquidColor[] = ['cyan', 'pink', 'warning', 'accent', 'purple', 'orange', 'yellow'];
const HANDCRAFTED_LEVELS: LiquidColor[][][] = [
      // Level 1: 3 filled, 2 empty
      [
            ['cyan', 'pink', 'cyan', 'pink'],
            ['pink', 'cyan', 'pink', 'warning'],
            ['warning', 'warning', 'warning', 'cyan'],
            [],
            [],
      ],
      // Level 2: 3 filled, 2 empty
      [
            ['warning', 'pink', 'cyan', 'warning'],
            ['pink', 'cyan', 'pink', 'cyan'],
            ['cyan', 'warning', 'warning', 'pink'],
            [],
            [],
      ],
      // Level 3: 4 filled, 2 empty (4 colors)
      [
            ['cyan', 'pink', 'warning', 'accent'],
            ['accent', 'warning', 'pink', 'cyan'],
            ['pink', 'cyan', 'accent', 'warning'],
            ['warning', 'accent', 'cyan', 'pink'],
            [],
            [],
      ],
      // Level 4: 4 filled, 2 empty
      [
            ['accent', 'cyan', 'pink', 'accent'],
            ['warning', 'warning', 'cyan', 'pink'],
            ['cyan', 'accent', 'warning', 'pink'],
            ['pink', 'accent', 'cyan', 'warning'],
            [],
            [],
      ],
      // Level 5: 4 filled, 2 empty (Challenging mix)
      [
            ['pink', 'warning', 'accent', 'cyan'],
            ['cyan', 'pink', 'warning', 'accent'],
            ['accent', 'cyan', 'pink', 'warning'],
            ['warning', 'accent', 'cyan', 'pink'],
            [],
            [],
      ],
];
// Seeded Random helper for deterministic level generation
class SeededRandom {
      private seed: number;
      constructor(seed: number) {
            this.seed = seed;
      }
      next(): number {
            this.seed = (this.seed * 9301 + 49297) % 233280;
            return this.seed / 233280;
      }
      range(min: number, max: number): number {
            return Math.floor(min + this.next() * (max - min));
      }
      shuffle<T>(array: T[]): T[] {
            const copy = [...array];
            for (let i = copy.length - 1; i > 0; i--) {
                  const j = this.range(0, i + 1);
                  const temp = copy[i];
                  copy[i] = copy[j];
                  copy[j] = temp;
            }
            return copy;
      }
}
// Generate deterministic level based on level index (0-indexed)
const getWaterSortLevel = (levelIdx: number): LiquidColor[][] => {
      if (levelIdx < HANDCRAFTED_LEVELS.length) {
            return HANDCRAFTED_LEVELS[levelIdx].map(t => [...t]);
      }
      const rng = new SeededRandom(levelIdx * 1234 + 567);
      let colorCount = 4;
      if (levelIdx >= 40) colorCount = 7;
      else if (levelIdx >= 25) colorCount = 6;
      else if (levelIdx >= 10) colorCount = 5;
      const selectedColors = ALL_COLORS.slice(0, colorCount);
      const segments: LiquidColor[] = [];
      selectedColors.forEach(c => {
            for (let i = 0; i < 4; i++) {
                  segments.push(c);
            }
      });
      const shuffled = rng.shuffle(segments);
      const tubesList: LiquidColor[][] = [];
      for (let i = 0; i < colorCount; i++) {
            tubesList.push(shuffled.slice(i * 4, (i + 1) * 4));
      }
      // Add 2 empty tubes
      tubesList.push([]);
      tubesList.push([]);
      return tubesList;
};
interface ParticleConfig {
      angle: number;
      distance: number;
      color: string;
      shape: 'square' | 'circle' | 'triangle' | 'bar';
      size: number;
      spin: number;
      delay: number;
}
const TubeCompleteBlast = ({ triggerCount }: { triggerCount: number }) => {
      const progress = useRef(new Animated.Value(0)).current;
      const particles = useRef<ParticleConfig[]>(
            Array.from({ length: 36 }, () => {
                  // Wide upward fountain: angles from -45 to 225 degrees
                  const angle = (Math.random() * 270 - 45) * (Math.PI / 180);
                  const distance = 80 + Math.random() * 200;
                  const color = ['#00f5ff', '#ff75c3', '#39ff14', '#ffff00', '#b026ff', '#ff5e00'][
                        Math.floor(Math.random() * 6)
                  ];
                  const shape = ['square', 'circle', 'triangle', 'bar'][Math.floor(Math.random() * 4)] as any;
                  const size = 10 + Math.random() * 12;
                  const spin = Math.random() * 720 - 360;
                  const delay = Math.random() * 120;
                  return { angle, distance, color, shape, size, spin, delay };
            })
      ).current;
      useEffect(() => {
            if (triggerCount > 0) {
                  progress.setValue(0);
                  Animated.timing(progress, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                  }).start();
            }
      }, [triggerCount]);
      if (triggerCount === 0) return null;
      return (
            <View
                  style={{
                        position: 'absolute',
                        left: '50%',
                        top: '35%',
                        width: 0,
                        height: 0,
                        overflow: 'visible',
                        zIndex: 999,
                  }}
                  pointerEvents="none"
            >
                  {particles.map((p, i) => {
                        const translateX = progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, Math.cos(p.angle) * p.distance],
                        });
                        const translateY = progress.interpolate({
                              inputRange: [0, 0.25, 1],
                              outputRange: [0, -50, Math.sin(p.angle) * p.distance + 40],
                        });
                        const rotate = progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', `${p.spin}deg`],
                        });
                        const opacity = progress.interpolate({
                              inputRange: [0, 0.75, 1],
                              outputRange: [1, 1, 0],
                        });
                        const scale = progress.interpolate({
                              inputRange: [0, 0.15, 1],
                              outputRange: [0.1, 1.4, 0.5],
                        });
                        return (
                              <Animated.View
                                    key={`p-${i}`}
                                    style={{
                                          position: 'absolute',
                                          opacity,
                                          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
                                          zIndex: 999,
                                    }}
                              >
                                    {p.shape === 'circle' && (
                                          <View
                                                style={{
                                                      width: p.size,
                                                      height: p.size,
                                                      borderRadius: p.size / 2,
                                                      backgroundColor: p.color,
                                                      shadowColor: p.color,
                                                      shadowOffset: { width: 0, height: 0 },
                                                      shadowOpacity: 0.9,
                                                      shadowRadius: 5,
                                                      elevation: 5,
                                                }}
                                          />
                                    )}
                                    {p.shape === 'square' && (
                                          <View
                                                style={{
                                                      width: p.size,
                                                      height: p.size,
                                                      backgroundColor: p.color,
                                                      shadowColor: p.color,
                                                      shadowOffset: { width: 0, height: 0 },
                                                      shadowOpacity: 0.9,
                                                      shadowRadius: 5,
                                                      elevation: 5,
                                                }}
                                          />
                                    )}
                                    {p.shape === 'bar' && (
                                          <View
                                                style={{
                                                      width: p.size * 1.8,
                                                      height: 4,
                                                      backgroundColor: p.color,
                                                      shadowColor: p.color,
                                                      shadowOffset: { width: 0, height: 0 },
                                                      shadowOpacity: 0.9,
                                                      shadowRadius: 5,
                                                      elevation: 5,
                                                }}
                                          />
                                    )}
                                    {p.shape === 'triangle' && (
                                          <View
                                                style={{
                                                      width: 0,
                                                      height: 0,
                                                      backgroundColor: 'transparent',
                                                      borderStyle: 'solid',
                                                      borderLeftWidth: p.size / 2,
                                                      borderRightWidth: p.size / 2,
                                                      borderBottomWidth: p.size,
                                                      borderLeftColor: 'transparent',
                                                      borderRightColor: 'transparent',
                                                      borderBottomColor: p.color,
                                                      shadowColor: p.color,
                                                      shadowOffset: { width: 0, height: 0 },
                                                      shadowOpacity: 0.9,
                                                      shadowRadius: 5,
                                                      elevation: 5,
                                                }}
                                          />
                                    )}
                              </Animated.View>
                        );
                  })}
            </View>
      );
};
const WaterSortScreen = ({
      onGoHome,
      onOpenSettings,
      adsReady,
      soundEnabled,
      vibrationEnabled,
}: WaterSortScreenProps) => {
      const { width, height } = useWindowDimensions();
      const { theme } = useTheme();
      const { colors, shadows } = theme;
      const styles = useMemo(() => getStyles(colors, shadows, theme.name), [colors, shadows, theme.name]);
      const contentWidth = getContentWidth(width, 16, 560);
      const compact = height < 760;
      // Sound and Ad Hooks
      const { playSound } = useGameSounds(soundEnabled);
      const { incrementRoundsAndMaybeShowAd, showInterstitial, showRewarded } = useAdMob(adsReady, false);
      // States
      const [level, setLevel] = useState(0);
      const [tubes, setTubes] = useState<LiquidColor[][]>([]);
      const [selectedTube, setSelectedTube] = useState<number | null>(null);
      const [history, setHistory] = useState<LiquidColor[][][]>([]);
      const [solved, setSolved] = useState(false);
      const [pauseVisible, setPauseVisible] = useState(false);
      // Undo & Extra Tube Mechanics
      const [undoCount, setUndoCount] = useState(5);
      const [extraTubeAdCount, setExtraTubeAdCount] = useState(0);
      const [showExtraTubeModal, setShowExtraTubeModal] = useState(false);
      const [extraTubeAdded, setExtraTubeAdded] = useState(false);
      // Statistics
      const [stats, setStats] = useState<WaterSortStats | null>(null);
      const [showStatsModal, setShowStatsModal] = useState(false);
      const [movesCount, setMovesCount] = useState(0);
      // Tube complete local animations state
      const [completedTubes, setCompletedTubes] = useState<boolean[]>([]);
      const [blastTriggers, setBlastTriggers] = useState<number[]>(new Array(15).fill(0));
      // Confetti particles
      const [confettiActive, setConfettiActive] = useState(false);
      const confettiAnims = useRef(
            Array.from({ length: 60 }, () => ({
                  y: new Animated.Value(-100),
                  x: new Animated.Value(0),
                  rotate: new Animated.Value(0),
                  color: ['#00f5ff', '#ff75c3', '#39ff14', '#ffff00', '#b026ff', '#ff5e00', '#00d2ff', '#e21a62'][Math.floor(Math.random() * 8)],
                  size: Math.random() * 10 + 12,
                  shape: Math.random() > 0.5 ? 'circle' : 'square',
            }))
      ).current;
      // Animation states for fluid sorting
      const [pourState, setPourState] = useState<{
            srcIdx: number;
            destIdx: number;
            color: LiquidColor;
            count: number;
            oldTubes: LiquidColor[][];
            newTubes: LiquidColor[][];
      } | null>(null);
      const pourAnimation = useRef(new Animated.Value(0)).current;
      // Load level progress and stats
      useEffect(() => {
            AsyncStorage.getItem(STORAGE_LEVEL_KEY)
                  .then(val => {
                        if (val) {
                              setLevel(parseInt(val, 10));
                        } else {
                              setLevel(0);
                        }
                  })
                  .catch(() => setLevel(0));
            getWaterSortStats().then(setStats).catch(() => { });
      }, []);
      // Set up level board when level changes
      useEffect(() => {
            const rawLevel = getWaterSortLevel(level);
            setTubes(rawLevel);
            setSelectedTube(null);
            setHistory([]);
            setSolved(false);
            setPourState(null);
            setMovesCount(0);
            setUndoCount(5);
            setExtraTubeAdCount(0);
            setExtraTubeAdded(false);
            setCompletedTubes(new Array(rawLevel.length).fill(false));
            setConfettiActive(false);
      }, [level]);
      // Check solved state
      const checkSolvedState = useCallback(
            (currentTubes: LiquidColor[][]) => {
                  const isCompleted = currentTubes.every(tube => {
                        if (tube.length === 0) return true;
                        if (tube.length < 4) return false;
                        const first = tube[0];
                        return tube.every(seg => seg === first);
                  });
                  if (isCompleted) {
                        setSolved(true);
                        setBlastTriggers(prev => {
                              return prev.map((val, idx) => {
                                    if (idx < currentTubes.length) {
                                          return val + 1;
                                    }
                                    return val;
                              });
                        });
                        setConfettiActive(true);
                        playSound('win');
                        if (vibrationEnabled) {
                              import('react-native').then(({ Vibration }) => {
                                    Vibration.vibrate([0, 50, 30, 50]);
                              });
                        }
                        // Save completed level stats
                        recordWaterSortLevelCompleted(movesCount)
                              .then(setStats)
                              .catch(() => { });
                        // Ad trigger moved to Next Level / Replay buttons to let user see victory card first
                        // Confetti start
                        confettiAnims.forEach(anim => {
                              anim.y.setValue(-50);
                              anim.x.setValue(Math.random() * width - width / 2);
                              anim.rotate.setValue(0);
                              Animated.parallel([
                                    Animated.timing(anim.y, {
                                          toValue: height + 50,
                                          duration: 1500 + Math.random() * 2000,
                                          easing: Easing.linear,
                                          useNativeDriver: true,
                                    }),
                                    Animated.timing(anim.rotate, {
                                          toValue: 1,
                                          duration: 1500 + Math.random() * 2000,
                                          easing: Easing.linear,
                                          useNativeDriver: true,
                                    }),
                              ]).start();
                        });
                  }
            },
            [playSound, vibrationEnabled, movesCount, confettiAnims, width, height, incrementRoundsAndMaybeShowAd, setBlastTriggers]
      );
      // Pour effect animation listener
      useEffect(() => {
            if (pourState) {
                  pourAnimation.setValue(0);
                  Animated.timing(pourAnimation, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: false,
                  }).start(() => {
                        setTubes(pourState.newTubes);
                        setPourState(null);
                        // Check if any specific tube is now fully completed
                        const nextCompleted = pourState.newTubes.map(t => {
                              if (t.length === 4) {
                                    const first = t[0];
                                    return t.every(seg => seg === first);
                              }
                              return false;
                        });
                        // Trigger local sparkle + chime if a new tube is complete
                        nextCompleted.forEach((isComp, idx) => {
                              if (isComp && !completedTubes[idx]) {
                                    setBlastTriggers(prev => {
                                          const next = [...prev];
                                          next[idx] += 1;
                                          return next;
                                    });
                                    playSound('ting'); // completed tube chime
                                    if (vibrationEnabled) {
                                          import('react-native').then(({ Vibration }) => {
                                                Vibration.vibrate(20);
                                          });
                                    }
                              }
                        });
                        setCompletedTubes(nextCompleted);
                        checkSolvedState(pourState.newTubes);
                  });
            }
      }, [pourState, checkSolvedState, completedTubes, playSound, vibrationEnabled]);
      // Back button exit confirmation
      useEffect(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                  if (pauseVisible) {
                        setPauseVisible(false);
                        return true;
                  }
                  setPauseVisible(true);
                  return true;
            });
            return () => backHandler.remove();
      }, [pauseVisible]);
      // Pour logic
      const selectOrPour = (idx: number) => {
            if (solved || pourState !== null) return;
            playSound('tap');
            if (selectedTube === null) {
                  if (tubes[idx].length > 0) {
                        setSelectedTube(idx);
                  }
            } else {
                  const srcIdx = selectedTube;
                  setSelectedTube(null);
                  if (srcIdx === idx) return;
                  const srcTube = tubes[srcIdx];
                  const destTube = tubes[idx];
                  if (destTube.length >= 4) {
                        playSound('tap');
                        return;
                  }
                  const srcTop = srcTube[srcTube.length - 1];
                  const destTop = destTube[destTube.length - 1];
                  if (destTube.length > 0 && destTop !== srcTop) {
                        playSound('tap');
                        return;
                  }
                  const newTubes = tubes.map(t => [...t]);
                  const movingColor = srcTop;
                  let segmentsToMove = 0;
                  for (let i = srcTube.length - 1; i >= 0; i--) {
                        if (srcTube[i] === movingColor) {
                              segmentsToMove++;
                        } else {
                              break;
                        }
                  }
                  const destSpace = 4 - destTube.length;
                  const pourCount = Math.min(segmentsToMove, destSpace);
                  if (pourCount === 0) {
                        playSound('draw');
                        return;
                  }
                  setHistory(prev => [...prev, tubes.map(t => [...t])]);
                  setMovesCount(m => m + 1);
                  for (let i = 0; i < pourCount; i++) {
                        newTubes[srcIdx].pop();
                        newTubes[idx].push(movingColor);
                  }
                  playSound('pour');
                  setPourState({
                        srcIdx,
                        destIdx: idx,
                        color: movingColor,
                        count: pourCount,
                        oldTubes: tubes.map(t => [...t]),
                        newTubes: newTubes.map(t => [...t]),
                  });
            }
      };
      // Undo move with ad trigger
      const handleUndo = () => {
            if (history.length === 0 || solved || pourState !== null) return;
            playSound('tap');
            if (undoCount <= 0) {
                  // Force user to watch an ad to get 5 more undos
                  showInterstitial();
                  setUndoCount(5);
                  return;
            }
            const newHistory = [...history];
            const prevState = newHistory.pop();
            if (prevState) {
                  // Trigger Interstitial ad on every undo
                  showInterstitial();
                  setTubes(prevState);
                  setHistory(newHistory);
                  setSelectedTube(null);
                  setMovesCount(m => Math.max(0, m - 1));
                  setUndoCount(u => u - 1);
            }
      };
      const handleRestart = () => {
            if (pourState !== null) return;
            incrementRoundsAndMaybeShowAd();
            const rawLevel = getWaterSortLevel(level);
            setTubes(rawLevel);
            setSelectedTube(null);
            setHistory([]);
            setSolved(false);
            setMovesCount(0);
            setCompletedTubes(new Array(rawLevel.length).fill(false));
            playSound('tap');
            setPauseVisible(false);
      };
      const handleNextLevel = () => {
            incrementRoundsAndMaybeShowAd();
            const nextL = level + 1;
            setLevel(nextL);
            AsyncStorage.setItem(STORAGE_LEVEL_KEY, nextL.toString()).catch(() => { });
            playSound('tap');
      };
      const handleWatchAdForExtraTube = () => {
            showRewarded(
                  () => {
                        if (extraTubeAdCount < 4) {
                              setExtraTubeAdCount(c => c + 1);
                        } else {
                              // Completed 5 ads: Unlock extra tube!
                              setExtraTubeAdCount(5);
                              setTubes(prev => [...prev, []]);
                              setCompletedTubes(prev => [...prev, false]);
                              setExtraTubeAdded(true);
                              setShowExtraTubeModal(false);
                        }
                  },
                  () => {
                        Alert.alert("Notice", "Ad is not ready yet. Please try again in a few seconds.");
                  }
            );
      };
      // Color mappings
      const getSegmentColor = (colorName: LiquidColor) => {
            if (theme.name === 'nordic') {
                  switch (colorName) {
                        case 'cyan': return '#1d3557';
                        case 'pink': return '#a8483b';
                        case 'warning': return '#224b33';
                        case 'accent': return '#c99738';
                        case 'purple': return '#4a2c5f';
                        case 'orange': return '#a65d21';
                        case 'yellow': return '#9a8e2a';
                  }
            }
            switch (colorName) {
                  case 'cyan': return '#00d2ff'; // Neon Cyan
                  case 'pink': return '#1d72f2'; // Deep Blue
                  case 'warning': return '#7bf10a'; // Lime Green
                  case 'accent': return '#e21a62'; // Pinkish Magenta
                  case 'purple': return '#b026ff'; // Purple
                  case 'orange': return '#ff5e00'; // Orange
                  case 'yellow': return '#ffd215'; // Golden Yellow
            }
      };
      // Physical vial tilt animation style
      const getVialAnimationStyle = (idx: number) => {
            if (pourState === null) {
                  const isSelected = selectedTube === idx;
                  return {
                        transform: [{ translateY: isSelected ? -12 : 0 }],
                  };
            }
            if (idx === pourState.srcIdx) {
                  const total = tubes.length;
                  const topCount = Math.ceil(total / 2);
                  const getCoords = (i: number) => {
                        const row = i < topCount ? 0 : 1;
                        const col = i < topCount ? i : i - topCount;
                        const count = row === 0 ? topCount : total - topCount;
                        const rowWidth = count * 72 + (count - 1) * 20;
                        const x = -rowWidth / 2 + col * 92 + 36;
                        const y = row * 215;
                        return { x, y };
                  };
                  const srcCoords = getCoords(pourState.srcIdx);
                  const destCoords = getCoords(pourState.destIdx);
                  const dx = destCoords.x - srcCoords.x;
                  const dy = destCoords.y - srcCoords.y;
                  const isRight = dx >= 0;
                  const hoverX = dx + (isRight ? -78 : 78);
                  const hoverY = dy - 58;
                  const targetRotate = isRight ? '75deg' : '-75deg';
                  const rotate = pourAnimation.interpolate({
                        inputRange: [0, 0.25, 0.75, 1],
                        outputRange: ['0deg', targetRotate, targetRotate, '0deg'],
                  });
                  const translateX = pourAnimation.interpolate({
                        inputRange: [0, 0.25, 0.75, 1],
                        outputRange: [0, hoverX, hoverX, 0],
                  });
                  const translateY = pourAnimation.interpolate({
                        inputRange: [0, 0.25, 0.75, 1],
                        outputRange: [-12, hoverY, hoverY, 0],
                  });
                  return {
                        transform: [{ translateX }, { translateY }, { rotate }],
                        zIndex: 10,
                  };
            }
            return {};
      };
      // Dynamic scaling calculations
      const totalTubes = tubes.length;
      const topCount = Math.ceil(totalTubes / 2);
      const rowMaxCount = Math.max(topCount, totalTubes - topCount);
      // Base constants
      const BASE_VIAL_WIDTH = 60;
      const BASE_GAP = 18;
      const HORIZONTAL_PADDING = 32;
      const availableWidth = contentWidth - HORIZONTAL_PADDING;
      const baseTotalWidth = rowMaxCount * BASE_VIAL_WIDTH + (rowMaxCount - 1) * BASE_GAP;
      const vialScale = baseTotalWidth > availableWidth ? availableWidth / baseTotalWidth : 1;
      // Scaled dimensions
      const vialWidth = BASE_VIAL_WIDTH * vialScale;
      const vialBodyWidth = 48 * vialScale;
      const vialBodyHeight = 162 * vialScale;
      const vialCapWidth = 56 * vialScale;
      const segmentHeight = 40 * vialScale;
      const gapSize = BASE_GAP * vialScale;
      const groupSegments = (tube: LiquidColor[]) => {
            const groups: { color: LiquidColor; count: number }[] = [];
            for (const color of tube) {
                  if (groups.length > 0 && groups[groups.length - 1].color === color) {
                        groups[groups.length - 1].count++;
                  } else {
                        groups.push({ color, count: 1 });
                  }
            }
            return groups;
      };
      const renderVialSegments = (currentTube: LiquidColor[], idx: number) => {
            const isSrc = pourState !== null && idx === pourState.srcIdx;
            const isDest = pourState !== null && idx === pourState.destIdx;
            if (pourState === null) {
                  const groups = groupSegments(currentTube);
                  let currentIdx = 0;
                  return groups.map((group, groupIdx) => {
                        const isFirst = currentIdx === 0;
                        const isLast = currentIdx + group.count === currentTube.length;
                        currentIdx += group.count;
                        return (
                              <View
                                    key={`seg-${groupIdx}`}
                                    style={[
                                          styles.segment,
                                          {
                                                backgroundColor: getSegmentColor(group.color),
                                                height: segmentHeight * group.count,
                                          },
                                          isFirst && styles.segmentBottom,
                                          isLast && styles.segmentTop,
                                    ]}
                              />
                        );
                  });
            }
            const oldTube = pourState.oldTubes[idx] || [];
            if (isSrc) {
                  const staticCount = oldTube.length - pourState.count;
                  const elements: React.ReactNode[] = [];
                  const staticTube = oldTube.slice(0, staticCount);
                  const staticGroups = groupSegments(staticTube);
                  let currentIdx = 0;
                  staticGroups.forEach((group, gIdx) => {
                        const isFirst = currentIdx === 0;
                        const isLast = currentIdx + group.count === staticCount && pourState.count === 0;
                        elements.push(
                              <View
                                    key={`seg-static-${gIdx}`}
                                    style={[
                                          styles.segment,
                                          {
                                                backgroundColor: getSegmentColor(group.color),
                                                height: segmentHeight * group.count,
                                          },
                                          isFirst && styles.segmentBottom,
                                          isLast && styles.segmentTop,
                                    ]}
                              />
                        );
                        currentIdx += group.count;
                  });
                  if (pourState.count > 0) {
                        const shrinkHeight = pourAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [segmentHeight * pourState.count, 0],
                        });
                        const shrinkOpacity = pourAnimation.interpolate({
                              inputRange: [0.8, 1],
                              outputRange: [1, 0],
                        });
                        elements.push(
                              <Animated.View
                                    key={`seg-shrink`}
                                    style={[
                                          styles.segment,
                                          {
                                                backgroundColor: getSegmentColor(pourState.color),
                                                height: shrinkHeight,
                                                opacity: shrinkOpacity,
                                          },
                                          staticCount === 0 && styles.segmentBottom,
                                          styles.segmentTop,
                                    ]}
                              />
                        );
                  }
                  return elements;
            }
            if (isDest) {
                  const elements: React.ReactNode[] = [];
                  const staticGroups = groupSegments(oldTube);
                  let currentIdx = 0;
                  staticGroups.forEach((group, gIdx) => {
                        const isFirst = currentIdx === 0;
                        const isLast = currentIdx + group.count === oldTube.length && pourState.count === 0;
                        elements.push(
                              <View
                                    key={`seg-static-${gIdx}`}
                                    style={[
                                          styles.segment,
                                          {
                                                backgroundColor: getSegmentColor(group.color),
                                                height: segmentHeight * group.count,
                                          },
                                          isFirst && styles.segmentBottom,
                                          isLast && styles.segmentTop,
                                    ]}
                              />
                        );
                        currentIdx += group.count;
                  });
                  if (pourState.count > 0) {
                        const growHeight = pourAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, segmentHeight * pourState.count],
                        });
                        const growOpacity = pourAnimation.interpolate({
                              inputRange: [0, 0.25],
                              outputRange: [0, 1],
                        });
                        elements.push(
                              <Animated.View
                                    key={`seg-grow`}
                                    style={[
                                          styles.segment,
                                          {
                                                backgroundColor: getSegmentColor(pourState.color),
                                                height: growHeight,
                                                opacity: growOpacity,
                                          },
                                          oldTube.length === 0 && styles.segmentBottom,
                                          styles.segmentTop,
                                    ]}
                              />
                        );
                  }
                  return elements;
            }
            const staticGroups = groupSegments(oldTube);
            let currentIdx = 0;
            return staticGroups.map((group, groupIdx) => {
                  const isFirst = currentIdx === 0;
                  const isLast = currentIdx + group.count === oldTube.length;
                  currentIdx += group.count;
                  return (
                        <View
                              key={`seg-${groupIdx}`}
                              style={[
                                    styles.segment,
                                    {
                                          backgroundColor: getSegmentColor(group.color),
                                          height: segmentHeight * group.count,
                                    },
                                    isFirst && styles.segmentBottom,
                                    isLast && styles.segmentTop,
                              ]}
                        />
                  );
            });
      };
      const renderCap = (isSelected: boolean, isTubeComplete: boolean) => {
            const capBorderColor = isTubeComplete
                  ? colors.warning
                  : isSelected
                        ? colors.cyanPrimary
                        : '#ffffff';
            return (
                  <View
                        style={{
                              flexDirection: 'row',
                              width: vialCapWidth,
                              height: 10 * vialScale,
                              alignItems: 'flex-end',
                              marginBottom: -3.2 * vialScale,
                              zIndex: 3,
                        }}
                  >
                        <View
                              style={{
                                    width: 4 * vialScale,
                                    height: 10 * vialScale,
                                    borderLeftWidth: 2.2 * vialScale,
                                    borderTopWidth: 2.2 * vialScale,
                                    borderBottomWidth: 2.2 * vialScale,
                                    borderColor: capBorderColor,
                                    borderTopLeftRadius: 4 * vialScale,
                                    borderBottomLeftRadius: 4 * vialScale,
                              }}
                        />
                        <View
                              style={{
                                    flex: 1,
                                    height: 10 * vialScale,
                                    borderTopWidth: 2.2 * vialScale,
                                    borderColor: capBorderColor,
                              }}
                        />
                        <View
                              style={{
                                    width: 4 * vialScale,
                                    height: 10 * vialScale,
                                    borderRightWidth: 2.2 * vialScale,
                                    borderTopWidth: 2.2 * vialScale,
                                    borderBottomWidth: 2.2 * vialScale,
                                    borderColor: capBorderColor,
                                    borderTopRightRadius: 4 * vialScale,
                                    borderBottomRightRadius: 4 * vialScale,
                              }}
                        />
                  </View>
            );
      };
      const renderVial = (tube: LiquidColor[], idx: number) => {
            const isSelected = selectedTube === idx;
            const vialAnimStyle = getVialAnimationStyle(idx);
            const isDest = pourState !== null && idx === pourState.destIdx;
            const oldTube = pourState ? pourState.oldTubes[idx] || [] : [];
            const isTubeComplete = completedTubes[idx] || false;
            return (
                  <Pressable
                        key={`vial-${idx}`}
                        onPress={() => selectOrPour(idx)}
                        disabled={pourState !== null}
                        style={[styles.vialWrapper, { width: vialWidth }]}
                        android_disableSound={true}
                  >
                        <Animated.View style={[styles.vialContainer, { width: vialWidth }, vialAnimStyle]}>
                              {renderCap(isSelected, isTubeComplete)}
                              <View
                                    style={[
                                          styles.vialBody,
                                          {
                                                width: vialBodyWidth,
                                                height: vialBodyHeight,
                                                borderWidth: 2.2 * vialScale,
                                                borderBottomLeftRadius: 24 * vialScale,
                                                borderBottomRightRadius: 24 * vialScale
                                          },
                                          isSelected && { borderColor: colors.cyanPrimary, ...shadows.cyanSoft },
                                          isTubeComplete && { borderColor: colors.warning },
                                    ]}
                              >
                                    {renderVialSegments(tube, idx)}
                                    <View style={[styles.vialReflection, { right: 5 * vialScale, top: 8 * vialScale, bottom: 8 * vialScale, width: 4 * vialScale, borderRadius: 2 * vialScale }]} pointerEvents="none" />
                                    {isDest && (
                                          <Animated.View
                                                style={[
                                                      styles.pouringStream,
                                                      {
                                                            backgroundColor: getSegmentColor(pourState.color),
                                                            shadowColor: getSegmentColor(pourState.color),
                                                            left: 21 * vialScale,
                                                            width: 6 * vialScale,
                                                            borderRadius: 3 * vialScale,
                                                            opacity: pourAnimation.interpolate({
                                                                  inputRange: [0.15, 0.3, 0.7, 0.85],
                                                                  outputRange: [0, 1, 1, 0],
                                                            }),
                                                            bottom: pourAnimation.interpolate({
                                                                  inputRange: [0, 1],
                                                                  outputRange: [oldTube.length * segmentHeight, (oldTube.length + pourState.count) * segmentHeight],
                                                            }),
                                                      },
                                                ]}
                                          />
                                    )}
                              </View>
                              <TubeCompleteBlast triggerCount={blastTriggers[idx] || 0} />
                        </Animated.View>
                        <Text style={[styles.vialLabel, { fontSize: Math.max(8, 10 * vialScale) }, isSelected && { color: colors.cyanPrimary }]}>
                              TUBE {idx + 1}
                        </Text>
                  </Pressable>
            );
      };
      return (
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
                  <StatusBar barStyle="light-content" backgroundColor={colors.backgroundBase} translucent={false} hidden={false} />
                  <View style={styles.container}>
                        <ImageBackground source={BACKGROUND_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                        <View pointerEvents="none" style={styles.topGlow} />
                        <View pointerEvents="none" style={styles.midGlow} />
                        {/* Header Row */}
                        <View style={[styles.headerRow, { width: contentWidth }]}>
                              <View style={styles.headerLeft}>
                                    <Pressable
                                          onPress={() => {
                                                playSound('tap');
                                                onGoHome();
                                          }}
                                          accessibilityRole="button"
                                          accessibilityLabel="Go back to hub"
                                          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                                          android_disableSound={true}
                                    >
                                          <Icon name="arrow-back" size={18} color="#ffffff" />
                                    </Pressable>
                              </View>
                              <View style={styles.headerCenter}>
                                    <Text style={styles.headerTitle}>WATER SORT</Text>
                                    <Text style={styles.headerSubtitle}>LEVEL {level}</Text>
                              </View>
                              <View style={styles.headerRight}>
                                    <Pressable
                                          onPress={() => {
                                                playSound('tap');
                                                setPauseVisible(true);
                                          }}
                                          accessibilityRole="button"
                                          accessibilityLabel="Pause Game"
                                          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                                          android_disableSound={true}
                                    >
                                          <Icon name="pause" size={18} color="#ffffff" />
                                    </Pressable>
                              </View>
                        </View>
                        {/* Confetti Particles solved layer */}
                        {confettiActive && (
                              <View style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]} pointerEvents="none">
                                    {confettiAnims.map((anim, i) => (
                                          <Animated.View
                                                key={`confetti-${i}`}
                                                style={[
                                                      styles.confetti,
                                                      {
                                                            left: width / 2,
                                                            transform: [
                                                                  { translateY: anim.y },
                                                                  { translateX: anim.x },
                                                                  {
                                                                        rotate: anim.rotate.interpolate({
                                                                              inputRange: [0, 1],
                                                                              outputRange: ['0deg', '720deg'],
                                                                        }),
                                                                  },
                                                            ],
                                                            backgroundColor: anim.color,
                                                            borderRadius: anim.shape === 'circle' ? anim.size / 2 : 3,
                                                            width: anim.size,
                                                            height: anim.shape === 'circle' ? anim.size : anim.size * 0.6,
                                                            shadowColor: anim.color,
                                                            shadowOffset: { width: 0, height: 0 },
                                                            shadowOpacity: 0.9,
                                                            shadowRadius: 4,
                                                            elevation: 10,
                                                      },
                                                ]}
                                          />
                                    ))}
                              </View>
                        )}
                        {/* Puzzle Board Space */}
                        <ScrollView contentContainerStyle={styles.boardScroll} bounces={false}>
                              <View style={[styles.vialsGridContainer, { width: contentWidth }]}>
                                    <View style={styles.vialsRow}>
                                          {tubes.slice(0, topCount).map((tube, subIdx) => renderVial(tube, subIdx))}
                                    </View>
                                    <View style={styles.vialsRow}>
                                          {tubes.slice(topCount).map((tube, subIdx) => renderVial(tube, topCount + subIdx))}
                                    </View>
                              </View>
                        </ScrollView>
                        {/* Bottom controls row (Restart, Undo, Add Tube) */}
                        <View style={[styles.bottomControlRow, { width: contentWidth }]}>
                              {/* Restart Button */}
                              <Pressable
                                    onPress={handleRestart}
                                    style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                                    accessibilityRole="button"
                                    accessibilityLabel="Restart Level"
                              >
                                    <Icon name="refresh" size={20} color="#ffffff" />
                              </Pressable>
                              {/* Undo Button with small number badge on top-right */}
                              <Pressable
                                    onPress={handleUndo}
                                    disabled={history.length === 0 || solved || pourState !== null}
                                    style={({ pressed }) => [
                                          styles.actionBtn,
                                          pressed && styles.actionBtnPressed,
                                          (history.length === 0 || pourState !== null) && { opacity: 0.5 },
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel="Undo Move"
                                    android_disableSound={true}
                              >
                                    <Icon name="arrow-undo-outline" size={20} color="#ffffff" />
                                    <View style={styles.undoBadge}>
                                          <Text style={styles.undoBadgeText}>{undoCount}</Text>
                                    </View>
                              </Pressable>
                              {/* Add Tube Button */}
                              <Pressable
                                    onPress={() => {
                                          if (!extraTubeAdded) {
                                                playSound('tap');
                                                setShowExtraTubeModal(true);
                                          }
                                    }}
                                    disabled={extraTubeAdded || solved}
                                    style={({ pressed }) => [
                                          styles.actionBtn,
                                          pressed && styles.actionBtnPressed,
                                          (extraTubeAdded || solved) && { opacity: 0.5 },
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel="Add Extra Tube"
                                    android_disableSound={true}
                              >
                                    <View style={styles.addTubeBtnInner}>
                                          <Icon name="flask-outline" size={16} color="#ffffff" />
                                          <Icon name="add" size={10} color="#ffffff" style={styles.addSymbol} />
                                    </View>
                                    <Icon name="play-circle-outline" size={10} color="#ffffff" style={styles.adVideoIcon} />
                              </Pressable>
                        </View>
                        {/* Solved Popup Dialog with Reply & Next */}
                        {solved && (
                              <View style={styles.solvedCardWrap}>
                                    <View style={[styles.solvedCard, { width: Math.min(contentWidth, 340) }]}>
                                          <View style={styles.solvedIconOrb}>
                                                <Icon name="sparkles-outline" size={30} color={colors.cyanBright} />
                                          </View>
                                          <Text style={styles.solvedTitle}>LEVEL COMPLETED</Text>
                                          <Text style={styles.solvedSubtitle}>All elements sorted in {movesCount} moves!</Text>
                                          <View style={styles.solvedBtnRow}>
                                                <Pressable
                                                      onPress={handleRestart}
                                                      style={({ pressed }) => [styles.solvedReplayBtn, pressed && styles.btnPressed]}
                                                      android_disableSound={true}
                                                >
                                                      <Icon name="refresh" size={16} color={colors.pinkPrimary} />
                                                      <Text style={styles.solvedReplayText}>REPLAY</Text>
                                                </Pressable>
                                                <Pressable
                                                      onPress={handleNextLevel}
                                                      style={({ pressed }) => [styles.solvedNextBtn, pressed && styles.btnPressed]}
                                                      android_disableSound={true}
                                                >
                                                      <Text style={styles.solvedNextText}>NEXT LEVEL</Text>
                                                      <Icon name="arrow-forward" size={16} color={colors.textPrimary} />
                                                </Pressable>
                                          </View>
                                    </View>
                              </View>
                        )}
                        {/* Add Tube Confirmation Modal */}
                        <Modal
                              transparent
                              visible={showExtraTubeModal}
                              animationType="fade"
                              onRequestClose={() => setShowExtraTubeModal(false)}
                        >
                              <Pressable
                                    style={styles.modalBackdrop}
                                    onPress={() => {
                                          playSound('tap');
                                          setShowExtraTubeModal(false);
                                    }}
                                    android_disableSound={true}
                              >
                                    <View style={[styles.modalCard, { width: Math.min(contentWidth, 340) }]}>
                                          <View style={styles.modalHeaderTag}>
                                                <Icon name="flask-outline" size={18} color={colors.warning} />
                                                <Text style={styles.modalHeaderTagText}>EXTRA VIAL</Text>
                                          </View>
                                          <Text style={styles.modalTitle}>Unlock Extra Tube</Text>
                                          <Text style={styles.modalSubtitle}>Watch 5 short video ads to add an empty tube to this level.</Text>
                                          <View style={styles.progressBarTrack}>
                                                <View style={[styles.progressBarFill, { width: `${(extraTubeAdCount / 5) * 100}%` }]} />
                                          </View>
                                          <Text style={styles.progressText}>{extraTubeAdCount} / 5 ADS WATCHED</Text>
                                          <Pressable
                                                onPress={() => {
                                                      playSound('tap');
                                                      handleWatchAdForExtraTube();
                                                }}
                                                style={({ pressed }) => [styles.modalWatchBtn, pressed && styles.btnPressed]}
                                                android_disableSound={true}
                                          >
                                                <Icon name="play-circle" size={18} color={colors.backgroundBase} />
                                                <Text style={styles.modalWatchText}>WATCH VIDEO AD</Text>
                                          </Pressable>
                                          <Pressable
                                                onPress={() => {
                                                      playSound('tap');
                                                      setShowExtraTubeModal(false);
                                                }}
                                                style={styles.modalCancelBtn}
                                                android_disableSound={true}
                                          >
                                                <Text style={styles.modalCancelText}>CANCEL</Text>
                                          </Pressable>
                                    </View>
                              </Pressable>
                        </Modal>
                        {/* Water Sort Stats Modal */}
                        <Modal
                              transparent
                              visible={showStatsModal}
                              animationType="fade"
                              onRequestClose={() => setShowStatsModal(false)}
                        >
                              <Pressable
                                    style={styles.modalBackdrop}
                                    onPress={() => {
                                          playSound('tap');
                                          setShowStatsModal(false);
                                    }}
                                    android_disableSound={true}
                              >
                                    <View style={[styles.modalCard, { width: Math.min(contentWidth, 340) }]}>
                                          <View style={styles.modalHeaderTag}>
                                                <Icon name="trophy-outline" size={18} color={colors.warning} />
                                                <Text style={styles.modalHeaderTagText}>CAREER STATS</Text>
                                          </View>
                                          <Text style={styles.modalTitle}>Water Sort Records</Text>
                                          <Text style={styles.modalSubtitle}>Your lifetime achievements</Text>
                                          {stats ? (
                                                <View style={styles.statsContent}>
                                                      <View style={styles.statLine}>
                                                            <Text style={styles.statLabel}>Completed Levels</Text>
                                                            <Text style={styles.statVal}>{stats.levelsCompleted}</Text>
                                                      </View>
                                                      <View style={styles.statLine}>
                                                            <Text style={styles.statLabel}>Current Streak</Text>
                                                            <Text style={[styles.statVal, { color: colors.cyanPrimary }]}>{stats.currentStreak} 🔥</Text>
                                                      </View>
                                                      <View style={styles.statLine}>
                                                            <Text style={styles.statLabel}>Best Streak</Text>
                                                            <Text style={[styles.statVal, { color: colors.pinkPrimary }]}>{stats.bestStreak} 🏆</Text>
                                                      </View>
                                                      <View style={styles.statLine}>
                                                            <Text style={styles.statLabel}>Total Moves</Text>
                                                            <Text style={styles.statVal}>{stats.totalMoves}</Text>
                                                      </View>
                                                      <Pressable
                                                            onPress={async () => {
                                                                  playSound('tap');
                                                                  const res = await resetWaterSortStats();
                                                                  setStats(res);
                                                            }}
                                                            style={styles.modalResetBtn}
                                                            android_disableSound={true}
                                                      >
                                                            <Text style={styles.modalResetText}>RESET ALL RECORDS</Text>
                                                      </Pressable>
                                                </View>
                                          ) : (
                                                <Text style={styles.modalSubtitle}>Loading statistics...</Text>
                                          )}
                                          <Pressable
                                                onPress={() => {
                                                      playSound('tap');
                                                      setShowStatsModal(false);
                                                }}
                                                style={styles.modalCancelBtn}
                                                android_disableSound={true}
                                          >
                                                <Text style={styles.modalCancelText}>CLOSE</Text>
                                          </Pressable>
                                    </View>
                              </Pressable>
                        </Modal>
                        {/* Ad Banner bottom */}
                        {adsReady && (
                              <View style={styles.adWrap}>
                                    <AdBanner compact />
                              </View>
                        )}
                  </View>
            </SafeAreaView>
      );
};
const getStyles = (colors: any, shadows: any, themeName?: string) =>
      StyleSheet.create({
            safeArea: {
                  flex: 1,
                  backgroundColor: colors.backgroundBase,
            },
            container: {
                  flex: 1,
                  backgroundColor: colors.backgroundBase,
            },
            topGlow: {
                  position: 'absolute',
                  width: 520,
                  height: 520,
                  borderRadius: 520,
                  top: -290,
                  left: -70,
                  backgroundColor: colors.glowPrimary,
            },
            midGlow: {
                  position: 'absolute',
                  width: 440,
                  height: 440,
                  borderRadius: 440,
                  right: -240,
                  top: 260,
                  backgroundColor: colors.glowPrimary,
            },
            headerRow: {
                  alignSelf: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: spacing.md,
                  paddingTop: spacing.sm,
                  marginBottom: spacing.lg,
                  zIndex: 10,
                  width: '100%',
            },
            headerLeft: {
                  flexDirection: 'row',
                  alignItems: 'center',
            },
            headerRight: {
                  flexDirection: 'row',
                  alignItems: 'center',
            },
            movesBadge: {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  borderWidth: 1,
                  borderRadius: radii.sm,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: 8,
            },
            movesBadgeText: {
                  color: colors.textSecondary,
                  fontSize: 10,
                  fontFamily: typography.family.bold,
            },
            headerCenter: {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
            },
            headerTitle: {
                  color: colors.textPrimary,
                  fontSize: 15,
                  letterSpacing: typography.tracking.wide,
                  textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                  fontFamily: typography.family.black,
            },
            headerSubtitle: {
                  color: colors.pinkPrimary,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  marginTop: 2,
                  fontFamily: typography.family.black,
            },
            iconBtn: {
                  width: 38,
                  height: 38,
                  borderRadius: radii.md,
                  borderWidth: 1.2,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: colors.cardSurfaceSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
            },
            iconBtnPressed: {
                  opacity: 0.8,
                  transform: [{ scale: 0.95 }],
            },
            boardScroll: {
                  flexGrow: 1,
                  justifyContent: 'center',
                  paddingBottom: spacing.lg,
            },
            vialsGridContainer: {
                  alignSelf: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 22,
                  paddingHorizontal: spacing.md,
            },
            vialsRow: {
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 18,
            },
            vialWrapper: {
                  alignItems: 'center',
                  width: 60,
            },
            vialContainer: {
                  alignItems: 'center',
                  width: 60,
                  position: 'relative',
            },
            vialCap: {
                  width: 56,
                  height: 10,
                  borderWidth: 2.2,
                  borderColor: '#ffffff',
                  backgroundColor: '#03052f', // match background theme
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 6,
                  marginBottom: -3.5,
                  zIndex: 3,
            },
            vialBody: {
                  width: 48,
                  height: 162,
                  borderWidth: 2.2,
                  borderTopWidth: 0,
                  borderColor: '#ffffff', // solid white border
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  overflow: 'hidden',
                  paddingBottom: 2,
                  flexDirection: 'column-reverse',
                  zIndex: 2,
            },
            vialReflection: {
                  position: 'absolute',
                  right: 5,
                  top: 8,
                  bottom: 8,
                  width: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  zIndex: 4,
            },
            segment: {
                  height: 40,
                  marginHorizontal: 0,
                  marginVertical: 0,
            },
            pouringStream: {
                  position: 'absolute',
                  top: 0,
                  left: 21,
                  width: 6,
                  borderRadius: 3,
                  opacity: 0,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 3,
            },
            segmentBottom: {
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
            },
            segmentTop: {
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
            },
            vialLabel: {
                  marginTop: 8,
                  color: colors.textSecondary,
                  fontSize: 9,
                  letterSpacing: 0.5,
                  fontFamily: typography.family.bold,
            },
            tubeSparkle: {
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#ffff00',
                  shadowColor: '#ffff00',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 4,
            },
            confetti: {
                  position: 'absolute',
                  zIndex: 999,
                  elevation: 10,
            },
            bottomControlRow: {
                  alignSelf: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 32,
                  paddingVertical: spacing.md,
                  alignItems: 'center',
                  zIndex: 10,
            },
            actionBtn: {
                  width: 54,
                  height: 54,
                  borderRadius: radii.md,
                  borderWidth: 2,
                  borderColor: colors.cyanBorder,
                  backgroundColor: colors.cardSurfaceSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  ...shadows.cyanSoft,
            },
            actionBtnPressed: {
                  opacity: 0.8,
                  transform: [{ scale: 0.95 }],
            },
            undoBadge: {
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: colors.pinkPrimary,
                  borderRadius: 9,
                  width: 18,
                  height: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#ffffff',
            },
            undoBadgeText: {
                  color: '#ffffff',
                  fontSize: 8,
                  fontFamily: typography.family.black,
            },
            addTubeBtnInner: {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
            },
            addSymbol: {
                  marginLeft: -2,
                  marginTop: -6,
            },
            adVideoIcon: {
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
            },
            solvedCardWrap: {
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: colors.overlayDark,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: spacing.lg,
                  zIndex: 20,
            },
            solvedCard: {
                  borderRadius: radii.xxl,
                  borderWidth: 2,
                  borderColor: colors.cyanBorder,
                  backgroundColor: colors.cardSurfaceStrong,
                  padding: spacing.lg,
                  alignItems: 'center',
                  ...shadows.cyanStrong,
            },
            solvedIconOrb: {
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderWidth: 1.5,
                  borderColor: colors.cyanBorder,
                  backgroundColor: colors.cardSurfaceSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.sm,
                  ...shadows.cyanSoft,
            },
            solvedTitle: {
                  color: colors.cyanPrimary,
                  fontSize: 18,
                  letterSpacing: 1.2,
                  textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                  textAlign: 'center',
                  fontFamily: typography.family.black,
            },
            solvedSubtitle: {
                  color: colors.textSecondary,
                  fontSize: 11,
                  textAlign: 'center',
                  marginTop: 4,
                  marginBottom: spacing.md,
                  fontFamily: typography.family.semibold,
            },
            solvedBtnRow: {
                  flexDirection: 'row',
                  gap: spacing.sm,
                  width: '100%',
            },
            solvedReplayBtn: {
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  borderColor: colors.pinkBorder,
                  borderWidth: 1.6,
                  backgroundColor: colors.cardSurfaceAlt,
                  borderRadius: radii.lg,
                  paddingVertical: spacing.sm,
                  minHeight: 48,
                  ...shadows.pinkSoft,
            },
            solvedReplayText: {
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontFamily: typography.family.black,
            },
            solvedNextBtn: {
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  borderColor: colors.cyanPrimary,
                  borderWidth: 1.6,
                  backgroundColor: colors.cardSurface,
                  borderRadius: radii.lg,
                  paddingVertical: spacing.sm,
                  minHeight: 48,
                  ...shadows.cyanSoft,
            },
            solvedNextText: {
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontFamily: typography.family.black,
            },
            btnPressed: {
                  opacity: 0.82,
                  transform: [{ scale: 0.985 }],
            },
            modalBackdrop: {
                  flex: 1,
                  backgroundColor: colors.overlayDark,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: spacing.lg,
            },
            modalCard: {
                  backgroundColor: colors.cardSurfaceStrong,
                  borderRadius: radii.xxl,
                  borderWidth: 2,
                  borderColor: colors.cyanBorder,
                  padding: spacing.lg,
                  alignItems: 'center',
                  ...shadows.cyanStrong,
            },
            modalHeaderTag: {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: radii.pill,
                  borderWidth: 1,
                  borderColor: colors.warning,
                  backgroundColor: 'rgba(255, 203, 85, 0.08)',
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  marginBottom: spacing.sm,
            },
            modalHeaderTagText: {
                  color: colors.warning,
                  fontSize: 9,
                  letterSpacing: 1,
                  fontFamily: typography.family.black,
            },
            modalTitle: {
                  color: colors.textPrimary,
                  fontSize: 18,
                  textAlign: 'center',
                  marginBottom: 4,
                  fontFamily: typography.family.black,
            },
            modalSubtitle: {
                  color: colors.textSecondary,
                  fontSize: 11,
                  textAlign: 'center',
                  marginBottom: spacing.md,
                  lineHeight: 16,
                  fontFamily: typography.family.body,
            },
            progressBarTrack: {
                  width: '100%',
                  height: 8,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 6,
            },
            progressBarFill: {
                  height: '100%',
                  backgroundColor: colors.warning,
            },
            progressText: {
                  color: colors.warning,
                  fontSize: 9,
                  marginBottom: spacing.md,
                  fontFamily: typography.family.bold,
            },
            modalWatchBtn: {
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  backgroundColor: colors.warning,
                  borderRadius: radii.lg,
                  paddingVertical: spacing.sm,
                  minHeight: 48,
            },
            modalWatchText: {
                  color: colors.backgroundBase,
                  fontSize: 13,
                  letterSpacing: 0.5,
                  fontFamily: typography.family.black,
            },
            modalCancelBtn: {
                  marginTop: spacing.sm,
                  paddingVertical: spacing.xs,
            },
            modalCancelText: {
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontFamily: typography.family.bold,
            },
            statsContent: {
                  width: '100%',
                  marginVertical: spacing.xs,
            },
            statLine: {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.05)',
            },
            statLabel: {
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontFamily: typography.family.semibold,
            },
            statVal: {
                  color: colors.textPrimary,
                  fontSize: 12,
                  fontFamily: typography.family.black,
            },
            modalResetBtn: {
                  marginTop: spacing.md,
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: colors.pinkBorder,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: radii.sm,
            },
            modalResetText: {
                  color: colors.pinkPrimary,
                  fontSize: 9,
                  fontFamily: typography.family.bold,
            },
            adWrap: {
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: Platform.OS === 'ios' ? 0 : 4,
            },
      });
export default WaterSortScreen;
