import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBlocker } from '@/native/AppBlocker';

export default function HomeScreen() {
  const router = useRouter();
  const [granted, setGranted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setGranted(await AppBlocker.isPermissionGranted());
  }, []);

  useEffect(() => {
    refresh();
    // Re-check when the user comes back from Android settings.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

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

      <Pressable style={[styles.button, styles.secondary]} onPress={() => router.push('/apps')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Choose Apps</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#555' },
  status: { fontSize: 14, color: '#2E7D32' },
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