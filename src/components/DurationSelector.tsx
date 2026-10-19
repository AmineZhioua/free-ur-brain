import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DurationOption } from '../core/commitment/time';
import { colors, radius, type } from '../theme';

interface Props {
  options: readonly DurationOption[];
  value: string;
  onChange: (id: string) => void;
}

export function DurationSelector({ options, value, onChange }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && !selected && styles.chipPressed,
            ]}
          >
            <Text style={[type.bodyStrong, { color: selected ? colors.white : colors.ink }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.blue, borderColor: colors.blue },
  chipPressed: { backgroundColor: colors.pinkSoft, borderColor: colors.pink },
});
