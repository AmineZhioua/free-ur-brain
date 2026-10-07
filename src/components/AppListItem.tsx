import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { InstalledApp } from '../core/models/InstalledApp';

interface Props {
  app: InstalledApp;
  selected: boolean;
  onToggle: (packageName: string) => void;
}

function AppListItemBase({ app, selected, onToggle }: Props) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => onToggle(app.packageName)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={app.label}
    >
      <Image source={{ uri: app.icon }} style={styles.icon} />
      <Text style={styles.label} numberOfLines={1}>
        {app.label}
      </Text>
      <View style={[styles.box, selected && styles.boxSelected]}>
        {selected && <Text style={styles.check}>✓</Text>}
      </View>
    </Pressable>
  );
}

export const AppListItem = memo(AppListItemBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  icon: { width: 40, height: 40, borderRadius: 8 },
  label: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxSelected: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  check: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});