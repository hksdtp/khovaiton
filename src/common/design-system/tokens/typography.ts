export const typography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    mono: [
      'SF Mono',
      'Monaco',
      'Inconsolata',
      'Roboto Mono',
      'monospace',
    ],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

export type FontSize = keyof typeof typography.fontSize
export type FontWeight = keyof typeof typography.fontWeight
