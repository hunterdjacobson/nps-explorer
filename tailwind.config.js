/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
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
