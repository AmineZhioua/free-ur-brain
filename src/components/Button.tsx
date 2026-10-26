import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { colors, radius, type } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'onBlue';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: IconName;
}

const BG: Record<Variant, { rest: string; pressed: string; label: string; border?: string }> = {
  primary: { rest: colors.blue, pressed: colors.blueDark, label: colors.onBlue },
  secondary: { rest: colors.white, pressed: colors.blueSoft, label: colors.blue, border: colors.blue },
  danger: { rest: colors.danger, pressed: colors.dangerInk, label: colors.white },
  onBlue: { rest: colors.white, pressed: colors.blueSoft, label: colors.blue },
};

export function Button({ label, onPress, variant = 'primary', disabled = false, icon }: Props) {
  const v = BG[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? colors.disabled : pressed ? v.pressed : v.rest,
          borderColor: disabled ? colors.disabled : v.border ?? 'transparent',
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.inner}>
        <Text
          style={[
            type.button,
            styles.label,
            { color: disabled ? colors.onDisabled : v.label },
          ]}
        >
          {label}
        </Text>
        {icon && (
          <View style={styles.iconWrap}>
            <Icon
              name={icon}
              size={20}
              color={disabled ? colors.onDisabled : v.label}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  inner: {
    width: '100%',
    minWidth: 0,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
    fontSize: 14
  },
  iconWrap: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
