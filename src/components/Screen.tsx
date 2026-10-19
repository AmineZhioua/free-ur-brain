import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '../theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** 'blue' is used by the active-commitment screen. */
  tone?: 'light' | 'blue';
  /** Pinned to the bottom, outside the scrolling area. */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = false, tone = 'light', footer, style }: Props) {
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: footer ? spacing.md : insets.bottom + spacing.lg,
    paddingHorizontal: spacing.lg,
  };

  return (
    <View style={[styles.root, tone === 'blue' && styles.blue]}>
      <StatusBar style={tone === 'blue' ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, styles.scrollContent, padding, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.grow, padding, style]}>{children}</View>
      )}
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>{footer}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  blue: { backgroundColor: colors.blue },
  content: { gap: spacing.md },
  grow: { flexGrow: 1, flexShrink: 1 }, // non-scrolling screens only
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 }, // no flexShrink here
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
});
