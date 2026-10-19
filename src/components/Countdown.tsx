import { StyleSheet, Text } from 'react-native';
import { formatCountdown } from '../core/commitment/time';
import { colors, type } from '../theme';

interface Props {
  /** null = unknown */
  remainingMs: number | null;
}

export function Countdown({ remainingMs }: Props) {
  const text = remainingMs === null ? '--:--:--' : formatCountdown(remainingMs);
  return (
    <Text
      style={styles.timer}
      accessibilityRole="timer"
      accessibilityLabel={`Time left ${text}`}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    ...type.timer,
    color: colors.onBlue,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
