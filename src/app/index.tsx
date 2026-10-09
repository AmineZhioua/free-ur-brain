import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppBlocker } from '@/native/AppBlocker';
import { loadSelectedPackages } from '@/core/selection/selection';


export default function HomeScreen() {
  const router = useRouter();
  const [granted, setGranted] = useState<boolean | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const refreshPermission = useCallback(async () => {
    setGranted(await AppBlocker.isPermissionGranted());
  }, []);

  useEffect(() => {
    refreshPermission();
    // Re-check when the user comes back from Android settings.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermission();
    });
    return () => sub.remove();
  }, [refreshPermission]);

  // Reload the saved selection every time this screen regains focus
  // (e.g. coming back from the app-selection screen).
  useFocusEffect(
    useCallback(() => {
      loadSelectedPackages().then((packages) => setSelectedCount(packages.length));
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FreeUrBrain</Text>
      <Text style={styles.subtitle}>Take back control of your attention.</Text>

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

      {granted === true && (
        <Text style={styles.status}>
          Accessibility enabled. (Test build: YouTube is hard-coded as blocked.)
        </Text>
      )}

      <Text style={styles.selection}>
        {selectedCount === 0
          ? 'No apps selected.'
          : `${selectedCount} ${selectedCount === 1 ? 'app' : 'apps'} selected.`}
      </Text>

      <Pressable style={[styles.button, styles.secondary]} onPress={() => router.push('/apps')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>
          {selectedCount === 0 ? 'Choose Apps' : 'Change Apps'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#555' },
  status: { fontSize: 14, color: '#2E7D32' },
  selection: { fontSize: 16, color: '#1A1A1A' },
  card: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 16, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  cardBody: { fontSize: 14, color: '#555', lineHeight: 20 },
  button: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1A1A1A' },
  secondaryText: { color: '#1A1A1A' },
});