/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#12121A',
        'bg-tertiary': '#1A1A28',
        'gold-primary': '#D4A853',
        'gold-secondary': '#C49A3C',
        'gold-light': '#E8C97A',
        'amber-glow': '#F59E0B',
        'warm-white': '#FDF6E3',
        'ink-black': '#1A1A1A',
        'ink-gray': '#4A4A4A',
        'jade-green': '#2D8B57',
        'cinnabar-red': '#C23B22',
        'earth-brown': '#8B7355',
        'metal-white': '#C0C0C0',
        'water-blue': '#3B82F6',
        'star-dust': '#6366F1',
        'nebula-purple': '#7C3AED',
        'cosmic-blue': '#1E3A5F',
        'aurora-green': '#10B981',
        'text-primary': '#F5F0E8',
        'text-secondary': '#A09888',
        'text-tertiary': '#6B6560',
        'text-muted': '#4A4643',
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
