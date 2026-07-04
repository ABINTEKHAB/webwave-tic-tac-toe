import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';

interface SplashPortalProps {
  onFinish: () => void;
}

const SplashPortal = ({ onFinish }: SplashPortalProps) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { width } = useWindowDimensions();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const vortexRotateOuter = useRef(new Animated.Value(0)).current;
  const vortexRotateInner = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Stardust floating particles
  const particleAnims = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      y: new Animated.Value(Math.random() * 600),
      xOffset: new Animated.Value(Math.random() * 40 - 20),
      opacity: Math.random() * 0.6 + 0.2,
      scale: Math.random() * 0.8 + 0.4,
      color: Math.random() > 0.5 ? '#00f5ff' : '#ff75c3',
    }));
  }, []);

  useEffect(() => {
    // 1. Logo scale bounce-in
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 5,
      tension: 30,
      useNativeDriver: true,
    }).start();

    // 2. Swirling rotation animations
    Animated.loop(
      Animated.timing(vortexRotateOuter, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(vortexRotateInner, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Float stardust particles upwards
    particleAnims.forEach(particle => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: -50,
            duration: 4000 + Math.random() * 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.xOffset, {
              toValue: Math.random() * 50 - 25,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(particle.xOffset, {
              toValue: Math.random() * 50 - 25,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    // 4. Loading Bar progress
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      // 5. Fade-out splash screen on complete
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    });
  }, [logoScale, vortexRotateOuter, vortexRotateInner, loadingProgress, splashOpacity, particleAnims, onFinish]);

  // Interpolate rotations
  const rotateOuterStr = vortexRotateOuter.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateInnerStr = vortexRotateInner.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: splashOpacity }]}>
      {/* Drifting Starfield Background */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {particleAnims.map((p, i) => {
          const leftPos = (i / 15) * width * 0.9 + width * 0.05;
          return (
            <Animated.View
              key={`star-${i}`}
              style={[
                styles.star,
                {
                  left: leftPos,
                  transform: [
                    { translateY: p.y },
                    { translateX: p.xOffset },
                    { scale: p.scale },
                  ],
                  opacity: p.opacity,
                  backgroundColor: p.color,
                  shadowColor: p.color,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Swirling Nebula Portal Logo */}
      <Animated.View style={[styles.portalWrapper, { transform: [{ scale: logoScale }] }]}>
        <Animated.View
          style={[
            styles.portalRing,
            styles.portalRingOuter,
            { transform: [{ rotate: rotateOuterStr }] },
          ]}
        />
        <Animated.View
          style={[
            styles.portalRing,
            styles.portalRingInner,
            { transform: [{ rotate: rotateInnerStr }] },
          ]}
        />
        {/* Core Glow */}
        <View style={styles.portalCore} />
      </Animated.View>

      {/* Title block */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>WEBWAVE GLOBAL</Text>
        <Text style={styles.subtitleText}>GAME PORTAL</Text>
      </View>

      {/* horizontal progress loader */}
      <View style={styles.loaderContainer}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingStatusText}>Loading Webwave Games...</Text>
      </View>

      {/* Footer Info */}
      <Text style={styles.footerText}>© 2026 Webwave Global</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050a', // space-deep-void
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  star: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  portalWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  portalRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2.2,
    borderStyle: 'dashed',
  },
  portalRingOuter: {
    width: 120,
    height: 120,
    borderColor: '#ff75c3', // nova-magenta
    shadowColor: '#ff75c3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.84,
    shadowRadius: 10,
  },
  portalRingInner: {
    width: 86,
    height: 86,
    borderColor: '#00f5ff', // nebula-cyan
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.84,
    shadowRadius: 8,
  },
  portalCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  titleText: {
    fontFamily: typography.family.black,
    fontSize: 30,
    color: '#f8f9fa', // starlight-white
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: typography.family.semibold,
    fontSize: 12,
    color: '#9295af', // starlight-dim
    letterSpacing: 6,
    marginTop: 8,
    textAlign: 'center',
  },
  loaderContainer: {
    width: '74%',
    alignItems: 'center',
    marginBottom: 40,
  },
  loaderTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // cosmic-frost
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  loaderBar: {
    height: '100%',
    backgroundColor: '#00f5ff', // nebula-cyan
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
  },
  loadingStatusText: {
    fontFamily: typography.family.medium,
    fontSize: 10,
    color: '#9295af',
    letterSpacing: 1.5,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  footerText: {
    fontFamily: typography.family.body,
    fontSize: 10,
    color: 'rgba(146, 149, 175, 0.4)',
    letterSpacing: 1,
  },
});

export default SplashPortal;
