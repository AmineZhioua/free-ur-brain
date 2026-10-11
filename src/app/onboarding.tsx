import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';
import { markOnboardingDone } from '@/core/onboarding/onboarding';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { AppBlocker } from '@/native/AppBlocker';
import { colors, spacing } from '@/theme';


async function openBatterySettings() {
  try {
    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch {
    await Linking.openSettings();
  }
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { granted } = useAccessibilityStatus();
  const [step, setStep] = useState(0);

  const finish = async () => {
    await markOnboardingDone();
    router.replace('/');
  };

  return (
    <Screen scroll>
      <Text style={styles.step}>{step + 1} / 3</Text>

      {step === 0 && (
        <>
          <Text style={styles.title}>FreeUrBrain</Text>
          <Text style={styles.lead}>
            You don't need more stimulation. You need freedom from it.
          </Text>
          <View style={styles.block}>
            <Text style={styles.body}>1. Choose the apps that pull you away.</Text>
            <Text style={styles.body}>2. Choose how long you want to stay away.</Text>
            <Text style={styles.body}>3. Start. Those apps are blocked until the time is up.</Text>
          </View>
          <Text style={styles.body}>
            It's a promise to yourself: once a commitment starts, it cannot be cancelled
            from inside the app.
          </Text>
          <Button label="Continue" onPress={() => setStep(1)} />
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

          {granted ? (
            <Text style={styles.ok}>Accessibility access is on.</Text>
          ) : (
            <Button label="Enable Accessibility" onPress={AppBlocker.requestPermission} />
          )}
          <Button
            label="Continue"
            variant={granted ? 'primary' : 'secondary'}
            onPress={() => setStep(2)}
          />
          {!granted && (
            <Text style={styles.small}>
              You can enable it later, but a commitment can't start without it.
            </Text>
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
          <Button label="Open battery settings" variant="secondary" onPress={openBatterySettings} />

          <Text style={styles.heading}>Good to know</Text>
          <Text style={styles.body}>
            FreeUrBrain is a personal commitment tool, not a lock. Turning off Accessibility,
            force-stopping or uninstalling the app ends the blocking. It works because you
            chose it.
          </Text>
          <Button label="Get started" onPress={finish} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 13, color: colors.textFaint, letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  lead: { fontSize: 18, color: colors.textMuted, lineHeight: 26 },
  heading: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  body: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  small: { fontSize: 13, color: colors.textFaint },
  ok: { fontSize: 16, color: colors.success, fontWeight: '600' },
  block: { gap: spacing.sm },
});