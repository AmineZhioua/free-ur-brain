import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FreeUrBrain</Text>
      <Text style={styles.subtitle}>Take back control of your attention.</Text>
      <Text style={styles.status}>No active commitment.</Text>

      <Pressable style={styles.button} onPress={() => router.push('/apps')}>
        <Text style={styles.buttonText}>Choose Apps</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => router.push('/commitment')}
      >
        <Text style={[styles.buttonText, styles.secondaryText]}>
          Preview commitment screen
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#555' },
  status: { fontSize: 14, color: '#888', marginBottom: 24 },
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