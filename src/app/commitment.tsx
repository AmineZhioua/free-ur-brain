import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function CommitmentScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>COMMITMENT ACTIVE</Text>
      <Text style={styles.timer}>00:57:32</Text>
      <Text style={styles.body}>
        Placeholder. The real countdown arrives in Milestone 5.
      </Text>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back (dev only)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  label: { fontSize: 14, letterSpacing: 2, color: '#888' },
  timer: { fontSize: 56, fontWeight: '300', color: '#1A1A1A' },
  body: { fontSize: 16, color: '#555' },
  button: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});