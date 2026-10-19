import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
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
import { colors, radius, spacing, type, fonts } from '../theme';

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
        { text: 'Lock in', style: 'destructive', onPress: () => void begin(option.durationMs) },
      ]
    );
  };

  if (!loaded || onboarded === null) return <Screen>{null}</Screen>;
  if (commitment) return <Redirect href="/commitment" />;
  if (!onboarded) return <Redirect href="/onboarding" />;

  const count = selectedPackages.length;
  const canStart = granted === true && count > 0 && !starting;
  const unplugged = granted === false;
  const selectedDuration = DURATION_OPTIONS.find((o) => o.id === durationId)?.label ?? '1 hour';

  return (
    <Screen scroll>
      {/* Top Header & Brand Anchor */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <BrainFigure pose="awake" size={30} />
          </View>
          <Text style={styles.brandTitle}>FreeUrBrain</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, unplugged ? styles.dotDanger : styles.dotActive]} />
          <Text style={styles.statusPillText}>{unplugged ? 'Action Needed' : 'Ready'}</Text>
        </View>
      </View>

      {/* Hero: Mascot Staging with Organic Layering */}
      <FadeSlideIn>
        <View style={[styles.heroStage, unplugged && styles.heroStageWarning]}>
          <View style={styles.heroCopy}>
            <View style={styles.badgeWrap}>
              <Text style={styles.eyebrow}>
                {unplugged ? 'SETUP REQUIRED' : 'QUIET SANCTUARY'}
              </Text>
            </View>
            <Text style={styles.heroHeadline}>
              {unplugged ? 'Re-plug your attention filter.' : 'Give your mind room to breathe.'}
            </Text>
            <Text style={styles.heroSubhead}>
              {unplugged
                ? 'Enable Accessibility below so FreeUrBrain can shield your apps.'
                : 'Choose what pulls you away, lock it in, and focus freely.'}
            </Text>
          </View>

          <View style={styles.mascotAnchor}>
            <Breathing>
              <BrainFigure pose={unplugged ? 'unplugged' : 'awake'} size={144} />
            </Breathing>
          </View>
        </View>
      </FadeSlideIn>

      {/* Permission Warning Callout */}
      {unplugged && (
        <FadeSlideIn delay={50}>
          <View style={styles.alertBanner}>
            <View style={styles.alertIconBubble}>
              <Icon name="plug" size={20} color={colors.danger} strokeWidth={2.5} />
            </View>
            <View style={styles.alertText}>
              <Text style={styles.alertHeading}>Accessibility access is disabled</Text>
              <Text style={styles.alertBody}>
                FreeUrBrain needs permission to safely send you back home when blocked apps open.
              </Text>
              <View style={styles.alertAction}>
                <Button
                  label="Enable Access Now"
                  variant="danger"
                  onPress={AppBlocker.requestPermission}
                />
              </View>
            </View>
          </View>
        </FadeSlideIn>
      )}

      {/* Section 1: Target Apps */}
      <FadeSlideIn delay={100}>
        <View style={styles.interactiveCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconTitleRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={styles.cardHeading}>Apps to Block</Text>
            </View>
            {count > 0 && (
              <Pressable
                onPress={() => router.push('/apps')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Edit apps"
              >
                <Text style={styles.inlineAction}>Edit apps</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.selectionRow, pressed && styles.rowPressed]}
            onPress={() => router.push('/apps')}
            accessibilityRole="button"
            accessibilityLabel={count === 0 ? 'Choose apps to block' : `${count} apps selected. Tap to change.`}
          >
            {count > 0 ? (
              <AppIconStack items={stackItems} icons={icons} max={5} size={42} />
            ) : (
              <View style={styles.emptyStack}>
                <Icon name="apps" size={24} color={colors.inkFaint} />
              </View>
            )}

            <View style={styles.selectionMeta}>
              <Text style={styles.selectionTitle}>
                {count === 0 ? 'No distractions selected' : `${count} ${count === 1 ? 'app' : 'apps'} chosen`}
              </Text>
              <Text style={styles.selectionHint}>
                {count === 0 ? 'Tap here to pick tempting apps' : 'Protected as soon as you start'}
              </Text>
            </View>

            <View style={styles.chevronWrap}>
              <Icon name="arrowRight" size={18} color={colors.inkFaint} />
            </View>
          </Pressable>

          {count === 0 && (
            <Button
              label="Choose Apps"
              variant="secondary"
              icon="apps"
              onPress={() => router.push('/apps')}
            />
          )}
        </View>
      </FadeSlideIn>

      {/* Section 2: Duration Selector */}
      <FadeSlideIn delay={150}>
        <View style={styles.interactiveCard}>
          <View style={styles.iconTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.cardHeading}>Commitment Length</Text>
          </View>
          <DurationSelector options={DURATION_OPTIONS} value={durationId} onChange={setDurationId} />
        </View>
      </FadeSlideIn>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Primary Action Zone */}
      <FadeSlideIn delay={200}>
        <View style={styles.actionFoot}>
          <Button
            label={
              starting
                ? 'Starting Commitment…'
                : count === 0
                ? 'Select Apps to Begin'
                : `Commit for ${selectedDuration}`
            }
            icon="lock"
            disabled={!canStart}
            onPress={confirmAndStart}
          />

          <View style={styles.promiseBox}>
            <Icon name="shield" size={22} color={colors.inkMuted} strokeWidth={2} />
            <Text style={styles.promiseText}>
              This session cannot be paused or cancelled from inside the app.
            </Text>
          </View>
        </View>
      </FadeSlideIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.pinkSoft,
    borderWidth: 1.5,
    borderColor: colors.pinkBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.success,
  },
  dotDanger: {
    backgroundColor: colors.danger,
  },
  statusPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.inkMuted,
  },

  // Hero Staging
  heroStage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(12, 27, 42, 0.08)',
  },
  heroStageWarning: {
    backgroundColor: '#FDE4E5',
  },
  heroCopy: {
    flex: 1,
    gap: 8,
    paddingRight: 6,
    zIndex: 2,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.ink,
    opacity: 0.8,
  },
  heroHeadline: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 31,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  heroSubhead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    opacity: 0.88,
  },
  mascotAnchor: {
    marginRight: -10,
    zIndex: 1,
  },

  // Warning
  alertBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  alertIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
    gap: 4,
  },
  alertHeading: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.dangerInk,
  },
  alertBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  alertAction: {
    marginTop: 8,
  },

  // Cards
  interactiveCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.md,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.pinkSoft,
    borderWidth: 1,
    borderColor: colors.pinkBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
  },
  cardHeading: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  inlineAction: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.blue,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.md,
  },
  rowPressed: {
    opacity: 0.7,
  },
  emptyStack: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.cream,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionMeta: {
    flex: 1,
    gap: 2,
  },
  selectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  selectionHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  chevronWrap: {
    paddingLeft: 4,
  },

  // Primary Action Zone
  actionFoot: {
    gap: 12,
    marginTop: 4,
    paddingBottom: spacing.sm,
  },
  promiseBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 12,
  },
  promiseText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkFaint,
    textAlign: 'center',
    flexShrink: 1,
  },
  errorBanner: {
    padding: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
});
