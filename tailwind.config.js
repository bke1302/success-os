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
        bg:      '#000000',
        card:    '#080808',
        card2:   '#101010',
        border:  'rgba(255,255,255,.09)',
        muted:   'rgba(255,255,255,.38)',
        text:    '#f2f2f7',
        accent:  '#FF375F',
        gold:    '#FFD60A',
        success: '#30D158',
        purple:  '#BF5AF2',
        orange:  '#FF9F0A',
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        pulse2:  'pulse2 1.2s ease-in-out infinite',
        fadeUp:  'fadeUp 0.5s ease forwards',
        slideUp: 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        fadeIn:  'fadeIn 0.3s ease-out both',
      },
      keyframes: {
        pulse2: { '0%,100%': { opacity: '0.3' }, '50%': { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
