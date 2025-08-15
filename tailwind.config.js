/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
        '4k': '3840px',
        '8k': '7680px',
      },
      fontSize: {
        '4k': '1.5rem',
        '8k': '2rem',
      },
      colors: {
        primary: '#c30059',
        secondary: '#ff4d4d',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      maxWidth: {
        '4k': '3840px',
        '8k': '7680px',
      },
      maxHeight: {
        '4k': '2160px',
        '8k': '4320px',
      },
    },
  },
  plugins: [],
} 