import { useCallback, useEffect, useRef } from 'react';
import { Image, Platform } from 'react-native';
import Sound from 'react-native-sound';

export type FeedbackSound = 'move' | 'win' | 'draw' | 'tap';

const MOVE_SOUND = require('../assets/sounds/move.wav');
const WIN_SOUND = require('../assets/sounds/win.wav');
const DRAW_SOUND = require('../assets/sounds/draw.wav');
const TAP_SOUND = require('../assets/sounds/tap.wav');
const BGM_SOUND = require('../assets/sounds/bgm.wav');

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
        // Fail silently
      }
    });
    clip.setVolume(0.95);
    return clip;
  } catch {
    return null;
  }
};

export const useGameSounds = (soundEnabled: boolean, bgmEnabled: boolean) => {
  const soundBankRef = useRef<Record<FeedbackSound, Sound | null>>({
    move: null,
    win: null,
    draw: null,
    tap: null,
  });
  const bgmRef = useRef<Sound | null>(null);

  useEffect(() => {
    Sound.setCategory('Ambient', true);

    const sounds: Record<FeedbackSound, Sound | null> = {
      move: createSound(MOVE_SOUND),
      win: createSound(WIN_SOUND),
      draw: createSound(DRAW_SOUND),
      tap: createSound(TAP_SOUND),
    };
    soundBankRef.current = sounds;

    // Load BGM
    const bgmPath = resolveSoundPath(BGM_SOUND);
    if (bgmPath) {
      try {
        const bgm = new Sound(bgmPath, '', error => {
          if (!error && bgmRef.current) {
            bgmRef.current.setNumberOfLoops(-1);
            bgmRef.current.setVolume(0.4); // Lower volume for background music
            if (bgmEnabled) {
              bgmRef.current.play();
            }
          }
        });
        bgmRef.current = bgm;
      } catch (e) {
        // Fail silently
      }
    }

    return () => {
      Object.values(sounds).forEach(sound => sound?.release());
      if (bgmRef.current) {
        bgmRef.current.stop();
        bgmRef.current.release();
        bgmRef.current = null;
      }
    };
  }, []);

  // Update BGM state when BGM setting changes
  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm || !bgm.isLoaded()) {
      return;
    }

    if (bgmEnabled) {
      bgm.play();
    } else {
      bgm.stop();
    }
  }, [bgmEnabled]);

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
