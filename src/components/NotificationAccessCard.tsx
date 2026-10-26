import { StyleSheet, Text, View } from 'react-native';
import { AppBlocker } from '../native/AppBlocker';
import { Button } from './Button';
import { Icon } from './Icon';
import { colors, radius, spacing, type } from '../theme';

interface Props {
  /** 'start' = before a commitment; 'active' = Notification access was turned off during one. */
  context: 'start' | 'active';
}

export function NotificationAccessCard({ context }: Props) {
  const active = context === 'active';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Icon name="bell" size={22} color={colors.danger} />
        <Text style={styles.title}>
          {active ? 'Notifications are not being hidden' : 'Notification access required'}
        </Text>
      </View>
      <Text style={styles.body}>
        {active
          ? 'Notification access is turned off, so notifications from your blocked apps can show up. Your timer is still running. Turn it back on to hide them again.'
          : 'FreeUrBrain needs Notification access to hide notifications from the apps you block while a commitment runs. It only looks at which app posted a notification; it does not read, save or send their content.'}
      </Text>
      <Button
        label="Open Notification access"
        variant={active ? 'danger' : 'primary'}
        onPress={AppBlocker.requestNotificationAccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.pinkSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { ...type.bodyStrong, color: colors.dangerInk, flexShrink: 1 },
  body: { ...type.small, color: colors.ink },
});
