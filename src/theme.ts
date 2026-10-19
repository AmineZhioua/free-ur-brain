/**
 * Design tokens. Every colour, font, size and radius used by the UI lives here.
 * Components must not hard-code any of these values.
 */
export const colors = {
  // Brand
  pink: '#F2AEB1', // brain pink: surfaces and the figure
  pinkSoft: '#FCE9EA', // very light pink: quiet surfaces
  pinkDeep: '#D9767C', // brain folds and small details
  blue: '#0A5CC4', // deep sky blue: actions and the active screen
  blueDark: '#084A9E', // pressed state of blue
  blueSoft: '#E7F0FC', // selected rows and chips
  sky: '#5BB2F5', // tiny highlights only (sparkles)
  white: '#FFFFFF',

  // Ink (text). Pink is too light for text on white, so text uses a navy derived from the blue.
  ink: '#0B1F3F',
  inkMuted: '#475A7A',
  inkFaint: '#5F7090',
  onBlue: '#FFFFFF',
  onBlueMuted: '#D3E3F8',

  // Lines and disabled
  line: '#E3E8F0',
  disabled: '#D5DCE8',
  onDisabled: '#66779A',

  // Warning
  danger: '#B3261E',
  dangerSoft: '#FDECEA',
  dangerInk: '#6E1812',
  success: '#0B7A4B',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const fonts = {
  display: 'Fraunces_600SemiBold', // headlines, roman only
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  lead: { fontFamily: fonts.body, fontSize: 18, lineHeight: 27 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.6 },
  button: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22 },
  timer: { fontFamily: fonts.bodyMedium, fontSize: 62, lineHeight: 70 },
} as const;

export const motion = {
  quick: 160,
  base: 320,
  breathe: 3400,
} as const;
