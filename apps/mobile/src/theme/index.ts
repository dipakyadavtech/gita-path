// "Sacred Clarity" design system, taken from the Stitch export (docs/design/stitch/sacred_clarity/DESIGN.md).
export const colors = {
  canvas: '#F5F6FA',
  surface: '#FFFFFF',
  line: '#E4E4EC',
  ink: '#15132B',
  muted: '#55546A',
  saffron: '#C2410C',
  saffronDark: '#9A3412',
  saffronTint: '#FDEBDD',
  indigo: '#24205A',
  indigoSoft: '#3A3580',
  indigoText: '#C9C5F2',
  indigoTint: '#EEEDF8',
  teal: '#0F5E63',
  tealTint: '#E2F1F1',
  gold: '#D97706',
  goldSoft: '#F8B26A',
  danger: '#B91C1C',
  dangerTint: '#FDECEC',
  white: '#FFFFFF',
  // Kids mode
  kidsCanvas: '#FFF7E6',
  kidsLine: '#F1E3C4',
  sun: '#FFC94D',
  sky: '#DDEFFF',
  leaf: '#2E7D32',
  leafTint: '#E3F4E1',
  peacock: '#1E6FD9',
} as const;

export const fonts = {
  heading: 'Sora_600SemiBold',
  headingBold: 'Sora_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  verse: 'NotoSerifDevanagari_500Medium',
  verseBold: 'NotoSerifDevanagari_600SemiBold',
  kids: 'Baloo2_700Bold',
  kidsHeavy: 'Baloo2_800ExtraBold',
  kidsMedium: 'Baloo2_600SemiBold',
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, full: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const shadow = {
  card: {
    shadowColor: '#15132B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  raised: {
    shadowColor: '#24205A',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const type = {
  display: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 38, color: colors.ink, letterSpacing: -0.4 },
  h1: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 34, color: colors.ink, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 28, color: colors.ink },
  h3: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.ink },
  bodyMuted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.muted },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20, color: colors.ink },
  caps: { fontFamily: fonts.headingBold, fontSize: 11, lineHeight: 16, letterSpacing: 0.9, textTransform: 'uppercase' as const, color: colors.muted },
  verse: { fontFamily: fonts.verseBold, fontSize: 19, lineHeight: 32, color: colors.ink },
} as const;
