/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0f',
        card: '#12121a',
        card2: '#1a1a28',
        accent: '#f5c518',
        accent2: '#ff6b35',
        success: '#22c55e',
        border: '#2a2a3d',
        muted: '#6b6b8a',
        text: '#e8e8f0',
      },
      animation: {
        pulse2: 'pulse2 1s ease-in-out infinite',
        fadeIn: 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
