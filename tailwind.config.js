/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        jerk: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '15%': { transform: 'translate(-4px, 2px) rotate(-4deg)' },
          '30%': { transform: 'translate(4px, -2px) rotate(3deg)' },
          '45%': { transform: 'translate(-3px, 1px) rotate(-2deg)' },
          '60%': { transform: 'translate(2px, -1px) rotate(1deg)' },
          '75%': { transform: 'translate(-1px, 0.5px) rotate(-0.5deg)' },
        },
      },
      animation: {
        jerk: 'jerk 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
      },
      colors: {
        park: {
          amber: '#F4A261',
          violet: '#9B72CF',
          cyan: '#4CC9F0',
          aqua: '#43E8D8',
          rose: '#E07A5F',
          sage: '#81B29A',
          teal: '#A8DADC',
          blush: '#F7D1CD',
          mint: '#6FFFE9',
          gold: '#FFBE0B',
        },
      },
    },
  },
  plugins: [],
}
