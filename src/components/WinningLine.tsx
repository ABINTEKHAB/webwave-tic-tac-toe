import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {colors} from '../theme/tokens';

interface WinningLineProps {
  line: number[] | null;
  boardSize: number;
  durationMs?: number;
  onAnimationComplete?: () => void;
}

interface ParticleSpec {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  spin: number;
  stretch: number;
}

const SEGMENT_THICKNESS = 8;

const PARTICLE_COLORS = [
  colors.cyanBright,
  colors.cyanGlow,
  colors.pinkPrimary,
  colors.pinkGlow,
  colors.markOPrimary,
  colors.markXPrimary,
];

const createParticles = (count: number): ParticleSpec[] =>
  Array.from({length: count}, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + ((index % 3) - 1) * 0.16;
    const distance = 28 + (index % 5) * 10;
    const size = 4 + (index % 4) * 1.8;
    const delay = (index % 6) * 0.04;
    const spin = (index % 2 === 0 ? 1 : -1) * (80 + (index % 5) * 36);
    const stretch = index % 3 === 0 ? 1 : index % 3 === 1 ? 1.8 : 2.2;

    return {
      angle,
      distance,
      size,
      color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
      delay,
      spin,
      stretch,
    };
  });

const getCellCenterPx = (cellIndex: number, boardSize: number) => {
  const row = Math.floor(cellIndex / 3);
  const col = cellIndex % 3;
  const cellSize = boardSize / 3;
  return {
    x: (col + 0.5) * cellSize,
    y: (row + 0.5) * cellSize,
  };
};

const WinningLine = ({line, boardSize, durationMs = 1200, onAnimationComplete}: WinningLineProps) => {
  const drawProgress = useRef(new Animated.Value(0)).current;
  const burstProgress = useRef(new Animated.Value(0)).current;
  const particles = useRef(createParticles(16)).current;
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  const burstAnchors = useMemo(() => {
    if (!line || boardSize <= 0) {
      return [];
    }
    return line.map(cell => getCellCenterPx(cell, boardSize));
  }, [line, boardSize]);

  const lineGeometry = useMemo(() => {
    if (!line || boardSize <= 0) {
      return null;
    }

    const start = getCellCenterPx(line[0], boardSize);
    const end = getCellCenterPx(line[2], boardSize);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      length,
      angleDeg,
      midX: (start.x + end.x) / 2,
      midY: (start.y + end.y) / 2,
    };
  }, [line, boardSize]);

  useEffect(() => {
    if (!line || boardSize <= 0) {
      return;
    }

    drawProgress.setValue(0);
    burstProgress.setValue(0);

    const drawDuration = Math.max(400, Math.floor(durationMs * 0.55));
    const burstDuration = Math.max(300, durationMs - drawDuration);

    const drawAnimation = Animated.timing(drawProgress, {
      toValue: 1,
      duration: drawDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    const burstAnimation = Animated.timing(burstProgress, {
      toValue: 1,
      duration: burstDuration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    Animated.sequence([drawAnimation, burstAnimation]).start(({finished}) => {
      if (finished) {
        onAnimationCompleteRef.current?.();
      }
    });

    return () => {
      drawAnimation.stop();
      burstAnimation.stop();
    };
  }, [line, boardSize, drawProgress, burstProgress, durationMs]);

  if (!line || !lineGeometry) {
    return null;
  }

  const drawWidth = drawProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, lineGeometry.length],
  });

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View
        style={[
          styles.segmentTrack,
          {
            width: lineGeometry.length,
            height: SEGMENT_THICKNESS,
            left: lineGeometry.midX - lineGeometry.length / 2,
            top: lineGeometry.midY - SEGMENT_THICKNESS / 2,
            transform: [{rotate: `${lineGeometry.angleDeg}deg`}],
          },
        ]}>
        <Animated.View
          style={[
            styles.segment,
            {
              width: drawWidth,
              height: SEGMENT_THICKNESS,
            },
          ]}
        />
      </View>

      {burstAnchors.map((anchor, anchorIndex) => (
        <View
          key={`burst-anchor-${anchorIndex}`}
          pointerEvents="none"
          style={[styles.burstAnchor, {left: anchor.x, top: anchor.y}]}>
          {particles.map((particle, particleIndex) => {
            const phase = burstProgress.interpolate({
              inputRange: [0, particle.delay, 1],
              outputRange: [0, 0, 1],
              extrapolate: 'clamp',
            });
            const travelBoost = anchorIndex === 1 ? 1.3 : 0.9;
            const targetX = Math.cos(particle.angle) * particle.distance * travelBoost;
            const targetY = Math.sin(particle.angle) * particle.distance * travelBoost;
            const translateX = phase.interpolate({
              inputRange: [0, 1],
              outputRange: [0, targetX],
            });
            const translateY = phase.interpolate({
              inputRange: [0, 1],
              outputRange: [0, targetY],
            });
            const scale = phase.interpolate({
              inputRange: [0, 0.28, 1],
              outputRange: [0.55, 1, 0.64],
              extrapolate: 'clamp',
            });
            const opacity = phase.interpolate({
              inputRange: [0, 0.14, 0.84, 1],
              outputRange: [0, 1, 1, 0],
              extrapolate: 'clamp',
            });
            const rotate = phase.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${particle.spin}deg`],
            });

            const width = particle.size * particle.stretch;
            const height = particle.stretch > 1.5 ? particle.size * 0.55 : particle.size;

            return (
              <Animated.View
                key={`particle-${anchorIndex}-${particleIndex}`}
                style={[
                  styles.particle,
                  {
                    width,
                    height,
                    marginLeft: -width / 2,
                    marginTop: -height / 2,
                    borderRadius: particle.stretch > 1.5 ? 999 : height / 2,
                    backgroundColor: particle.color,
                    shadowColor: particle.color,
                    shadowRadius: particle.stretch > 1.5 ? 9 : 7,
                    opacity,
                    transform: [{translateX}, {translateY}, {rotate}, {scale}],
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
  },
  segment: {
    backgroundColor: colors.markCore,
    borderRadius: 999,
    shadowColor: colors.cyanGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 18,
  },
  segmentTrack: {
    position: 'absolute',
  },
  burstAnchor: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 7,
    elevation: 9,
  },
});

export default WinningLine;
