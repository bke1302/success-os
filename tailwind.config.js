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
        bg:      '#0a0a0f',
        card:    '#12121a',
        card2:   '#1a1a28',
        border:  '#2a2a3d',
        muted:   '#6b6b8a',
        text:    '#e8e8f0',
        accent:  '#ef4444',
        gold:    '#f5c435',
        success: '#22c55e',
        purple:  '#8b5cf6',
        orange:  '#f97316',
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
