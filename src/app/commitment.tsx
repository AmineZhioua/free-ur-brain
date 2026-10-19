import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { AppIcon } from '../components/AppIcon';
import { BrainFigure } from '../components/BrainFigure';
import { Button } from '../components/Button';
import { Countdown } from '../components/Countdown';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { Breathing, FadeSlideIn } from '../components/motion';
import { clearExpiredCommitment } from '../core/commitment/CommitmentManager';
import { describeDuration, describeInterruption } from '../core/commitment/time';
import { useAccessibilityStatus } from '../hooks/useAccessibilityStatus';
import { useAppIcons } from '../hooks/useAppIcons';
import { useCommitment } from '../hooks/useCommitment';
import { useLapseSummary } from '../hooks/useLapseSummary';
import { useRemainingTime } from '../hooks/useRemainingTime';
import { AppBlocker } from '../native/AppBlocker';
import { colors, radius, spacing, type } from '../theme';

export default function CommitmentScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();
  const { granted } = useAccessibilityStatus();
  const icons = useAppIcons();
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
      <Screen scroll style={styles.completeContent}>
        <FadeSlideIn>
          <View style={styles.completeFigure}>
            <BrainFigure pose="happy" size={200} />
          </View>
        </FadeSlideIn>
        <FadeSlideIn delay={80} style={styles.completeText}>
          <Text style={styles.completeTitle}>Commitment complete.</Text>
          {message && <Text style={styles.completeBody}>{message}</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
        </FadeSlideIn>
        <Button label="Start Another Commitment" icon="arrowRight" onPress={startAnother} />
      </Screen>
    );
  }

  const hadLapse = summary !== null && summary.count > 0;

  return (
    <Screen scroll tone="blue">
      <Text style={styles.label}>COMMITMENT ACTIVE</Text>

      <View style={styles.timerBlock}>
        <Breathing>
          <BrainFigure pose="asleep" size={176} />
        </Breathing>
        <Countdown remainingMs={remainingMs} />
        <Text style={styles.timerCaption}>left until your apps open again</Text>
      </View>

      {granted === false && (
        <View style={styles.warning}>
          <View style={styles.warningHead}>
            <Icon name="plug" size={22} color={colors.danger} />
            <Text style={styles.warningTitle}>Blocking is not active</Text>
          </View>
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

      <View style={styles.apps}>
        <Text style={styles.appsLabel}>BLOCKED APPS</Text>
        <View style={styles.grid}>
          {commitment.packageNames.map((p) => {
            const label = commitment.labels[p] ?? p;
            return (
              <View key={p} style={styles.tile}>
                <AppIcon uri={icons.get(p)} label={label} size={52} />
                <Text style={styles.tileLabel} numberOfLines={2}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footerNotes}>
        <View style={styles.lockRow}>
          <Icon name="lock" size={18} color={colors.onBlue} />
          <Text style={styles.note}>Your commitment cannot be cancelled until the timer expires.</Text>
        </View>
        <Text style={styles.smallNote}>
          The timer follows the phone's own running time, not its date and time settings.
          Time while the phone is switched off doesn't count.
        </Text>
        <Text style={styles.encouragement}>Keep going.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Active
  label: { ...type.label, color: colors.onBlueMuted, textAlign: 'center' },
  timerBlock: { alignItems: 'center', gap: spacing.sm },
  timerCaption: { ...type.small, color: colors.onBlueMuted },
  apps: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  appsLabel: { ...type.label, color: colors.inkFaint },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { width: 72, alignItems: 'center', gap: 6 },
  tileLabel: { ...type.caption, color: colors.ink, textAlign: 'center' },
  footerNotes: { gap: spacing.sm, alignItems: 'center' },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  note: { ...type.small, color: colors.onBlue, flexShrink: 1 },
  smallNote: { ...type.caption, color: colors.onBlueMuted, textAlign: 'center' },
  encouragement: { ...type.heading, color: colors.onBlue, marginTop: spacing.sm },
  lapseNote: { ...type.small, color: colors.onBlueMuted, textAlign: 'center' },
  warning: {
    backgroundColor: colors.pinkSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  warningHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  warningTitle: { ...type.bodyStrong, color: colors.dangerInk, flexShrink: 1 },
  warningBody: { ...type.small, color: colors.ink },

  // Complete
  completeContent: { justifyContent: 'center', gap: spacing.lg },
  completeFigure: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
  },
  completeText: { gap: spacing.sm },
  completeTitle: { ...type.hero, color: colors.ink },
  completeBody: { ...type.lead, color: colors.inkMuted },
  error: { ...type.small, color: colors.danger },
});
