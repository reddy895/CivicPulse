/**
 * CivicPulse Design System Tokens
 * Preserves the core Coffee & Crème palette and provides consistent
 * design variables for typography, spacing, radii, shadows, and transitions.
 */

export const tokens = {
  colors: {
    bg: {
      primary: '#FDFBF7',
      secondary: '#F5F0E8',
      card: '#FFFFFF',
      surface: '#FAF6F0',
      elevated: '#F5EBE0',
    },
    border: {
      warm: '#E8E0D5',
      divider: '#F0EBE3',
      subtle: '#E8E0D5',
      focus: '#D4A373',
    },
    accent: {
      primary: '#6F4E37',
      secondary: '#A67B5B',
      tertiary: '#D4A373',
      light: '#E6CCB2',
      dark: '#2C1810',
    },
    text: {
      primary: '#2C1810',
      secondary: '#5C4A42',
      tertiary: '#9C8C84',
      inverse: '#FDFBF7',
    },
    status: {
      success: '#5A8F6E',
      successBg: '#F0F6F2',
      successBorder: '#A5D6A7',
      warning: '#C78D3F',
      warningBg: '#FDF8F0',
      warningBorder: '#FCD34D',
      danger: '#B54A4A',
      dangerBg: '#FDF2F2',
      dangerBorder: '#F87171',
      info: '#5A7D9A',
      infoBg: '#F0F4F8',
      infoBorder: '#BAE6FD',
    }
  },
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    }
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
  },
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    '2xl': '1.25rem', // 20px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(44, 24, 16, 0.05)',
    card: '0 1px 3px rgba(44, 24, 16, 0.04), 0 4px 12px rgba(44, 24, 16, 0.02)',
    hover: '0 4px 12px rgba(44, 24, 16, 0.06), 0 8px 24px rgba(44, 24, 16, 0.04)',
    modal: '0 20px 25px -5px rgba(44, 24, 16, 0.1), 0 10px 10px -5px rgba(44, 24, 16, 0.04)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

export default tokens;
