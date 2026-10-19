import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CUSTOM_DURATION_ID,
  DAY,
  HOUR,
  MINUTE,
  describeDuration,
  msToParts,
  partsToMs,
  type DurationOption,
} from '../core/commitment/time';
import { Icon } from './Icon';
import { FadeSlideIn } from './motion';
import { colors, fonts, radius, spacing, type } from '../theme';

interface Props {
  options: readonly DurationOption[];
  value: string;
  onChange: (id: string) => void;
  customDurationMs: number;
  onCustomDurationChange: (ms: number) => void;
}

const MAX_DAYS = 365;
const MAX_MS = MAX_DAYS * DAY;

export function DurationSelector({
  options,
  value,
  onChange,
  customDurationMs,
  onCustomDurationChange,
}: Props) {
  const isCustom = value === CUSTOM_DURATION_ID;
  const parts = useMemo(() => msToParts(customDurationMs), [customDurationMs]);

  const [dayStr, setDayStr] = useState(String(parts.days));
  const [hourStr, setHourStr] = useState(String(parts.hours));
  const [minStr, setMinStr] = useState(String(parts.minutes));
  const [focusedField, setFocusedField] = useState<'days' | 'hours' | 'minutes' | null>(null);

  // Sync string inputs with external durationMs changes when not actively typing in that field
  useEffect(() => {
    if (focusedField !== 'days') setDayStr(String(parts.days));
    if (focusedField !== 'hours') setHourStr(String(parts.hours));
    if (focusedField !== 'minutes') setMinStr(String(parts.minutes));
  }, [parts.days, parts.hours, parts.minutes, focusedField]);

  const updateParts = (newDays: number, newHours: number, newMinutes: number) => {
    const rawMs = partsToMs({
      days: Math.max(0, Math.min(MAX_DAYS, newDays)),
      hours: Math.max(0, Math.min(23, newHours)),
      minutes: Math.max(0, Math.min(59, newMinutes)),
    });
    const clampedMs = Math.min(MAX_MS, rawMs);
    onCustomDurationChange(clampedMs);
  };

  const step = (field: 'days' | 'hours' | 'minutes', delta: number) => {
    let { days, hours, minutes } = parts;
    if (field === 'days') {
      days = Math.max(0, Math.min(MAX_DAYS, days + delta));
    } else if (field === 'hours') {
      hours = Math.max(0, Math.min(23, hours + delta));
    } else if (field === 'minutes') {
      minutes = Math.max(0, Math.min(59, minutes + delta));
    }
    updateParts(days, hours, minutes);
  };

  const handleInputChange = (field: 'days' | 'hours' | 'minutes', text: string) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (field === 'days') setDayStr(sanitized);
    if (field === 'hours') setHourStr(sanitized);
    if (field === 'minutes') setMinStr(sanitized);

    const num = parseInt(sanitized, 10) || 0;
    const currentDays = field === 'days' ? num : parts.days;
    const currentHours = field === 'hours' ? num : parts.hours;
    const currentMins = field === 'minutes' ? num : parts.minutes;

    const rawMs = partsToMs({
      days: Math.min(MAX_DAYS, currentDays),
      hours: Math.min(23, currentHours),
      minutes: Math.min(59, currentMins),
    });
    onCustomDurationChange(Math.min(MAX_MS, rawMs));
  };

  const handleBlur = (field: 'days' | 'hours' | 'minutes') => {
    setFocusedField(null);
    const d = parseInt(dayStr, 10) || 0;
    const h = parseInt(hourStr, 10) || 0;
    const m = parseInt(minStr, 10) || 0;

    // Normalize any spillover (e.g. typing 90 in minutes -> 1 hour 30 mins)
    const totalMinutes = d * 24 * 60 + h * 60 + m;
    const normalizedMs = Math.min(MAX_MS, totalMinutes * MINUTE);
    const normalizedParts = msToParts(normalizedMs);

    setDayStr(String(normalizedParts.days));
    setHourStr(String(normalizedParts.hours));
    setMinStr(String(normalizedParts.minutes));
    onCustomDurationChange(normalizedMs);
  };

  const addQuickTime = (ms: number) => {
    const newMs = Math.min(MAX_MS, Math.max(0, customDurationMs + ms));
    const normalized = msToParts(newMs);
    setDayStr(String(normalized.days));
    setHourStr(String(normalized.hours));
    setMinStr(String(normalized.minutes));
    onCustomDurationChange(newMs);
  };

  const clearAll = () => {
    setDayStr('0');
    setHourStr('0');
    setMinStr('0');
    onCustomDurationChange(0);
  };

  const isValidDuration = customDurationMs >= MINUTE;

  return (
    <View style={styles.container}>
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

        {/* Custom duration chip */}
        <Pressable
          key={CUSTOM_DURATION_ID}
          onPress={() => onChange(CUSTOM_DURATION_ID)}
          accessibilityRole="radio"
          accessibilityState={{ selected: isCustom }}
          style={({ pressed }) => [
            styles.chip,
            isCustom && styles.chipSelected,
            pressed && !isCustom && styles.chipPressed,
          ]}
        >
          <Text style={[type.bodyStrong, { color: isCustom ? colors.white : colors.ink }]}>
            Custom
          </Text>
        </Pressable>
      </View>

      {/* Custom Duration Editor Panel */}
      {isCustom && (
        <FadeSlideIn delay={30}>
          <View style={styles.customBox}>
            <View style={styles.customHeader}>
              <View style={styles.headerLeft}>
                <Icon name="clock" size={18} color={colors.ink} />
                <Text style={styles.customTitle}>Customize duration</Text>
              </View>
              {isValidDuration && (
                <View style={styles.previewPill}>
                  <Text style={styles.previewPillText}>{describeDuration(customDurationMs)}</Text>
                </View>
              )}
            </View>

            {/* Steppers */}
            <View style={styles.steppersRow}>
              {/* DAYS */}
              <View style={styles.stepperCol}>
                <Text style={styles.colLabel}>DAYS</Text>
                <View
                  style={[
                    styles.stepperBox,
                    focusedField === 'days' && styles.stepperBoxFocused,
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      parts.days >= MAX_DAYS && styles.btnDisabled,
                    ]}
                    disabled={parts.days >= MAX_DAYS}
                    onPress={() => step('days', 1)}
                    accessibilityRole="button"
                    accessibilityLabel="Increase days"
                  >
                    <Icon name="plus" size={16} color={parts.days >= MAX_DAYS ? colors.inkFaint : colors.ink} />
                  </Pressable>

                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={dayStr}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      maxLength={3}
                      onFocus={() => setFocusedField('days')}
                      onChangeText={(t) => handleInputChange('days', t)}
                      onBlur={() => handleBlur('days')}
                      accessibilityLabel="Days"
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      parts.days <= 0 && styles.btnDisabled,
                    ]}
                    disabled={parts.days <= 0}
                    onPress={() => step('days', -1)}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease days"
                  >
                    <Icon name="minus" size={16} color={parts.days <= 0 ? colors.inkFaint : colors.ink} />
                  </Pressable>
                </View>
              </View>

              {/* HOURS */}
              <View style={styles.stepperCol}>
                <Text style={styles.colLabel}>HOURS</Text>
                <View
                  style={[
                    styles.stepperBox,
                    focusedField === 'hours' && styles.stepperBoxFocused,
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      parts.hours >= 23 && styles.btnDisabled,
                    ]}
                    disabled={parts.hours >= 23}
                    onPress={() => step('hours', 1)}
                    accessibilityRole="button"
                    accessibilityLabel="Increase hours"
                  >
                    <Icon name="plus" size={16} color={parts.hours >= 23 ? colors.inkFaint : colors.ink} />
                  </Pressable>

                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={hourStr}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      maxLength={2}
                      onFocus={() => setFocusedField('hours')}
                      onChangeText={(t) => handleInputChange('hours', t)}
                      onBlur={() => handleBlur('hours')}
                      accessibilityLabel="Hours"
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      parts.hours <= 0 && styles.btnDisabled,
                    ]}
                    disabled={parts.hours <= 0}
                    onPress={() => step('hours', -1)}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease hours"
                  >
                    <Icon name="minus" size={16} color={parts.hours <= 0 ? colors.inkFaint : colors.ink} />
                  </Pressable>
                </View>
              </View>

              {/* MINUTES */}
              <View style={styles.stepperCol}>
                <Text style={styles.colLabel}>MINS</Text>
                <View
                  style={[
                    styles.stepperBox,
                    focusedField === 'minutes' && styles.stepperBoxFocused,
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      parts.minutes >= 59 && styles.btnDisabled,
                    ]}
                    disabled={parts.minutes >= 59}
                    onPress={() => step('minutes', 1)}
                    accessibilityRole="button"
                    accessibilityLabel="Increase minutes"
                  >
                    <Icon name="plus" size={16} color={parts.minutes >= 59 ? colors.inkFaint : colors.ink} />
                  </Pressable>

                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={minStr}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      maxLength={2}
                      onFocus={() => setFocusedField('minutes')}
                      onChangeText={(t) => handleInputChange('minutes', t)}
                      onBlur={() => handleBlur('minutes')}
                      accessibilityLabel="Minutes"
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      parts.minutes <= 0 && styles.btnDisabled,
                    ]}
                    disabled={parts.minutes <= 0}
                    onPress={() => step('minutes', -1)}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease minutes"
                  >
                    <Icon name="minus" size={16} color={parts.minutes <= 0 ? colors.inkFaint : colors.ink} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Quick addition shortcuts */}
            <View style={styles.quickRow}>
              <Text style={styles.quickPrompt}>Quick add:</Text>
              <Pressable
                style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
                onPress={() => addQuickTime(5 * MINUTE)}
                accessibilityRole="button"
                accessibilityLabel="Add 5 minutes"
              >
                <Text style={styles.quickChipText}>+5m</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
                onPress={() => addQuickTime(15 * MINUTE)}
                accessibilityRole="button"
                accessibilityLabel="Add 15 minutes"
              >
                <Text style={styles.quickChipText}>+15m</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
                onPress={() => addQuickTime(HOUR)}
                accessibilityRole="button"
                accessibilityLabel="Add 1 hour"
              >
                <Text style={styles.quickChipText}>+1h</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
                onPress={() => addQuickTime(DAY)}
                accessibilityRole="button"
                accessibilityLabel="Add 1 day"
              >
                <Text style={styles.quickChipText}>+1d</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
                onPress={clearAll}
                accessibilityRole="button"
                accessibilityLabel="Clear duration"
              >
                <Text style={styles.clearChipText}>Clear</Text>
              </Pressable>
            </View>

            {/* Validation / Summary */}
            {!isValidDuration ? (
              <View style={styles.warningBanner}>
                <Text style={styles.warningBannerText}>Minimum duration is 1 minute</Text>
              </View>
            ) : (
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  Apps will be blocked for {describeDuration(customDurationMs)}
                </Text>
              </View>
            )}
          </View>
        </FadeSlideIn>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
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
  chipSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  chipPressed: {
    backgroundColor: colors.pinkSoft,
    borderColor: colors.pink,
  },

  // Custom panel
  customBox: {
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.md,
    gap: 14,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  previewPill: {
    backgroundColor: colors.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  previewPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.blue,
  },

  // Steppers
  steppersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepperCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  colLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.inkMuted,
  },
  stepperBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepperBoxFocused: {
    borderColor: colors.blue,
  },
  stepBtn: {
    width: '100%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  stepBtnPressed: {
    backgroundColor: colors.pinkSoft,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  inputWrap: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    minWidth: 40,
    padding: 0,
  },

  // Quick addition
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  quickPrompt: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkMuted,
    marginRight: 2,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  quickChipPressed: {
    backgroundColor: colors.pinkSoft,
  },
  quickChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  clearChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.danger,
  },

  // Info and Warning
  infoBanner: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  infoBannerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
  warningBanner: {
    backgroundColor: colors.dangerSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningBannerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.danger,
  },
});
