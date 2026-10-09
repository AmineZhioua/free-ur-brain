import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { formatCountdown } from '../core/commitment/time';

interface Props {
  endsAt: number;
  onExpire: () => void;
}

export function Countdown({ endsAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAt - Date.now()));
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;

    // Always compute from the wall clock, so there is no drift
    // and it is correct after the app returns from the background.
    const tick = () => {
      const left = Math.max(0, endsAt - Date.now());
      setRemaining(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endsAt, onExpire]);

  return <Text style={styles.timer}>{formatCountdown(remaining)}</Text>;
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 56,
    fontWeight: '300',
    color: '#1A1A1A',
    fontVariant: ['tabular-nums'],
  },
});