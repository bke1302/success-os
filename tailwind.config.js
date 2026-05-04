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
        bg:       '#16161f',
        surface:  '#1e1e2a',
        surface2: '#272733',
        border:   '#32323f',
        muted:    '#5a5a72',
        sub:      '#9090aa',
        text:     '#f0f0f8',
        gold:     '#c9973a',
        gold2:    '#e8b84b',
        goldDim:  '#7a5a22',
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        pulse2: 'pulse2 1.2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.45s ease forwards',
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
      },
    },
  },
  plugins: [],
}
