import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors, fonts } from '../theme';

interface Item {
  packageName: string;
  label: string;
}

interface Props {
  items: readonly Item[];
  icons: ReadonlyMap<string, string>;
  max?: number;
  size?: number;
}

/** Overlapping row of app icons, with a "+N" bubble for the rest. */
export function AppIconStack({ items, icons, max = 5, size = 40 }: Props) {
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  const overlap = -size * 0.28;

  return (
    <View style={styles.row}>
      {shown.map((item, i) => (
        <View
          key={item.packageName}
          style={[styles.ring, { marginLeft: i === 0 ? 0 : overlap, borderRadius: size * 0.3 }]}
        >
          <AppIcon uri={icons.get(item.packageName)} label={item.label} size={size} />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.more,
            { width: size + 6, height: size + 6, borderRadius: size * 0.3, marginLeft: overlap },
          ]}
        >
          <Text style={styles.moreText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  ring: { borderWidth: 3, borderColor: colors.white, backgroundColor: colors.white },
  more: {
    backgroundColor: colors.blueSoft,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.blue },
});
