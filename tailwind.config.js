/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Celestial Ink design system */
        'bg-base': '#0B1120',
        'bg-surface': '#151E32',
        'bg-elevated': '#1E293B',
        'text-primary': '#F1F5F9',
        'text-secondary': '#A0AEC0',
        'text-muted': '#64748B',
        'text-inverse': '#0B1120',
        /* Brand - Champagne Gold */
        'primary': '#D4AF37',
        'primary-hover': '#E5C158',
        'primary-active': '#B8962E',
        /* Wuxing (Five Elements) */
        'wuxing-wood': '#4ADE80',
        'wuxing-fire': '#F87171',
        'wuxing-earth': '#FBBF24',
        'wuxing-metal': '#E2E8F0',
        'wuxing-water': '#60A5FA',
        /* Status */
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
        /* Legacy compat (kept for existing class usage) */
        'bg-primary': '#0B1120',
        'bg-secondary': '#151E32',
        'bg-tertiary': '#1E293B',
        'gold-primary': '#D4AF37',
        'gold-light': '#E5C158',
        'warm-white': '#F1F5F9',
        'jade-green': '#4ADE80',
        'cinnabar-red': '#F87171',
        'earth-brown': '#FBBF24',
        'metal-white': '#E2E8F0',
        'water-blue': '#60A5FA',
        'aurora-green': '#10B981',
        'text-tertiary': '#64748B',
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'taiji-spin': 'taiji-spin 3s linear infinite',
        'ink-spread': 'ink-spread 0.8s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'taiji-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'ink-spread': {
          from: {
            clipPath: 'circle(0% at 50% 50%)',
            opacity: 0,
          },
          to: {
            clipPath: 'circle(100% at 50% 50%)',
            opacity: 1,
          },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 168, 83, 0.35)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
