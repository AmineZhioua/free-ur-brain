import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { AppBlocker } from '../native/AppBlocker';
import { loadSelectedPackages } from '../core/selection/selection';
import { startCommitment } from '../core/commitment/CommitmentManager';
import { DURATION_OPTIONS, describeDuration } from '../core/commitment/time';
import { isOnboardingDone } from '../core/onboarding/onboarding';
import { AppIconStack } from '../components/AppIconStack';
import { BrainFigure } from '../components/BrainFigure';
import { Button } from '../components/Button';
import { DurationSelector } from '../components/DurationSelector';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { Breathing, FadeSlideIn } from '../components/motion';
import { useAccessibilityStatus } from '../hooks/useAccessibilityStatus';
import { useAppIcons } from '../hooks/useAppIcons';
import { useCommitment } from '../hooks/useCommitment';
import { colors, radius, spacing, type } from '../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();
  const { granted } = useAccessibilityStatus();
  const icons = useAppIcons();

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

  const stackItems = useMemo(
    () => selectedPackages.map((p) => ({ packageName: p, label: p.split('.').pop() ?? p })),
    [selectedPackages]
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
  const unplugged = granted === false;

  return (
    <Screen scroll>
      <View style={styles.brand}>
        <BrainFigure pose="awake" size={36} />
        <Text style={styles.wordmark}>FreeUrBrain</Text>
      </View>

      <FadeSlideIn>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>NO ACTIVE COMMITMENT</Text>
            <Text style={styles.heroTitle}>
              {unplugged ? 'Blocking is unplugged.' : 'Give your brain a rest.'}
            </Text>
            <Text style={styles.heroSub}>
              {unplugged ? 'Turn on Accessibility access below.' : 'Take back control of your attention.'}
            </Text>
          </View>
          <View style={styles.heroFigure}>
            <Breathing>
              <BrainFigure pose={unplugged ? 'unplugged' : 'awake'} size={132} />
            </Breathing>
          </View>
        </View>
      </FadeSlideIn>

      {unplugged && (
        <FadeSlideIn delay={60}>
          <View style={styles.notice}>
            <View style={styles.noticeHead}>
              <Icon name="plug" size={22} color={colors.danger} />
              <Text style={styles.noticeTitle}>Accessibility access required</Text>
            </View>
            <Text style={styles.noticeBody}>
              FreeUrBrain needs Accessibility access to detect when a blocked app is opened.
              Your blocking data stays on your device.
            </Text>
            <Button label="Enable Accessibility" onPress={AppBlocker.requestPermission} />
          </View>
        </FadeSlideIn>
      )}

      <FadeSlideIn delay={100}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>APPS TO BLOCK</Text>
          <View style={styles.selectionRow}>
            {count > 0 ? (
              <AppIconStack items={stackItems} icons={icons} />
            ) : (
              <View style={styles.emptyIcon}>
                <Icon name="apps" size={22} color={colors.inkFaint} />
              </View>
            )}
            <Text style={styles.selection}>
              {count === 0 ? 'No apps selected.' : `${count} ${count === 1 ? 'app' : 'apps'} selected.`}
            </Text>
          </View>
          <Button
            label={count === 0 ? 'Choose Apps' : 'Change Apps'}
            variant="secondary"
            onPress={() => router.push('/apps')}
          />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={140}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FOR HOW LONG</Text>
          <DurationSelector options={DURATION_OPTIONS} value={durationId} onChange={setDurationId} />
        </View>
      </FadeSlideIn>

      {error && <Text style={styles.error}>{error}</Text>}

      <FadeSlideIn delay={180}>
        <View style={styles.startArea}>
          <Button
            label={starting ? 'Starting…' : 'Start Commitment'}
            icon="lock"
            disabled={!canStart}
            onPress={confirmAndStart}
          />
          <Text style={styles.note}>This commitment cannot be cancelled until the timer expires.</Text>
        </View>
      </FadeSlideIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { ...type.heading, fontSize: 20, lineHeight: 26, color: colors.ink },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radius.xl,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.lg,
    paddingRight: spacing.sm,
    overflow: 'hidden',
  },
  heroText: { flex: 1, gap: spacing.sm },
  heroLabel: { ...type.label, color: colors.ink },
  heroTitle: { ...type.title, color: colors.ink },
  heroSub: { ...type.small, color: colors.ink },
  heroFigure: { marginRight: -8 },
  notice: {
    backgroundColor: colors.pinkSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 12,
  },
  noticeHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeTitle: { ...type.bodyStrong, color: colors.dangerInk, flexShrink: 1 },
  noticeBody: { ...type.small, color: colors.ink },
  card: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 14,
  },
  sectionLabel: { ...type.label, color: colors.inkFaint },
  selectionRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selection: { ...type.bodyStrong, color: colors.ink, flexShrink: 1 },
  section: { gap: 12 },
  startArea: { gap: 10, marginTop: spacing.sm },
  error: { ...type.small, color: colors.danger },
  note: { ...type.caption, color: colors.inkFaint, textAlign: 'center' },
});
