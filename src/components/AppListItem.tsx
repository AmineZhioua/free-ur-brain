import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { InstalledApp } from '../core/models/InstalledApp';
import { AppIcon } from './AppIcon';
import { Icon } from './Icon';
import { Pop } from './motion';
import { colors, radius, type } from '../theme';

interface Props {
  app: InstalledApp;
  selected: boolean;
  onToggle: (packageName: string) => void;
}

function AppListItemBase({ app, selected, onToggle }: Props) {
  return (
    <Pressable
      onPress={() => onToggle(app.packageName)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={app.label}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}
    >
      <AppIcon uri={app.icon} label={app.label} size={44} />
      <Text style={[type.bodyStrong, styles.label]} numberOfLines={1}>
        {app.label}
      </Text>
      <Pop active={selected}>
        <View style={[styles.box, selected && styles.boxSelected]}>
          {selected && <Icon name="check" size={16} color={colors.white} strokeWidth={3} />}
        </View>
      </Pop>
    </Pressable>
  );
}

export const AppListItem = memo(AppListItemBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 14,
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.blueSoft },
  rowPressed: { backgroundColor: colors.pinkSoft },
  label: { flex: 1, color: colors.ink },
  box: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxSelected: { backgroundColor: colors.blue, borderColor: colors.blue },
});
