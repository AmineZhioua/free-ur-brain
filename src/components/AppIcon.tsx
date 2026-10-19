import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  /** PNG data URI. When missing, a letter tile is shown. */
  uri?: string;
  label: string;
  size?: number;
}

export function AppIcon({ uri, label, size = 44 }: Props) {
  const box = { width: size, height: size, borderRadius: size * 0.24 };

  if (uri) {
    return <Image source={{ uri }} style={box} accessibilityIgnoresInvertColors />;
  }

  return (
    <View style={[styles.fallback, box]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>
        {(label.trim()[0] ?? '?').toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.display, color: colors.ink },
});
