export const colors = {
  // Brand foundations
  white: '#FFFFFF',
  cream: '#FAF8F5',
  ink: '#0C1B2A',
  inkMuted: '#475569',
  inkFaint: '#94A3B8',
  line: '#E2E8F0',
  lineStrong: '#CBD5E1',

  // Characteristic Pink & Brain palette
  pink: '#F2AEB1',
  pinkSoft: '#FDF2F2',
  pinkDeep: '#E08388',
  pinkBorder: '#F5C2C4',

  // Characteristic Blue palette
  blue: '#0A5CC4',
  blueDark: '#084899',
  blueSoft: '#EFF6FF',
  blueDeep: '#063A78',
  onBlue: '#FFFFFF',
  onBlueMuted: '#BFDBFE',
  onBlueFaint: 'rgba(255, 255, 255, 0.45)',

  // Accents / Feedback
  sky: '#60A5FA',
  success: '#059669',
  successSoft: '#ECFDF5',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerInk: '#991B1B',
  disabled: '#F1F5F9',
  onDisabled: '#94A3B8',
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 9999,
};

export const motion = {
  instant: 120,
  fast: 200,
  base: 320,
  gentle: 480,
  breathe: 2600,
};

export const type = {
  timer: {
    fontFamily: fonts.display,
    fontSize: 58,
    lineHeight: 64,
    letterSpacing: -1.5,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  lead: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  small: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
  },
};
