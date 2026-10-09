import {
  useCallback, useEffect, useState
} from 'react';
import {
  Alert, AppState, Pressable, ScrollView, StyleSheet, Text, View
} from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { AppBlocker } from '@/native/AppBlocker';
import { loadSelectedPackages } from '@/core/selection/selection';
import { useCommitment } from '@/hooks/useCommitment';
import { startCommitment } from '@/core/commitment/CommitmentManager';
import { describeDuration, DURATION_OPTIONS } from '@/core/commitment/time';
import { DurationSelector } from '@/components/DurationSelector';


export default function HomeScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();

  const [granted, setGranted] = useState<boolean | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [durationId, setDurationId] = useState('1h');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPermission = useCallback(async () => {
    setGranted(await AppBlocker.isPermissionGranted());
  }, []);

  useEffect(() => {
    void refreshPermission();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPermission();
    });
    return () => sub.remove();
  }, [refreshPermission]);

  useFocusEffect(
    useCallback(() => {
      void loadSelectedPackages().then(setSelectedPackages);
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

  if (!loaded) return <View style={styles.container} />;
  if (commitment) return <Redirect href="/commitment" />;

  const count = selectedPackages.length;
  const canStart = granted === true && count > 0 && !starting;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FreeUrBrain</Text>
      <Text style={styles.subtitle}>Take back control of your attention.</Text>
      <Text style={styles.status}>No active commitment.</Text>

      {granted === false && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accessibility access required</Text>
          <Text style={styles.cardBody}>
            FreeUrBrain needs Accessibility access to detect when a blocked app
            is opened. Your blocking data stays on your device.
          </Text>
          <Pressable style={styles.button} onPress={AppBlocker.requestPermission}>
            <Text style={styles.buttonText}>Enable Accessibility</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.selection}>
        {count === 0 ? 'No apps selected.' : `${count} ${count === 1 ? 'app' : 'apps'} selected.`}
      </Text>

      <Pressable style={[styles.button, styles.secondary]} onPress={() => router.push('/apps')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>
          {count === 0 ? 'Choose Apps' : 'Change Apps'}
        </Text>
      </Pressable>

      <DurationSelector options={DURATION_OPTIONS} value={durationId} onChange={setDurationId} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.button, !canStart && styles.buttonDisabled]}
        disabled={!canStart}
        onPress={confirmAndStart}
      >
        <Text style={styles.buttonText}>{starting ? 'Starting…' : 'Start Commitment'}</Text>
      </Pressable>

      <Text style={styles.note}>This commitment cannot be cancelled until the timer expires.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 64, justifyContent: 'center', gap: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#555' },
  status: { fontSize: 14, color: '#888' },
  selection: { fontSize: 16, color: '#1A1A1A' },
  error: { color: '#B00020' },
  note: { fontSize: 13, color: '#888', textAlign: 'center' },
  card: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 16, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  cardBody: { fontSize: 14, color: '#555', lineHeight: 20 },
  button: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#BDBDBD' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1A1A1A' },
  secondaryText: { color: '#1A1A1A' },
});