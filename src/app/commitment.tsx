import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useCommitment } from '@/hooks/useCommitment';
import { useCallback, useState } from 'react';
import { clearExpiredCommitment } from '@/core/commitment/CommitmentManager';
import { describeDuration } from '@/core/commitment/time';
import { Countdown } from '@/components/Countdown';
import { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';
import { AppBlocker } from '@/native/AppBlocker';
import { colors, spacing } from '@/theme';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';


export default function CommitmentScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();
  const { granted } = useAccessibilityStatus();
  const [expiredNow, setExpiredNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onExpire = useCallback(() => setExpiredNow(true), []);

  if (!loaded) return <Screen>{null}</Screen>;
  if (!commitment) return <Redirect href="/" />;

  const expired = expiredNow || Date.now() >= commitment.endsAt;

  if (expired) {
    const startAnother = async () => {
      try {
        await clearExpiredCommitment();
        router.replace('/');
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    };

    return (
      <Screen style={styles.center}>
        <Text style={styles.title}>Commitment complete.</Text>
        <Text style={styles.body}>
          You stayed away for {describeDuration(commitment.durationMs)}.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label="Start Another Commitment" onPress={startAnother} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.label}>COMMITMENT ACTIVE</Text>
      <Countdown endsAt={commitment.endsAt} onExpire={onExpire} />

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

      <Text style={styles.heading}>Blocked apps</Text>
      <ScrollView style={styles.list}>
        {commitment.packageNames.map((p) => (
          <Text key={p} style={styles.app}>
            {commitment.labels[p] ?? p}
          </Text>
        ))}
      </ScrollView>

      <Text style={styles.note}>Your commitment cannot be cancelled until the timer expires.</Text>
      <Text style={styles.encouragement}>Keep going.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  label: { fontSize: 14, letterSpacing: 2, color: colors.textFaint },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  body: { fontSize: 18, color: colors.textMuted },
  heading: { fontSize: 14, color: colors.textFaint, marginTop: spacing.sm },
  list: { flex: 1 },
  app: { fontSize: 18, color: colors.text, paddingVertical: 6 },
  note: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
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