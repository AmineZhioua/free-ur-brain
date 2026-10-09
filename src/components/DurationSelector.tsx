import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DurationOption } from '../core/commitment/time';

interface Props {
  options: readonly DurationOption[];
  value: string;
  onChange: (id: string) => void;
}

export function DurationSelector({ options, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Duration</Text>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            style={styles.row}
            onPress={() => onChange(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.dot} />}
            </View>
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  heading: { fontSize: 14, color: '#888', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#1A1A1A' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1A1A1A' },
  label: { fontSize: 16, color: '#1A1A1A' },
});