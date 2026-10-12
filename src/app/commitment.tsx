import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useCommitment } from '@/hooks/useCommitment';
import { useCallback, useEffect, useState } from 'react';
import { clearExpiredCommitment } from '@/core/commitment/CommitmentManager';
import { describeDuration, describeInterruption } from '@/core/commitment/time';
import { Countdown } from '@/components/Countdown';
import { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';
import { AppBlocker } from '@/native/AppBlocker';
import { colors, spacing } from '@/theme';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useLapseSummary } from '@/hooks/useLapseSummary';
import { useRemainingTime } from '@/hooks/useRemainingTime';


export default function CommitmentScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();
  const { granted } = useAccessibilityStatus();
  const commitmentId = commitment?.id ?? null;
  const remainingMs = useRemainingTime(commitmentId);
  const { summary, ready, refresh } = useLapseSummary(commitmentId);
  const [error, setError] = useState<string | null>(null);

  const expired = remainingMs === 0;

  // An open interruption is counted until the end, so re-read when the timer ends.
  useEffect(() => {
    if (expired) void refresh();
  }, [expired, refresh]);

  if (!loaded) return <Screen>{null}</Screen>;
  if (!commitment) return <Redirect href="/" />;

  if (expired) {
    const startAnother = async () => {
      try {
        await clearExpiredCommitment();
        router.replace('/');
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    };

    let message: string | null = null;
    if (ready) {
      if (summary === null) {
        message = 'The timer has ended.';
      } else if (summary.count === 0) {
        message = `You stayed away for ${describeDuration(commitment.durationMs)}.`;
      } else {
        const times = summary.count === 1 ? 'once' : `${summary.count} times`;
        message =
          `The time is up, but Accessibility was turned off during this commitment: ` +
          `blocking was interrupted ${times}, for about ${describeInterruption(summary.totalMs)} ` +
          `in total, so your apps weren't protected the whole time.`;
      }
    }

    return (
      <Screen style={styles.center}>
        <Text style={styles.title}>Commitment complete.</Text>
        {message && <Text style={styles.body}>{message}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label="Start Another Commitment" onPress={startAnother} />
      </Screen>
    );
  }

  const hadLapse = summary !== null && summary.count > 0;

  return (
    <Screen>
      <Text style={styles.label}>COMMITMENT ACTIVE</Text>
      <Countdown remainingMs={remainingMs} />

      {granted === false && (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Blocking is not active</Text>
          <Text style={styles.warningBody}>
            Accessibility access is turned off, so FreeUrBrain cannot block your apps right
            now. Your timer is still running. Turn Accessibility back on to resume blocking.
          </Text>
          <Button
            label="Open Accessibility settings"
            variant="danger"
            onPress={AppBlocker.requestPermission}
          />
        </View>
      )}

      {granted !== false && hadLapse && (
        <Text style={styles.lapseNote}>
          Blocking was off earlier in this commitment, for about{' '}
          {describeInterruption(summary!.totalMs)}.
        </Text>
      )}

      <Text style={styles.heading}>Blocked apps</Text>
      <ScrollView style={styles.list}>
        {commitment.packageNames.map((p) => (
          <Text key={p} style={styles.app}>
            {commitment.labels[p] ?? p}
          </Text>
        ))}
      </ScrollView>

      <Text style={styles.note}>Your commitment cannot be cancelled until the timer expires.</Text>
      <Text style={styles.smallNote}>
        The timer follows the phone's own running time, not its date and time settings.
        Time while the phone is switched off doesn't count.
      </Text>
      <Text style={styles.encouragement}>Keep going.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  label: { fontSize: 14, letterSpacing: 2, color: colors.textFaint },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  body: { fontSize: 18, color: colors.textMuted, lineHeight: 26 },
  heading: { fontSize: 14, color: colors.textFaint, marginTop: spacing.sm },
  list: { flex: 1 },
  app: { fontSize: 18, color: colors.text, paddingVertical: 6 },
  note: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  smallNote: { fontSize: 12, color: colors.textFaint, textAlign: 'center' },
  lapseNote: { fontSize: 14, color: colors.textMuted },
  encouragement: { fontSize: 16, color: colors.text, textAlign: 'center', fontWeight: '600' },
  error: { color: colors.danger },
  warning: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  warningTitle: { fontSize: 16, fontWeight: '700', color: colors.danger },
  warningBody: { fontSize: 14, color: colors.dangerText, lineHeight: 20 },
});