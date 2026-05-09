// Resurge — design tokens (single source of truth)
// "Obsidian Blue" — pure black canvas, electric blue spirit.
export const colors = {
  bg: '#000000',
  surface: '#0A0A0F',
  surfaceElevated: '#13131C',
  surfaceHigh: '#1B1B27',
  hairline: 'rgba(140,170,250,0.07)',
  hairlineStrong: 'rgba(140,170,250,0.14)',
  overlay: 'rgba(0,0,0,0.85)',

  // calm electric blue — the primary brand
  primary: '#5B9BFE',
  primaryDim: 'rgba(91,155,254,0.18)',
  primarySoft: 'rgba(91,155,254,0.08)',
  primaryHi: '#7DB3FF',

  // soft teal/cyan — water-like for breathing/healing motifs
  sage: '#4FD1C5',
  sageDim: 'rgba(79,209,197,0.20)',
  sageSoft: 'rgba(79,209,197,0.08)',

  // accents
  accent: '#9B7BFF',
  accentDim: 'rgba(155,123,255,0.18)',
  gold: '#F4C77B',
  goldDim: 'rgba(244,199,123,0.18)',

  text: '#F2F4FA',
  textSecondary: '#9AA8C7',
  textMuted: '#5C6680',
  textInverse: '#000000',

  success: '#4FD1C5',
  warning: '#F4A261',
  emergency: '#F25C54',
  emergencyDim: 'rgba(242,92,84,0.18)',
  info: '#5B9BFE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const fonts = {
  heading: 'Manrope_700Bold',
  headingExtraBold: 'Manrope_800ExtraBold',
  headingSemiBold: 'Manrope_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const type = {
  hero: { fontFamily: fonts.headingExtraBold, fontSize: 56, letterSpacing: -2, color: colors.text },
  h1: { fontFamily: fonts.headingExtraBold, fontSize: 34, letterSpacing: -1, color: colors.text },
  h2: { fontFamily: fonts.heading, fontSize: 26, letterSpacing: -0.5, color: colors.text },
  h3: { fontFamily: fonts.headingSemiBold, fontSize: 20, color: colors.text },
  bodyLg: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  bodyMuted: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: colors.textSecondary },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textMuted },
};
