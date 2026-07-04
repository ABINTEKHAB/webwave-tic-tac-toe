import { useCallback, useEffect, useRef } from 'react';
import { warn } from '../utils/logger';
import { Image, Platform } from 'react-native';
import Sound from 'react-native-sound';

export type FeedbackSound =
  | 'move'
  | 'omove'
  | 'xmove'
  | 'win'
  | 'owin'
  | 'xwin'
  | 'gameover'
  | 'draw'
  | 'tap'
  | 'dice'
  | 'pour'
  | 'ludo_eat'
  | 'ludo_place'
  | 'ting';

const MOVE_SOUND = require('../assets/sounds/move.wav');
const OMOVE_SOUND = require('../assets/sounds/omove.wav');
const XMOVE_SOUND = require('../assets/sounds/xmove.wav');
const WIN_SOUND = require('../assets/sounds/win.wav');
const OWIN_SOUND = require('../assets/sounds/owin.mp3');
const XWIN_SOUND = require('../assets/sounds/xwin.wav');
const GAMEOVER_SOUND = require('../assets/sounds/draw_gameover.mp3');
const TING_SOUND = require('../assets/sounds/ting.wav');
const DRAW_SOUND = require('../assets/sounds/draw.wav');
const DICE_SOUND = require('../assets/sounds/dice.wav');
const POUR_SOUND = require('../assets/sounds/pour.wav');
const LUDO_EAT_SOUND = require('../assets/sounds/ludo_eat.wav');
const LUDO_PLACE_SOUND = require('../assets/sounds/ludo_place.wav');
const TAP_SOUND = require('../assets/sounds/touch.wav');

const resolveSoundPath = (soundAsset: number, soundName?: string): string | null => {
  try {
    const asset = Image.resolveAssetSource(soundAsset);
    if (asset?.uri) {
      if (Platform.OS === 'android' && asset.uri.startsWith('file://')) {
        return asset.uri.replace('file://', '');
      }
      return asset.uri;
    }
  } catch (error) {
    warn(`Failed to resolve asset source for sound ${soundName || ''}:`, error);
  }

  // Fallback for release builds where Image.resolveAssetSource might not work
  // Try raw resource ID approach for Android
  if (Platform.OS === 'android' && soundName) {
    const resourcePath = `raw/${soundName}`;
    return resourcePath;
  }

  return null;
};

const createSound = (soundAsset: number, name?: string): Sound | null => {
  const soundPath = resolveSoundPath(soundAsset);
  if (!soundPath) {
    return null;
  }

  try {
    const clip = new Sound(soundPath, '', error => {
      if (error) {
        warn(`Failed to load sound ${name || ''}:`, error);
      }
    });
    clip.setVolume(0.95);
    return clip;
  } catch (err) {
    warn(`Failed to create sound instance ${name || ''}:`, err);
    return null;
  }
};

export const useGameSounds = (soundEnabled: boolean) => {
  const soundBankRef = useRef<Record<FeedbackSound, Sound | null>>({
    move: null,
    omove: null,
    xmove: null,
    win: null,
    owin: null,
    xwin: null,
    gameover: null,
    draw: null,
    ting: null,
    tap: null,
    dice: null,
    pour: null,
    ludo_eat: null,
    ludo_place: null,
  });


  useEffect(() => {
    Sound.setCategory('Ambient', true);

    const sounds: Record<FeedbackSound, Sound | null> = {
      move: createSound(MOVE_SOUND, 'move'),
      omove: createSound(OMOVE_SOUND, 'omove'),
      xmove: createSound(XMOVE_SOUND, 'xmove'),
      win: createSound(WIN_SOUND, 'win'),
      owin: createSound(OWIN_SOUND, 'owin'),
      xwin: createSound(XWIN_SOUND, 'xwin'),
      gameover: createSound(GAMEOVER_SOUND, 'gameover'),
      draw: createSound(DRAW_SOUND, 'draw'),
      tap: createSound(TAP_SOUND, 'tap'),
      ting: createSound(TING_SOUND, 'ting'),
      dice: createSound(DICE_SOUND, 'dice'),
      pour: createSound(POUR_SOUND, 'pour'),
      ludo_eat: createSound(LUDO_EAT_SOUND, 'ludo_eat'),
      ludo_place: createSound(LUDO_PLACE_SOUND, 'ludo_place'),
    };
    soundBankRef.current = sounds;

    return () => {
      Object.values(sounds).forEach(sound => sound?.release());
    };
  }, []);



  const playSound = useCallback((soundName: FeedbackSound, force = false) => {
    if (!force && !soundEnabled) {
      return;
    }

    const clip = soundBankRef.current[soundName];
    if (!clip || !clip.isLoaded()) {
      return;
    }

    clip.stop(() => {
      clip.play();
    });
  }, [soundEnabled]);

  return { playSound };
};
