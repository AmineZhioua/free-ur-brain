import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';
import { useReduceMotion } from './motion';

interface Props {
  tone?: 'light' | 'blue';
}

interface StarConfig {
  x: number; // percentage (0 - 1)
  y: number; // percentage (0 - 1)
  size: number;
  duration: number;
  delay: number;
}

const BLUE_STARS: StarConfig[] = [
  { x: 0.12, y: 0.14, size: 2.2, duration: 3200, delay: 0 },
  { x: 0.85, y: 0.18, size: 2.8, duration: 4100, delay: 800 },
  { x: 0.28, y: 0.32, size: 1.8, duration: 3600, delay: 1500 },
  { x: 0.74, y: 0.42, size: 2.4, duration: 4600, delay: 400 },
  { x: 0.18, y: 0.58, size: 2.0, duration: 3900, delay: 1200 },
  { x: 0.82, y: 0.68, size: 2.6, duration: 4400, delay: 2000 },
  { x: 0.45, y: 0.78, size: 2.0, duration: 3700, delay: 900 },
  { x: 0.88, y: 0.88, size: 2.2, duration: 4200, delay: 1700 },
];

/**
 * Modern, art-directed ambient background animation with breathing floating orbs
 * and gentle celestial aura. Smooth, lightweight, and fully native-driver accelerated.
 */
export function AmbientBackground({ tone = 'light' }: Props) {
  const { width, height } = useWindowDimensions();
  const reduce = useReduceMotion();

  // Light tone animation drivers
  const drift1 = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;
  const drift3 = useRef(new Animated.Value(0)).current;

  // Blue tone animation drivers
  const pulseAura = useRef(new Animated.Value(0)).current;
  const tideDeep = useRef(new Animated.Value(0)).current;

  // Star twinkle animation drivers
  const starAnims = useRef(BLUE_STARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reduce) return;

    if (tone === 'light') {
      const loop1 = Animated.loop(
        Animated.sequence([
          Animated.timing(drift1, {
            toValue: 1,
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(drift1, {
            toValue: 0,
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const loop2 = Animated.loop(
        Animated.sequence([
          Animated.timing(drift2, {
            toValue: 1,
            duration: 11500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(drift2, {
            toValue: 0,
            duration: 11500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const loop3 = Animated.loop(
        Animated.sequence([
          Animated.timing(drift3, {
            toValue: 1,
            duration: 13000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(drift3, {
            toValue: 0,
            duration: 13000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      loop1.start();
      loop2.start();
      loop3.start();

      return () => {
        loop1.stop();
        loop2.stop();
        loop3.stop();
      };
    } else {
      // Blue tone animations
      const auraLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAura, {
            toValue: 1,
            duration: 5200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAura, {
            toValue: 0,
            duration: 5200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const tideLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(tideDeep, {
            toValue: 1,
            duration: 12000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(tideDeep, {
            toValue: 0,
            duration: 12000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      auraLoop.start();
      tideLoop.start();

      // Start star twindles
      const starLoops = starAnims.map((anim, idx) => {
        const star = BLUE_STARS[idx];
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: star.duration,
              delay: star.delay,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: star.duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        loop.start();
        return loop;
      });

      return () => {
        auraLoop.stop();
        tideLoop.stop();
        starLoops.forEach((l) => l.stop());
      };
    }
  }, [tone, reduce, drift1, drift2, drift3, pulseAura, tideDeep, starAnims]);

  if (tone === 'blue') {
    const auraSize = Math.max(width * 1.15, 380);
    const tideSize = Math.max(width * 1.25, 420);

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Base rich deep blue background */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.blue }]} />

        {/* Floating tide deep bloom */}
        <Animated.View
          style={[
            styles.orbContainer,
            {
              left: (width - tideSize) / 2,
              bottom: -tideSize * 0.25,
              width: tideSize,
              height: tideSize,
              transform: [
                {
                  translateY: tideDeep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -35],
                  }),
                },
                {
                  scale: tideDeep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width={tideSize} height={tideSize}>
            <Defs>
              <RadialGradient id="blueTide" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#062854" stopOpacity="0.75" />
                <Stop offset="60%" stopColor="#083B7A" stopOpacity="0.3" />
                <Stop offset="100%" stopColor={colors.blue} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={tideSize / 2} cy={tideSize / 2} r={tideSize / 2} fill="url(#blueTide)" />
          </Svg>
        </Animated.View>

        {/* Central breathing sanctuary aura (behind sleeping brain & timer) */}
        <Animated.View
          style={[
            styles.orbContainer,
            {
              left: (width - auraSize) / 2,
              top: height * 0.1,
              width: auraSize,
              height: auraSize,
              transform: [
                {
                  scale: pulseAura.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1.12],
                  }),
                },
                {
                  translateY: pulseAura.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
              opacity: pulseAura.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ]}
        >
          <Svg width={auraSize} height={auraSize}>
            <Defs>
              <RadialGradient id="auraGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#93C5FD" stopOpacity="0.38" />
                <Stop offset="45%" stopColor="#3B82F6" stopOpacity="0.18" />
                <Stop offset="100%" stopColor={colors.blue} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={auraSize / 2} cy={auraSize / 2} r={auraSize / 2} fill="url(#auraGlow)" />
          </Svg>
        </Animated.View>

        {/* Starlight tranquility particles */}
        {BLUE_STARS.map((star, idx) => {
          const anim = starAnims[idx];
          return (
            <Animated.View
              key={idx}
              style={[
                styles.star,
                {
                  left: star.x * width,
                  top: star.y * height,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.85],
                  }),
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  // Light tone: warm serene cream canvas with soft organic pastel orbs
  const pinkSize = Math.max(width * 0.92, 340);
  const blueSize = Math.max(width * 0.96, 360);
  const honeySize = Math.max(width * 0.85, 310);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base warm cream background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cream }]} />

      {/* Top-right floating blush pink orb */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            right: -pinkSize * 0.22,
            top: -pinkSize * 0.15,
            width: pinkSize,
            height: pinkSize,
            transform: [
              {
                translateX: drift1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -28],
                }),
              },
              {
                translateY: drift1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 32],
                }),
              },
              {
                scale: drift1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.14],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={pinkSize} height={pinkSize}>
          <Defs>
            <RadialGradient id="pinkOrb" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#F9CCD0" stopOpacity="0.6" />
              <Stop offset="55%" stopColor="#FDF2F2" stopOpacity="0.25" />
              <Stop offset="100%" stopColor={colors.cream} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={pinkSize / 2} cy={pinkSize / 2} r={pinkSize / 2} fill="url(#pinkOrb)" />
        </Svg>
      </Animated.View>

      {/* Mid-left floating serene sky blue orb */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            left: -blueSize * 0.26,
            top: height * 0.32,
            width: blueSize,
            height: blueSize,
            transform: [
              {
                translateX: drift2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 34],
                }),
              },
              {
                translateY: drift2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -28],
                }),
              },
              {
                scale: drift2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={blueSize} height={blueSize}>
          <Defs>
            <RadialGradient id="blueOrb" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.5" />
              <Stop offset="55%" stopColor="#EFF6FF" stopOpacity="0.22" />
              <Stop offset="100%" stopColor={colors.cream} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={blueSize / 2} cy={blueSize / 2} r={blueSize / 2} fill="url(#blueOrb)" />
        </Svg>
      </Animated.View>

      {/* Bottom-right floating warm honey peach glow */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            right: -honeySize * 0.18,
            bottom: -honeySize * 0.12,
            width: honeySize,
            height: honeySize,
            transform: [
              {
                translateX: drift3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -22],
                }),
              },
              {
                translateY: drift3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                scale: drift3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1.08],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={honeySize} height={honeySize}>
          <Defs>
            <RadialGradient id="honeyOrb" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
              <Stop offset="55%" stopColor="#FEF3C7" stopOpacity="0.18" />
              <Stop offset="100%" stopColor={colors.cream} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={honeySize / 2} cy={honeySize / 2} r={honeySize / 2} fill="url(#honeyOrb)" />
        </Svg>
      </Animated.View>

      {/* Decorative accent geometry for modern art direction */}
      <View
        style={[
          styles.accentRing,
          {
            top: insetsTopOrFallback(height, 0.14),
            left: 28,
          },
        ]}
      />
      <View
        style={[
          styles.accentDot,
          {
            top: height * 0.52,
            right: 32,
          },
        ]}
      />
      <View
        style={[
          styles.accentCross,
          {
            bottom: height * 0.18,
            left: 36,
          },
        ]}
      >
        <View style={styles.crossH} />
        <View style={styles.crossV} />
      </View>
    </View>
  );
}

function insetsTopOrFallback(height: number, ratio: number) {
  return Math.round(height * ratio);
}

const styles = StyleSheet.create({
  orbContainer: {
    position: 'absolute',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  accentRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(242, 174, 177, 0.35)',
  },
  accentDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(10, 92, 196, 0.2)',
  },
  accentCross: {
    position: 'absolute',
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.25,
  },
  crossH: {
    position: 'absolute',
    width: 10,
    height: 1.5,
    backgroundColor: colors.inkMuted,
    borderRadius: 1,
  },
  crossV: {
    position: 'absolute',
    width: 1.5,
    height: 10,
    backgroundColor: colors.inkMuted,
    borderRadius: 1,
  },
});
