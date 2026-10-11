import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '../theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = false, style }: Props) {
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.lg,
    paddingHorizontal: spacing.lg,
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, styles.grow, padding, style]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.grow, padding, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md },
  grow: { flexGrow: 1, flexShrink: 1 },
});