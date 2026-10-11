import {
  useCallback, useState
} from 'react';
import {
  Alert, StyleSheet, Text, View
} from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { AppBlocker } from '@/native/AppBlocker';
import { loadSelectedPackages } from '@/core/selection/selection';
import { useCommitment } from '@/hooks/useCommitment';
import { startCommitment } from '@/core/commitment/CommitmentManager';
import { describeDuration, DURATION_OPTIONS } from '@/core/commitment/time';
import { DurationSelector } from '@/components/DurationSelector';
import { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/theme';
import { isOnboardingDone } from '@/core/onboarding/onboarding';


export default function HomeScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();
  const { granted } = useAccessibilityStatus();

  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [durationId, setDurationId] = useState('1h');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadSelectedPackages().then(setSelectedPackages);
      void isOnboardingDone().then(setOnboarded);
    }, [])
  );

  const begin = async (durationMs: number) => {
    setStarting(true);
    setError(null);
    try {
      // Resolve display names and drop apps that were uninstalled since selection.
      const installed = await AppBlocker.getInstalledApps();
      const labelByPackage = new Map(installed.map((a) => [a.packageName, a.label]));
      const packageNames = selectedPackages.filter((p) => labelByPackage.has(p));

      if (packageNames.length === 0) {
        setError('The apps you selected are no longer installed. Please choose apps again.');
        setStarting(false);
        return;
      }

      const labels = Object.fromEntries(packageNames.map((p) => [p, labelByPackage.get(p)!]));

      await startCommitment({ packageNames, labels, durationMs });
      router.replace('/commitment');
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setStarting(false);
    }
  };

  const confirmAndStart = () => {
    const option = DURATION_OPTIONS.find((o) => o.id === durationId);
    if (!option) return;

    Alert.alert(
      'Start commitment?',
      `Your selected apps will be blocked for ${describeDuration(option.durationMs)}. ` +
        'This commitment cannot be cancelled until the timer expires.',
      [
        { text: 'Not yet', style: 'cancel' },
        { text: 'Start', style: 'destructive', onPress: () => void begin(option.durationMs) },
      ]
    );
  };

  if (!loaded || onboarded === null) return <Screen>{null}</Screen>;
  if (commitment) return <Redirect href="/commitment" />;
  if (!onboarded) return <Redirect href="/onboarding" />;

  const count = selectedPackages.length;
  const canStart = granted === true && count > 0 && !starting;

  return (
    <Screen scroll>
      <Text style={styles.title}>FreeUrBrain</Text>
      <Text style={styles.subtitle}>Take back control of your attention.</Text>
      <Text style={styles.status}>No active commitment.</Text>

      {granted === false && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accessibility access required</Text>
          <Text style={styles.cardBody}>
            FreeUrBrain needs Accessibility access to detect when a blocked app is opened.
            Your blocking data stays on your device.
          </Text>
          <Button label="Enable Accessibility" onPress={AppBlocker.requestPermission} />
        </View>
      )}

      <Text style={styles.selection}>
        {count === 0 ? 'No apps selected.' : `${count} ${count === 1 ? 'app' : 'apps'} selected.`}
      </Text>
      <Button
        label={count === 0 ? 'Choose Apps' : 'Change Apps'}
        variant="secondary"
        onPress={() => router.push('/apps')}
      />

      <DurationSelector options={DURATION_OPTIONS} value={durationId} onChange={setDurationId} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label={starting ? 'Starting…' : 'Start Commitment'}
        disabled={!canStart}
        onPress={confirmAndStart}
      />
      <Text style={styles.note}>This commitment cannot be cancelled until the timer expires.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textMuted },
  status: { fontSize: 14, color: colors.textFaint },
  selection: { fontSize: 16, color: colors.text },
  error: { color: colors.danger },
  note: { fontSize: 13, color: colors.textFaint, textAlign: 'center' },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  cardBody: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});