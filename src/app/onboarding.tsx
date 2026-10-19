import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrainFigure, type BrainPose } from '../components/BrainFigure';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { Breathing, FadeSlideIn } from '../components/motion';
import { AppBlocker } from '../native/AppBlocker';
import { useAccessibilityStatus } from '../hooks/useAccessibilityStatus';
import { markOnboardingDone } from '../core/onboarding/onboarding';
import { colors, radius, spacing, type } from '../theme';

async function openBatterySettings() {
  try {
    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch {
    await Linking.openSettings();
  }
}

const HOW_IT_WORKS = [
  'Choose the apps that pull you away.',
  'Choose how long you want to stay away.',
  'Start. Those apps are blocked until the time is up.',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { granted } = useAccessibilityStatus();
  const [step, setStep] = useState(0);

  const finish = async () => {
    await markOnboardingDone();
    router.replace('/');
  };

  const pose: BrainPose = step === 0 ? 'awake' : step === 1 ? (granted ? 'happy' : 'unplugged') : 'asleep';

  const footer =
    step === 0 ? (
      <Button label="Continue" icon="arrowRight" onPress={() => setStep(1)} />
    ) : step === 1 ? (
      <>
        {!granted && <Button label="Enable Accessibility" onPress={AppBlocker.requestPermission} />}
        <Button
          label="Continue"
          icon="arrowRight"
          variant={granted ? 'primary' : 'secondary'}
          onPress={() => setStep(2)}
        />
        {!granted && (
          <Text style={styles.small}>
            You can enable it later, but a commitment can't start without it.
          </Text>
        )}
      </>
    ) : (
      <Button label="Get started" icon="arrowRight" onPress={finish} />
    );

  return (
    <Screen scroll footer={footer}>
      <View style={styles.progress} accessibilityLabel={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.segment, i <= step && styles.segmentOn]} />
        ))}
      </View>

      <FadeSlideIn key={step} style={styles.stepBody}>
        <View style={styles.figure}>
          <Breathing>
            <BrainFigure pose={pose} size={step === 0 ? 190 : 150} />
          </Breathing>
        </View>

        {step === 0 && (
          <>
            <Text style={styles.title}>FreeUrBrain</Text>
            <Text style={styles.lead}>
              You don't need more stimulation. You need freedom from it.
            </Text>
            <View style={styles.block}>
              {HOW_IT_WORKS.map((text, i) => (
                <View key={text} style={styles.numberRow}>
                  <View style={styles.numberDot}>
                    <Text style={styles.number}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.body, styles.numberText]}>{text}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.body}>
              It's a promise to yourself: once a commitment starts, it cannot be cancelled
              from inside the app.
            </Text>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>Why Accessibility access?</Text>
            <Text style={styles.body}>
              Android gives apps no other way to know which app is on your screen. FreeUrBrain
              uses an Accessibility service only to see the name of the app that comes to the
              foreground, so it can send you back home when it's one you blocked.
            </Text>
            <Text style={styles.body}>
              It does not read what is on your screen, what you type or your messages. It has
              no accounts, no analytics and no servers, and your choices stay on this device.
            </Text>
            <Text style={styles.body}>
              Accessibility is a powerful Android permission, so you stay in control: you can
              turn it off at any time in Android settings.
            </Text>
            {granted && (
              <View style={styles.okRow}>
                <Icon name="shield" size={22} color={colors.success} />
                <Text style={styles.ok}>Accessibility access is on.</Text>
              </View>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Keep it running</Text>
            <Text style={styles.body}>
              Some phones stop background services to save battery. If blocking ever stops
              working, allow FreeUrBrain to run without battery restrictions.
            </Text>
            <Button
              label="Open battery settings"
              icon="battery"
              variant="secondary"
              onPress={openBatterySettings}
            />

            <View style={styles.goodToKnow}>
              <Text style={styles.heading}>Good to know</Text>
              <Text style={styles.body}>
                FreeUrBrain is a personal commitment tool, not a lock. Turning off Accessibility,
                force-stopping or uninstalling the app ends the blocking. It works because you
                chose it. The timer also doesn't count the time your phone is switched off.
              </Text>
            </View>
          </>
        )}
      </FadeSlideIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.line },
  segmentOn: { backgroundColor: colors.blue },
  stepBody: { gap: spacing.md },
  figure: {
    alignItems: 'center',
    backgroundColor: colors.pinkSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
  },
  title: { ...type.title, color: colors.ink },
  lead: { ...type.lead, color: colors.inkMuted },
  heading: { ...type.heading, color: colors.ink },
  body: { ...type.body, color: colors.inkMuted },
  small: { ...type.caption, color: colors.inkFaint, textAlign: 'center' },
  block: { gap: 12 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  numberDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { ...type.bodyStrong, color: colors.ink },
  numberText: { flex: 1 },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ok: { ...type.bodyStrong, color: colors.success },
  goodToKnow: {
    backgroundColor: colors.blueSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
