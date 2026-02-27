import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    Vibration,
    View,
    useWindowDimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import Sound from 'react-native-sound';
import { AdsConsent, AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { interstitialAdUnitId, shouldRenderAds } from '../ads/adMobConfig';
import AdBanner from '../components/AdBanner';
import GameOverModal from '../components/GameOverModal';
import ScoreBoard from '../components/ScoreBoard';
import Square from '../components/Square';
import WinningLine from '../components/WinningLine';
import { recordCrashlyticsError, triggerCrashlyticsTestCrash } from '../services/firebaseTelemetry';
import { getContentWidth, scaleSize } from '../theme/responsive';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';
import { Difficulty, GameMode, GameState, Player, Score } from '../types';
import { getAiMove } from '../utils/ai';
import { calculateWinner } from '../utils/gameLogic';

interface GameScreenProps {
    gameMode: GameMode;
    difficulty: Difficulty;
    adsReady: boolean;
    onGoHome: () => void;
}

type Mark = Exclude<Player, null>;
type FeedbackSound = 'move' | 'win' | 'draw' | 'tap';

interface GameSettings {
    vibrationEnabled: boolean;
    soundEnabled: boolean;
}

interface ConsentFeedbackState {
    visible: boolean;
    title: string;
    message: string;
}

const HUMAN_MARK: Mark = 'O';
const AI_MARK: Mark = 'X';
const INITIAL_SCORE: Score = { x: 0, o: 0, draws: 0 };
const WINNING_LINE_ANIMATION_MS = 1200;
const SETTINGS_STORAGE_KEY = '@webwave_tic_tac_toe:game_settings';
const DEFAULT_SETTINGS: GameSettings = {
    vibrationEnabled: true,
    soundEnabled: true,
};
const DEFAULT_CONSENT_FEEDBACK: ConsentFeedbackState = {
    visible: false,
    title: '',
    message: '',
};
const PRIVACY_POLICY_URL = 'https://webwaveglobal.com/tic-tac-toe-privacy-policy';
// Temporary internal QA control. Set to false (or remove the button block) before production rollout.
const ENABLE_INTERNAL_CRASHLYTICS_TEST_BUTTON = false;

const MOVE_SOUND = require('../assets/sounds/move.wav');
const WIN_SOUND = require('../assets/sounds/win.wav');
const DRAW_SOUND = require('../assets/sounds/draw.wav');
const TAP_SOUND = require('../assets/sounds/tap.wav');

const getStartingMark = (mode: GameMode): Mark => (mode === 'PVAI' ? HUMAN_MARK : 'X');

const createInitialGameState = (startingMark: Mark): GameState => ({
    board: Array(9).fill(null),
    xIsNext: startingMark === 'X',
    winner: null,
    winningLine: null,
});

const buildNextState = (prevGame: GameState, index: number, mark: Mark): GameState => {
    const nextBoard = [...prevGame.board];
    nextBoard[index] = mark;
    const { winner, line } = calculateWinner(nextBoard);

    return {
        board: nextBoard,
        xIsNext: mark === 'O',
        winner,
        winningLine: line,
    };
};

const parseStoredSettings = (rawSettings: string | null): GameSettings => {
    if (!rawSettings) {
        return DEFAULT_SETTINGS;
    }

    try {
        const parsed = JSON.parse(rawSettings) as Partial<GameSettings>;
        return {
            soundEnabled:
                typeof parsed.soundEnabled === 'boolean'
                    ? parsed.soundEnabled
                    : DEFAULT_SETTINGS.soundEnabled,
            vibrationEnabled:
                typeof parsed.vibrationEnabled === 'boolean'
                    ? parsed.vibrationEnabled
                    : DEFAULT_SETTINGS.vibrationEnabled,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

const resolveSoundPath = (soundAsset: number): string | null => {
    const asset = Image.resolveAssetSource(soundAsset);
    if (!asset?.uri) {
        return null;
    }

    if (Platform.OS === 'android' && asset.uri.startsWith('file://')) {
        return asset.uri.replace('file://', '');
    }

    return asset.uri;
};

const createSound = (soundAsset: number): Sound | null => {
    const soundPath = resolveSoundPath(soundAsset);
    if (!soundPath) {
        return null;
    }

    try {
        const clip = new Sound(soundPath, '', error => {
            if (error) {
                return;
            }
        });
        clip.setVolume(0.95);
        return clip;
    } catch {
        return null;
    }
};

const GameScreen = ({ gameMode, difficulty, adsReady, onGoHome }: GameScreenProps) => {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const adVisible = adsReady && shouldRenderAds;
    // Normalize top breathing space across notch / non-notch Android devices.
    const topUiPadding = insets.top >= 28 ? spacing.xs : insets.top >= 18 ? spacing.sm : spacing.md;
    const contentWidth = getContentWidth(width, 16, 760);
    const viewportHeight = height - insets.top - insets.bottom;
    const bottomSafeSpace = Math.max(insets.bottom, spacing.sm);
    const boardCompactLayout = viewportHeight < 840 || width < 395;
    const boardTightLayout = adVisible && (viewportHeight < 780 || width < 370);
    const ultraCompactLayout = adVisible && viewportHeight < 720;
    const topCompactLayout = adVisible
        ? viewportHeight < 940 || width < 430
        : boardCompactLayout;
    const topTightLayout = adVisible
        ? viewportHeight < 850 || width < 385
        : boardTightLayout;
    const boardWidthLimit = Math.min(contentWidth, 620);
    const topReserve = ultraCompactLayout ? 212 : boardTightLayout ? 228 : boardCompactLayout ? 252 : 278;
    const bottomReserve = ultraCompactLayout ? 84 : boardTightLayout ? 94 : boardCompactLayout ? 108 : 122;
    const adReserve = adVisible ? (ultraCompactLayout ? 58 : boardCompactLayout ? 62 : 70) : 0;
    const boardHeightLimit = Math.max(220, viewportHeight - topReserve - bottomReserve - adReserve);
    const preferredBoard = Math.min(
        boardWidthLimit,
        boardTightLayout ? boardWidthLimit : boardCompactLayout ? 392 : 420,
    );
    const minimumBoard = Math.min(
        boardWidthLimit,
        ultraCompactLayout ? 282 : boardTightLayout ? 332 : boardCompactLayout ? 316 : 344,
    );
    const boardSize = Math.min(preferredBoard, Math.max(boardHeightLimit, minimumBoard));
    const boardCellSize = boardSize / 3;
    const iconFontSize = topTightLayout
        ? scaleSize(26, width)
        : topCompactLayout
        ? scaleSize(30, width)
        : scaleSize(34, width);
    const iconButtonSize = topTightLayout
        ? scaleSize(44, width)
        : topCompactLayout
        ? scaleSize(50, width)
        : scaleSize(56, width);
    const iconButtonRadius = Math.round(iconButtonSize * 0.28);
    const levelFontSize = topTightLayout
        ? Math.max(10, scaleSize(11, width))
        : topCompactLayout
        ? Math.max(11, scaleSize(12, width))
        : Math.max(12, scaleSize(14, width));
    const statusFontSize = topTightLayout
        ? Math.max(11, scaleSize(12, width))
        : topCompactLayout
        ? Math.max(12, scaleSize(13, width))
        : Math.max(13, scaleSize(15, width));
    const replayIconSize = topTightLayout
        ? scaleSize(28, width)
        : topCompactLayout
        ? scaleSize(32, width)
        : scaleSize(44, width);
    const replayButtonSize = topTightLayout
        ? scaleSize(60, width)
        : topCompactLayout
        ? scaleSize(72, width)
        : scaleSize(94, width);
    const replayButtonRadius = Math.round(replayButtonSize * 0.22);
    const headerTitleSize = topTightLayout ? Math.max(11, scaleSize(12, width)) : Math.max(12, scaleSize(13, width));
    const headerSubtitleSize = topTightLayout ? Math.max(9, scaleSize(10, width)) : Math.max(10, scaleSize(11, width));
    const settingsTitleSize = Math.max(19, scaleSize(22, width));

    const [game, setGame] = useState<GameState>(() => createInitialGameState(getStartingMark(gameMode)));
    const [score, setScore] = useState<Score>(INITIAL_SCORE);
    const [showGameOver, setShowGameOver] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [consentFeedback, setConsentFeedback] = useState<ConsentFeedbackState>(DEFAULT_CONSENT_FEEDBACK);
    const [settingsHydrated, setSettingsHydrated] = useState(false);
    const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

    const soundBankRef = useRef<Record<FeedbackSound, Sound | null>>({
        move: null,
        win: null,
        draw: null,
        tap: null,
    });
    const interstitialRef = useRef<InterstitialAd | null>(null);
    const interstitialLoadedRef = useRef(false);
    const completedRoundsRef = useRef(0);

    useEffect(() => {
        Sound.setCategory('Ambient', true);

        const sounds: Record<FeedbackSound, Sound | null> = {
            move: createSound(MOVE_SOUND),
            win: createSound(WIN_SOUND),
            draw: createSound(DRAW_SOUND),
            tap: createSound(TAP_SOUND),
        };

        soundBankRef.current = sounds;

        return () => {
            Object.values(sounds).forEach(sound => sound?.release());
        };
    }, []);

    useEffect(() => {
        if (!adsReady || !shouldRenderAds) {
            return;
        }

        const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
            requestNonPersonalizedAdsOnly: false,
        });
        interstitialRef.current = interstitial;

        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            interstitialLoadedRef.current = true;
        });
        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            interstitialLoadedRef.current = false;
            interstitial.load();
        });
        const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
            interstitialLoadedRef.current = false;
        });

        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
            interstitialLoadedRef.current = false;
            interstitialRef.current = null;
        };
    }, [adsReady]);

    useEffect(() => {
        let active = true;

        const hydrateSettings = async () => {
            try {
                const rawSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
                if (!active) {
                    return;
                }

                setSettings(parseStoredSettings(rawSettings));
            } finally {
                if (active) {
                    setSettingsHydrated(true);
                }
            }
        };

        hydrateSettings();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!settingsHydrated) {
            return;
        }

        AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)).catch(() => undefined);
    }, [settings, settingsHydrated]);

    const playSound = useCallback(
        (soundName: FeedbackSound, force = false) => {
            if (!force && !settings.soundEnabled) {
                return;
            }

            const clip = soundBankRef.current[soundName];
            if (!clip || !clip.isLoaded()) {
                return;
            }

            clip.stop(() => {
                clip.play();
            });
        },
        [settings.soundEnabled],
    );

    const triggerVibration = useCallback(
        (pattern: number | number[], force = false) => {
            if (!force && !settings.vibrationEnabled) {
                return;
            }
            Vibration.vibrate(pattern);
        },
        [settings.vibrationEnabled],
    );

    const currentTurn: Mark = game.xIsNext ? 'X' : 'O';
    const isAiTurn = gameMode === 'PVAI' && game.winner === null && currentTurn === AI_MARK;
    const leftSymbol: Mark = gameMode === 'PVAI' ? HUMAN_MARK : 'O';
    const rightSymbol: Mark = gameMode === 'PVAI' ? AI_MARK : 'X';
    const leftTurnActive = game.winner === null && currentTurn === leftSymbol;
    const rightTurnActive = game.winner === null && currentTurn === rightSymbol;
    const levelBadgeText = gameMode === 'PVAI' ? difficulty.toUpperCase() : 'PVP';

    const modeTitleText = gameMode === 'PVAI' ? 'PLAYER VS AI' : 'PLAYER VS PLAYER';
    const feedbackStatusText = useMemo(() => {
        if (settings.soundEnabled && settings.vibrationEnabled) {
            return 'SOUND + VIBRATION ON';
        }

        if (settings.soundEnabled) {
            return 'SOUND ON';
        }

        if (settings.vibrationEnabled) {
            return 'VIBRATION ON';
        }

        return 'FEEDBACK OFF';
    }, [settings.soundEnabled, settings.vibrationEnabled]);

    useEffect(() => {
        if (!game.winner) {
            return;
        }

        completedRoundsRef.current += 1;

        if (game.winner === 'X') {
            setScore(prev => ({ ...prev, x: prev.x + 1 }));
            playSound('win');
            triggerVibration([0, 40, 30, 40]);
        } else if (game.winner === 'O') {
            setScore(prev => ({ ...prev, o: prev.o + 1 }));
            playSound('win');
            triggerVibration([0, 40, 30, 40]);
        } else {
            setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
            playSound('draw');
            triggerVibration(25);
        }

        if (game.winner === 'Draw' || !game.winningLine) {
            setShowGameOver(true);
            return;
        }

        setShowGameOver(false);
    }, [game.winner, game.winningLine, playSound, triggerVibration]);

    const maybeShowInterstitial = useCallback(() => {
        if (!adsReady || !shouldRenderAds) {
            return;
        }
        if (completedRoundsRef.current === 0 || completedRoundsRef.current % 2 !== 0) {
            return;
        }
        if (!interstitialLoadedRef.current || !interstitialRef.current) {
            return;
        }

        interstitialRef.current.show().catch(() => undefined);
    }, [adsReady]);

    useEffect(() => {
        if (!isAiTurn) {
            return;
        }

        const timer = setTimeout(() => {
            setGame(prevGame => {
                if (prevGame.winner) {
                    return prevGame;
                }

                const liveTurn: Mark = prevGame.xIsNext ? 'X' : 'O';
                if (liveTurn !== AI_MARK) {
                    return prevGame;
                }

                const aiMove = getAiMove(prevGame.board, difficulty, AI_MARK, HUMAN_MARK);
                if (aiMove < 0 || prevGame.board[aiMove] !== null) {
                    return prevGame;
                }

                playSound('move');
                triggerVibration(12);
                return buildNextState(prevGame, aiMove, AI_MARK);
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [difficulty, isAiTurn, playSound, triggerVibration]);

    const statusText = useMemo(() => {
        if (game.winner === 'Draw') {
            return 'ROUND DRAW';
        }

        if (game.winner) {
            if (gameMode === 'PVAI') {
                return game.winner === AI_MARK ? 'AI WINS!' : 'YOU WIN!';
            }
            return `${game.winner} WINS!`;
        }

        if (gameMode === 'PVAI') {
            return isAiTurn ? 'AI THINKING...' : 'YOUR TURN';
        }

        return currentTurn === 'X' ? 'PLAYER X TURN' : 'PLAYER O TURN';
    }, [currentTurn, game.winner, gameMode, isAiTurn]);

    const gameOverModalTitle = useMemo(() => {
        if (game.winner === 'Draw') {
            return 'ROUND DRAW';
        }

        if (game.winner === 'X' || game.winner === 'O') {
            if (gameMode === 'PVAI') {
                return game.winner === AI_MARK ? 'AI WINS!' : 'YOU WIN!';
            }

            return game.winner === 'X' ? 'PLAYER X WINS!' : 'PLAYER O WINS!';
        }

        return 'GAME OVER';
    }, [game.winner, gameMode]);

    const gameOverModalResultText = game.winner === 'Draw' ? 'NO WINNER THIS ROUND' : 'WINNER';

    const handlePressSquare = (index: number) => {
        setGame(prevGame => {
            if (prevGame.board[index] || prevGame.winner) {
                return prevGame;
            }

            const turnMark: Mark = prevGame.xIsNext ? 'X' : 'O';
            if (gameMode === 'PVAI' && turnMark === AI_MARK) {
                return prevGame;
            }

            playSound('move');
            triggerVibration(15);
            return buildNextState(prevGame, index, turnMark);
        });
    };

    const resetRound = useCallback(() => {
        maybeShowInterstitial();
        playSound('tap');
        triggerVibration(10);
        setGame(createInitialGameState(getStartingMark(gameMode)));
        setShowGameOver(false);
    }, [gameMode, maybeShowInterstitial, playSound, triggerVibration]);

    const resetAll = useCallback(() => {
        playSound('tap');
        triggerVibration(10);
        setScore(INITIAL_SCORE);
        setGame(createInitialGameState(getStartingMark(gameMode)));
        setShowGameOver(false);
        completedRoundsRef.current = 0;
    }, [gameMode, playSound, triggerVibration]);

    const handleReplay = () => {
        resetRound();
    };

    const handleHome = () => {
        playSound('tap');
        triggerVibration(8);
        onGoHome();
    };

    const openSettingsModal = () => {
        setSettingsModalVisible(true);
        playSound('tap');
        triggerVibration(8);
    };

    const closeSettingsModal = () => {
        setSettingsModalVisible(false);
        playSound('tap');
    };

    const openConsentFeedbackModal = useCallback((title: string, message: string) => {
        setConsentFeedback({
            visible: true,
            title,
            message,
        });
    }, []);

    const closeConsentFeedbackModal = () => {
        setConsentFeedback(DEFAULT_CONSENT_FEEDBACK);
        playSound('tap');
    };

    const handleOpenPrivacyPolicy = async () => {
        playSound('tap');
        triggerVibration(8, true);

        try {
            await Linking.openURL(PRIVACY_POLICY_URL);
        } catch (error) {
            recordCrashlyticsError(error, 'privacy_policy_open_failed');
            openConsentFeedbackModal(
                'Privacy Policy Unavailable',
                'The privacy policy page could not be opened right now. Please check your internet connection and try again.',
            );
        }
    };

    const handleOpenPrivacyOptions = async () => {
        playSound('tap');
        triggerVibration(8, true);

        try {
            const consentInfo = await AdsConsent.requestInfoUpdate({
                tagForUnderAgeOfConsent: false,
                testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
            });

            if (consentInfo.privacyOptionsRequirementStatus === 'REQUIRED') {
                await AdsConsent.showPrivacyOptionsForm();
                return;
            }

            if (
                consentInfo.isConsentFormAvailable &&
                (consentInfo.status === 'UNKNOWN' || consentInfo.status === 'REQUIRED')
            ) {
                await AdsConsent.showForm();
                return;
            }

            openConsentFeedbackModal(
                'Privacy Options',
                'Privacy options are not required for your current region or consent state.',
            );
        } catch (error) {
            recordCrashlyticsError(error, 'ads_privacy_options_open_failed');
            openConsentFeedbackModal(
                'Consent Form Unavailable',
                'The consent form could not be opened right now. Please check your internet connection and try again.',
            );
        }
    };

    const handleTriggerCrashlyticsTest = async () => {
        playSound('tap');
        triggerVibration(10, true);

        try {
            await triggerCrashlyticsTestCrash();
        } catch (error) {
            recordCrashlyticsError(error, 'crashlytics_test_trigger_failed');
            openConsentFeedbackModal(
                'Crashlytics Test Unavailable',
                'The test crash could not be triggered. Try again on a release build or verify Firebase Crashlytics setup.',
            );
        }
    };

    const handleToggleSound = () => {
        const nextState = !settings.soundEnabled;
        setSettings(prev => ({ ...prev, soundEnabled: nextState }));
        playSound('tap', true);
        triggerVibration(10, true);
    };

    const handleToggleVibration = () => {
        setSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }));
        triggerVibration(10, true);
        playSound('tap');
    };

    const handleResetFromSettings = () => {
        resetAll();
        setSettingsModalVisible(false);
    };

    const handleWinningAnimationComplete = () => {
        if (game.winner && game.winner !== 'Draw') {
            setShowGameOver(true);
        }
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.backgroundBase}
                translucent={false}
                hidden={false}
            />
            <View style={styles.container}>
                <View pointerEvents="none" style={styles.topGlow} />
                <View pointerEvents="none" style={styles.midGlow} />
                <View pointerEvents="none" style={styles.bottomGlow} />
                <View
                    style={[
                        styles.contentWrap,
                        {
                            paddingTop: topUiPadding,
                            paddingBottom: adVisible ? bottomSafeSpace + (topTightLayout ? 2 : 8) : bottomSafeSpace,
                        },
                    ]}>
                    <View style={[styles.content, { width: contentWidth }]}>
                        <View
                            style={[
                                styles.headerRow,
                                topCompactLayout && styles.headerRowCompact,
                                topTightLayout && styles.headerRowTight,
                            ]}>
                            <Pressable
                                onPress={handleHome}
                                accessibilityRole="button"
                                accessibilityLabel="Go back to home"
                                style={({ pressed }) => [
                                    styles.iconBtn,
                                    styles.iconBtnBack,
                                    { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonRadius },
                                    pressed && styles.iconBtnPressed,
                                ]}>
                                <Icon
                                    name="arrow-back"
                                    size={Math.max(18, iconFontSize - 10)}
                                    color={colors.cyanBright}
                                />
                            </Pressable>

                            <View style={styles.headerCenter}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.headerTitle, { fontSize: headerTitleSize }]}>
                                    {modeTitleText}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.headerSubtitle, { fontSize: headerSubtitleSize }]}>
                                    {feedbackStatusText}
                                </Text>
                            </View>

                            <Pressable
                                onPress={openSettingsModal}
                                accessibilityRole="button"
                                accessibilityLabel="Open game settings"
                                style={({ pressed }) => [
                                    styles.iconBtn,
                                    styles.iconBtnSettings,
                                    { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonRadius },
                                    pressed && styles.iconBtnPressed,
                                ]}>
                                <Icon
                                    name="settings-outline"
                                    size={Math.max(18, iconFontSize - 10)}
                                    color={colors.pinkPrimary}
                                />
                            </Pressable>
                        </View>

                        <View>
                            <ScoreBoard
                                score={score}
                                mode={gameMode}
                                currentTurn={currentTurn}
                                winner={game.winner}
                                humanMark={HUMAN_MARK}
                                aiMark={AI_MARK}
                                referenceCellSize={boardCellSize}
                                compact={topCompactLayout}
                                dense={topTightLayout}
                            />
                        </View>

                        <View
                            style={[
                                styles.boardMetaRow,
                                topCompactLayout && styles.boardMetaRowCompact,
                                topTightLayout && styles.boardMetaRowTight,
                            ]}>
                            <View
                                style={[
                                    styles.dotsPill,
                                    topCompactLayout && styles.dotsPillCompact,
                                    topTightLayout && styles.dotsPillTight,
                                ]}>
                                <View
                                    style={[
                                        styles.dot,
                                        topCompactLayout && styles.dotCompact,
                                        topTightLayout && styles.dotTight,
                                        leftTurnActive && styles.dotActive,
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.dot,
                                        topCompactLayout && styles.dotCompact,
                                        topTightLayout && styles.dotTight,
                                        styles.dotMiddle,
                                        topTightLayout && styles.dotMiddleTight,
                                        game.winner === 'Draw' && styles.dotActive,
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.dot,
                                        topCompactLayout && styles.dotCompact,
                                        topTightLayout && styles.dotTight,
                                        rightTurnActive && styles.dotActive,
                                    ]}
                                />
                            </View>

                            <View
                                style={[
                                    styles.levelPill,
                                    topCompactLayout && styles.levelPillCompact,
                                    topTightLayout && styles.levelPillTight,
                                ]}>
                                <Text style={[styles.levelText, { fontSize: levelFontSize }]}>{levelBadgeText}</Text>
                            </View>
                        </View>

                        <View style={[styles.boardOuter, { width: boardSize, height: boardSize }]}>
                            <View pointerEvents="none" style={styles.boardGlow} />
                            <View pointerEvents="none" style={styles.boardSecondaryGlow} />
                            <View pointerEvents="box-none" style={styles.board}>
                                <View pointerEvents="none" style={styles.boardSweepLarge} />
                                <View pointerEvents="none" style={styles.boardSweepSmall} />
                                {game.board.map((value, index) => (
                                    <Square
                                        key={index}
                                        value={value}
                                        onPress={() => handlePressSquare(index)}
                                        disabled={!!game.winner || isAiTurn}
                                        isWinningSquare={game.winningLine?.includes(index) ?? false}
                                    />
                                ))}

                                <View pointerEvents="none" style={styles.gridOverlay}>
                                    <View style={[styles.gridLineVertical, { left: '33.3333%' }]} />
                                    <View style={[styles.gridLineVertical, { left: '66.6666%' }]} />
                                    <View style={[styles.gridLineHorizontal, { top: '33.3333%' }]} />
                                    <View style={[styles.gridLineHorizontal, { top: '66.6666%' }]} />
                                </View>

                                <WinningLine
                                    line={game.winningLine}
                                    boardSize={boardSize}
                                    durationMs={WINNING_LINE_ANIMATION_MS}
                                    onAnimationComplete={handleWinningAnimationComplete}
                                />
                            </View>
                        </View>

                        <View
                            style={[
                                styles.statusRow,
                                topCompactLayout && styles.statusRowCompact,
                                topTightLayout && styles.statusRowTight,
                            ]}>
                            <Text style={[styles.statusText, { fontSize: statusFontSize }]}>{statusText}</Text>
                        </View>

                        <View
                            style={[
                                styles.bottomActionRow,
                                topCompactLayout && styles.bottomActionRowCompact,
                                topTightLayout && styles.bottomActionRowTight,
                            ]}>
                            <Pressable
                                onPress={resetRound}
                                accessibilityRole="button"
                                accessibilityLabel="Replay this round"
                                style={({ pressed }) => [
                                    styles.replayBtn,
                                    {
                                        width: replayButtonSize,
                                        height: replayButtonSize,
                                        borderRadius: replayButtonRadius,
                                    },
                                    pressed && styles.replayBtnPressed,
                                ]}>
                                <Icon name="refresh" size={replayIconSize} color={colors.cyanBright} style={styles.replayIcon} />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {adVisible ? (
                    <View
                        style={[
                            styles.bannerDock,
                            {
                                paddingBottom: Math.max(insets.bottom, spacing.xs) + 2,
                            },
                        ]}>
                        <AdBanner compact />
                    </View>
                ) : null}
            </View>

            <Modal
                transparent
                visible={settingsModalVisible}
                animationType="fade"
                onRequestClose={closeSettingsModal}>
                <Pressable style={styles.settingsBackdrop} onPress={closeSettingsModal}>
                    <Pressable style={[styles.settingsCard, { width: Math.min(contentWidth, 360) }]} onPress={() => {}}>
                        <View style={styles.settingsHeaderRow}>
                            <Text style={[styles.settingsTitle, { fontSize: settingsTitleSize }]}>GAME SETTINGS</Text>
                            <Pressable
                                onPress={closeSettingsModal}
                                accessibilityRole="button"
                                accessibilityLabel="Close game settings"
                                style={({ pressed }) => [styles.settingsCloseBtn, pressed && styles.settingsCloseBtnPressed]}>
                                <Icon name="close" size={20} color={colors.textPrimary} />
                            </Pressable>
                        </View>

                        <Text style={styles.settingsSubtitle}>Control haptics and sound for every move.</Text>

                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelRow}>
                                <View style={styles.settingIconWrap}>
                                    <Icon name="volume-high-outline" size={18} color={colors.cyanPrimary} />
                                </View>
                                <View style={styles.settingTextWrap}>
                                    <Text style={styles.settingLabel}>Sound Effects</Text>
                                    <Text style={styles.settingHint}>Move, win, draw and tap sound</Text>
                                </View>
                            </View>
                            <Switch
                                value={settings.soundEnabled}
                                onValueChange={handleToggleSound}
                                thumbColor={settings.soundEnabled ? colors.cyanBright : '#b7c8df'}
                                trackColor={{
                                    false: 'rgba(153, 174, 206, 0.38)',
                                    true: 'rgba(54, 235, 255, 0.54)',
                                }}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingLabelRow}>
                                <View style={styles.settingIconWrap}>
                                    <Icon name="phone-portrait-outline" size={18} color={colors.pinkPrimary} />
                                </View>
                                <View style={styles.settingTextWrap}>
                                    <Text style={styles.settingLabel}>Vibration</Text>
                                    <Text style={styles.settingHint}>Tap and round-result haptics</Text>
                                </View>
                            </View>
                            <Switch
                                value={settings.vibrationEnabled}
                                onValueChange={handleToggleVibration}
                                thumbColor={settings.vibrationEnabled ? colors.textPrimary : '#c7cde2'}
                                trackColor={{
                                    false: 'rgba(153, 174, 206, 0.38)',
                                    true: 'rgba(182, 115, 255, 0.54)',
                                }}
                            />
                        </View>

                        <Pressable
                            onPress={handleOpenPrivacyPolicy}
                            accessibilityRole="button"
                            accessibilityLabel="Open privacy policy website page"
                            style={({ pressed }) => [
                                styles.settingsPolicyBtn,
                                pressed && styles.settingsResetBtnPressed,
                            ]}>
                            <Icon name="document-text-outline" size={18} color={colors.cyanPrimary} />
                            <Text style={styles.settingsPolicyText}>PRIVACY POLICY</Text>
                        </Pressable>

                        {shouldRenderAds ? (
                            <Pressable
                                onPress={handleOpenPrivacyOptions}
                                accessibilityRole="button"
                                accessibilityLabel="Manage ad consent and privacy choices"
                                style={({ pressed }) => [
                                    styles.settingsPrivacyBtn,
                                    pressed && styles.settingsResetBtnPressed,
                                ]}>
                                <Icon name="shield-checkmark-outline" size={18} color={colors.pinkPrimary} />
                                <Text style={styles.settingsPrivacyText}>MANAGE AD CONSENT</Text>
                            </Pressable>
                        ) : null}

                        {ENABLE_INTERNAL_CRASHLYTICS_TEST_BUTTON ? (
                            <Pressable
                                onPress={() =>
                                    openConsentFeedbackModal(
                                        'Crashlytics Test',
                                        'Press and hold the button to trigger a test crash. The app will close. Reopen it to upload the report, then check Firebase Crashlytics after a few minutes.',
                                    )
                                }
                                onLongPress={handleTriggerCrashlyticsTest}
                                delayLongPress={450}
                                accessibilityRole="button"
                                accessibilityLabel="Press and hold to trigger an internal Crashlytics test crash"
                                style={({ pressed }) => [
                                    styles.settingsTestCrashBtn,
                                    pressed && styles.settingsResetBtnPressed,
                                ]}>
                                <Icon name="warning-outline" size={18} color={colors.pinkPrimary} />
                                <Text style={styles.settingsTestCrashText}>HOLD TO TEST CRASHLYTICS</Text>
                            </Pressable>
                        ) : null}

                        <Pressable
                            onPress={handleResetFromSettings}
                            accessibilityRole="button"
                            accessibilityLabel="Reset score and start a new match"
                            style={({ pressed }) => [styles.settingsResetBtn, pressed && styles.settingsResetBtnPressed]}>
                            <Icon name="refresh-circle-outline" size={19} color={colors.cyanPrimary} />
                            <Text style={styles.settingsResetText}>RESET MATCH</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                transparent
                visible={consentFeedback.visible}
                animationType="fade"
                onRequestClose={closeConsentFeedbackModal}>
                <Pressable style={styles.settingsBackdrop} onPress={closeConsentFeedbackModal}>
                    <Pressable
                        style={[styles.consentFeedbackCard, { width: Math.min(contentWidth, 360) }]}
                        onPress={() => {}}>
                        <View style={styles.consentFeedbackHeader}>
                            <View style={styles.consentFeedbackBadge}>
                                <Icon name="shield-checkmark-outline" size={18} color={colors.pinkPrimary} />
                            </View>
                            <Text style={styles.consentFeedbackTitle}>{consentFeedback.title}</Text>
                        </View>

                        <Text style={styles.consentFeedbackMessage}>{consentFeedback.message}</Text>

                        <Pressable
                            onPress={closeConsentFeedbackModal}
                            accessibilityRole="button"
                            accessibilityLabel="Close consent information"
                            style={({ pressed }) => [
                                styles.consentFeedbackOkBtn,
                                pressed && styles.settingsResetBtnPressed,
                            ]}>
                            <Text style={styles.consentFeedbackOkText}>OK</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            <GameOverModal
                visible={showGameOver}
                winner={game.winner || 'Draw'}
                titleText={gameOverModalTitle}
                resultText={gameOverModalResultText}
                onHome={handleHome}
                onReplay={handleReplay}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.backgroundBase,
    },
    container: {
        flex: 1,
        backgroundColor: colors.backgroundBase,
    },
    contentWrap: {
        flex: 1,
        paddingTop: spacing.xs,
        paddingHorizontal: spacing.xs,
        justifyContent: 'space-between',
    },
    content: {
        width: '100%',
        alignSelf: 'center',
    },
    topGlow: {
        position: 'absolute',
        width: 520,
        height: 520,
        borderRadius: 520,
        top: -290,
        left: -70,
        backgroundColor: 'rgba(41, 110, 255, 0.36)',
    },
    midGlow: {
        position: 'absolute',
        width: 440,
        height: 440,
        borderRadius: 440,
        right: -240,
        top: 260,
        backgroundColor: 'rgba(28, 107, 241, 0.32)',
    },
    bottomGlow: {
        position: 'absolute',
        width: 560,
        height: 560,
        borderRadius: 560,
        left: -270,
        bottom: -300,
        backgroundColor: 'rgba(171, 44, 255, 0.43)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    headerRowCompact: {
        marginBottom: 6,
    },
    headerRowTight: {
        marginBottom: 16,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.wide,
        textShadowColor: 'rgba(140, 227, 255, 0.35)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    headerSubtitle: {
        marginTop: 2,
        color: colors.textSecondary,
        fontWeight: typography.weight.semibold,
        letterSpacing: typography.tracking.normal,
        textShadowColor: 'rgba(92, 189, 255, 0.18)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    iconBtn: {
        width: 56,
        height: 56,
        borderRadius: radii.lg,
        borderWidth: 1.5,
        backgroundColor: 'rgba(20, 4, 75, 0.84)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconBtnBack: {
        borderColor: colors.cyanBorder,
        backgroundColor: 'rgba(7, 41, 119, 0.9)',
        ...shadows.cyanSoft,
        ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    iconBtnSettings: {
        borderColor: colors.pinkPrimary,
        backgroundColor: 'rgba(56, 19, 104, 0.9)',
        ...shadows.pinkSoft,
        ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    iconBtnPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.97 }],
    },
    boardMetaRow: {
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    boardMetaRowCompact: {
        marginTop: 6,
        marginBottom: 8,
    },
    boardMetaRowTight: {
        marginTop: 2,
        marginBottom: 4,
    },
    dotsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radii.sm + 3,
        borderWidth: 1.4,
        borderColor: colors.cyanSoft,
        backgroundColor: 'rgba(7, 37, 101, 0.78)',
        paddingHorizontal: spacing.sm + 2,
        height: 40,
        minWidth: 122,
    },
    dotsPillCompact: {
        height: 34,
        minWidth: 108,
        paddingHorizontal: spacing.sm,
    },
    dotsPillTight: {
        height: 30,
        minWidth: 98,
        paddingHorizontal: spacing.xs + 2,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 14,
        borderWidth: 1.4,
        borderColor: 'rgba(117, 240, 255, 0.7)',
        backgroundColor: 'rgba(11, 61, 138, 0.7)',
    },
    dotCompact: {
        width: 12,
        height: 12,
        borderRadius: 12,
    },
    dotTight: {
        width: 10,
        height: 10,
        borderRadius: 10,
    },
    dotMiddle: {
        marginHorizontal: 8,
    },
    dotMiddleTight: {
        marginHorizontal: 6,
    },
    dotActive: {
        borderColor: colors.cyanBright,
        backgroundColor: colors.textPrimary,
        shadowColor: '#9cf8ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.95,
        shadowRadius: 8,
    },
    levelPill: {
        borderRadius: radii.sm + 2,
        borderWidth: 1.4,
        borderColor: colors.cyanSoft,
        backgroundColor: colors.cardSurfaceStrong,
        minWidth: 116,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm + 2,
        height: 40,
    },
    levelPillCompact: {
        minWidth: 102,
        height: 34,
        paddingHorizontal: spacing.sm,
    },
    levelPillTight: {
        minWidth: 94,
        height: 30,
        paddingHorizontal: spacing.xs + 2,
    },
    levelText: {
        color: colors.cyanPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.normal,
    },
    boardOuter: {
        alignSelf: 'center',
        borderRadius: radii.xxl,
        marginTop: 10,
    },
    boardGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: radii.xxl,
        borderWidth: 2,
        borderColor: colors.cyanPrimary,
        ...shadows.cyanStrong,
    },
    boardSecondaryGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: radii.xxl,
        borderWidth: 8,
        borderColor: 'rgba(19, 187, 255, 0.16)',
    },
    board: {
        flex: 1,
        borderRadius: radii.xxl,
        borderWidth: 2,
        borderColor: 'rgba(37, 235, 255, 0.96)',
        backgroundColor: colors.boardSurface,
        overflow: 'hidden',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    boardSweepLarge: {
        position: 'absolute',
        width: '188%',
        height: '188%',
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: 'rgba(94, 178, 255, 0.22)',
        top: '-80%',
        left: '-42%',
    },
    boardSweepSmall: {
        position: 'absolute',
        width: '138%',
        height: '138%',
        borderRadius: 999,
        borderWidth: 1.2,
        borderColor: 'rgba(86, 171, 255, 0.16)',
        top: '-52%',
        left: '-16%',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLineVertical: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 3,
        marginLeft: -1.5,
        backgroundColor: 'rgba(39, 207, 255, 0.22)',
    },
    gridLineHorizontal: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        marginTop: -1.5,
        backgroundColor: 'rgba(39, 207, 255, 0.22)',
    },
    statusRow: {
        marginTop: spacing.sm,
        alignItems: 'center',
    },
    statusRowCompact: {
        marginTop: spacing.sm - 2,
    },
    statusRowTight: {
        marginTop: 4,
    },
    statusText: {
        color: colors.cyanPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.wide,
        textShadowColor: 'rgba(95, 244, 255, 0.75)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    bottomActionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.sm + 2,
    },
    bottomActionRowCompact: {
        marginTop: spacing.sm - 2,
    },
    bottomActionRowTight: {
        marginTop: 4,
    },
    bannerDock: {
        paddingHorizontal: spacing.xs,
        backgroundColor: 'transparent',
    },
    replayBtn: {
        width: 94,
        height: 94,
        borderRadius: radii.xl - 2,
        borderWidth: 2,
        borderColor: colors.cyanPrimary,
        backgroundColor: 'rgba(6, 40, 118, 0.86)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    replayBtnPressed: {
        opacity: 0.86,
        transform: [{ scale: 0.97 }],
    },
    replayIcon: {
        textShadowColor: 'transparent',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0,
    },
    settingsBackdrop: {
        flex: 1,
        backgroundColor: colors.overlayDark,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    settingsCard: {
        borderRadius: radii.xxl,
        borderWidth: 2,
        borderColor: colors.cyanBorder,
        backgroundColor: 'rgba(8, 37, 116, 0.95)',
        padding: spacing.lg,
        ...shadows.cyanStrong,
    },
    settingsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingsTitle: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.wide,
    },
    settingsCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: radii.pill,
        borderWidth: 1.4,
        borderColor: 'rgba(195, 220, 255, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(22, 76, 156, 0.7)',
    },
    settingsCloseBtnPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.96 }],
    },
    settingsSubtitle: {
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
        color: colors.textSecondary,
        fontWeight: typography.weight.medium,
        letterSpacing: typography.tracking.normal,
    },
    settingsTitleFlare: {
        height: 2,
        borderRadius: radii.pill,
        backgroundColor: 'rgba(83, 228, 255, 0.86)',
        marginBottom: spacing.md,
        shadowColor: colors.cyanGlow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 8,
        elevation: 6,
    },
    settingRow: {
        borderWidth: 1.2,
        borderColor: 'rgba(100, 223, 255, 0.5)',
        borderRadius: radii.lg,
        backgroundColor: 'rgba(9, 39, 101, 0.7)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    settingLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        paddingRight: spacing.sm,
    },
    settingIconWrap: {
        width: 34,
        height: 34,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: 'rgba(136, 216, 255, 0.54)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(8, 64, 155, 0.5)',
        marginRight: spacing.sm,
    },
    settingTextWrap: {
        flexShrink: 1,
    },
    settingLabel: {
        color: colors.textPrimary,
        fontWeight: typography.weight.bold,
        letterSpacing: typography.tracking.normal,
    },
    settingHint: {
        marginTop: 2,
        color: colors.textSecondary,
        fontSize: typography.size.xs,
        letterSpacing: typography.tracking.tight,
    },
    settingsResetBtn: {
        marginTop: spacing.xs,
        borderRadius: radii.lg,
        borderWidth: 1.6,
        borderColor: colors.cyanPrimary,
        backgroundColor: 'rgba(8, 66, 146, 0.88)',
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    settingsPolicyBtn: {
        borderRadius: radii.lg,
        borderWidth: 1.6,
        borderColor: colors.cyanPrimary,
        backgroundColor: 'rgba(8, 66, 146, 0.88)',
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    settingsPrivacyBtn: {
        borderRadius: radii.lg,
        borderWidth: 1.6,
        borderColor: colors.pinkPrimary,
        backgroundColor: 'rgba(59, 30, 122, 0.84)',
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    settingsResetBtnPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.98 }],
    },
    settingsResetText: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.normal,
    },
    settingsPolicyText: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.tight,
    },
    settingsPrivacyText: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.tight,
    },
    settingsTestCrashBtn: {
        marginTop: spacing.xs,
        borderRadius: radii.md,
        borderWidth: 1.4,
        borderColor: 'rgba(255, 151, 201, 0.85)',
        backgroundColor: 'rgba(92, 23, 65, 0.76)',
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    settingsTestCrashText: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.tight,
    },
    consentFeedbackCard: {
        borderRadius: radii.xl,
        borderWidth: 1.6,
        borderColor: colors.pinkPrimary,
        backgroundColor: 'rgba(10, 28, 91, 0.97)',
        padding: spacing.lg,
        ...shadows.cyanSoft,
    },
    consentFeedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    consentFeedbackBadge: {
        width: 34,
        height: 34,
        borderRadius: radii.pill,
        borderWidth: 1.2,
        borderColor: 'rgba(219, 159, 255, 0.7)',
        backgroundColor: 'rgba(76, 34, 132, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    consentFeedbackTitle: {
        flex: 1,
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.normal,
        fontSize: typography.size.lg,
    },
    consentFeedbackMessage: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontWeight: typography.weight.medium,
        lineHeight: 20,
        letterSpacing: typography.tracking.tight,
    },
    consentFeedbackOkBtn: {
        marginTop: spacing.md,
        minHeight: 46,
        borderRadius: radii.md,
        borderWidth: 1.4,
        borderColor: colors.cyanPrimary,
        backgroundColor: 'rgba(10, 74, 164, 0.82)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    consentFeedbackOkText: {
        color: colors.textPrimary,
        fontWeight: typography.weight.heavy,
        letterSpacing: typography.tracking.normal,
    },
});

export default GameScreen;
