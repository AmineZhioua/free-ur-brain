import { StyleSheet, Text } from 'react-native';
import { formatCountdown } from '../core/commitment/time';
import { colors } from '@/theme';

interface Props {
  /** null = unknown */
  remainingMs: number | null;
}

export function Countdown({ remainingMs }: Props) {
  return (
    <Text style={styles.timer}>
      {remainingMs === null ? '--:--:--' : formatCountdown(remainingMs)}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 56,
    fontWeight: '300',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});