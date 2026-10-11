import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useCommitment } from '@/hooks/useCommitment';
import { useCallback, useState } from 'react';
import { clearExpiredCommitment } from '@/core/commitment/CommitmentManager';
import { describeDuration } from '@/core/commitment/time';
import { Countdown } from '@/components/Countdown';
import { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';
import { AppBlocker } from '@/native/AppBlocker';


export default function CommitmentScreen() {
  const router = useRouter();
  const { commitment, loaded } = useCommitment();
  const { granted } = useAccessibilityStatus();
  const [expiredNow, setExpiredNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onExpire = useCallback(() => setExpiredNow(true), []);

  if (!loaded) return <View style={styles.container} />;
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
      <View style={styles.container}>
        <Text style={styles.title}>Commitment complete.</Text>
        <Text style={styles.body}>
          You stayed away for {describeDuration(commitment.durationMs)}.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={startAnother}>
          <Text style={styles.buttonText}>Start Another Commitment</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>COMMITMENT ACTIVE</Text>
      <Countdown endsAt={commitment.endsAt} onExpire={onExpire} />

      {granted === false && (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Blocking is not active</Text>
          <Text style={styles.warningBody}>
            Accessibility access is turned off, so FreeUrBrain cannot block your apps
            right now. Your timer is still running. Turn Accessibility back on to resume blocking.
          </Text>
          <Pressable style={styles.warningButton} onPress={AppBlocker.requestPermission}>
            <Text style={styles.buttonText}>Open Accessibility settings</Text>
          </Pressable>
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

      <Text style={styles.note}>
        Your commitment cannot be cancelled until the timer expires.
      </Text>
      <Text style={styles.encouragement}>Keep going.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 72, gap: 16 },
  label: { fontSize: 14, letterSpacing: 2, color: '#888' },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginTop: 64 },
  body: { fontSize: 18, color: '#555' },
  heading: { fontSize: 14, color: '#888', marginTop: 8 },
  list: { flex: 1 },
  app: { fontSize: 18, color: '#1A1A1A', paddingVertical: 6 },
  note: { fontSize: 14, color: '#555', textAlign: 'center' },
  encouragement: { fontSize: 16, color: '#1A1A1A', textAlign: 'center', fontWeight: '600' },
  error: { color: '#B00020' },
  warning: {
    borderWidth: 1,
    borderColor: '#B00020',
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#B00020' },
  warningBody: { fontSize: 14, color: '#5F2120', lineHeight: 20 },
  warningButton: {
    backgroundColor: '#B00020',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});