/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Space Grotesk', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        bg:       '#0b0b10',
        surface:  '#121218',
        surface2: '#1c1c26',
        border:   '#26263a',
        muted:    '#545470',
        sub:      '#8a8aaa',
        text:     '#eeeeff',
        gold:     '#d4a43a',
        gold2:    '#f5c842',
        goldDim:  '#6b4e18',
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        pulse2:  'pulse2 1.2s ease-in-out infinite',
        fadeUp:  'fadeUp 0.45s ease forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { opacity: '0.15' },
          '50%':      { opacity: '1'    },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0'  },
        },
      },
    },
  },
  plugins: [],
}
