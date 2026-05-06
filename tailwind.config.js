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
        bg:    '#07070e',
        muted: '#4a4868',
        sub:   '#8a88aa',
        text:  '#f0eeff',
        gold:  '#e8a020',
        gold2: '#f5c435',
      },
      borderRadius: { card: '16px' },
      animation: {
        pulse2: 'pulse2 1.2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        glow:   'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulse2: { '0%,100%': { opacity: '0.15' }, '50%': { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(232,160,32,0.2)' },
          to:   { boxShadow: '0 0 40px rgba(232,160,32,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
