import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';
import { motion } from '../theme';

/** True when the user asked Android to reduce animations. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduce(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduce;
}

interface FadeProps {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Short fade and rise when a block first appears. */
export function FadeSlideIn({ children, delay = 0, style }: FadeProps) {
  const reduce = useReduceMotion();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      value.setValue(1);
      return;
    }
    Animated.timing(value, {
      toValue: 1,
      duration: motion.base,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduce, delay, value]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Slow breathing loop for the brain. Static when reduce-motion is on. */
export function Breathing({ children }: { children: ReactNode }) {
  const reduce = useReduceMotion();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      value.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: motion.breathe,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: motion.breathe,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, value]);

  return (
    <Animated.View
      style={{
        transform: [
          { scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) },
          { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Small pop used when something becomes selected. */
export function Pop({ active, children }: { active: boolean; children: ReactNode }) {
  const reduce = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce || !active) return;
    scale.setValue(0.8);
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
  }, [active, reduce, scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}
