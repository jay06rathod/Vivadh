/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        '0b0b0b': '#0b0b0b',
        '1a1410': '#1a1410',
        'd97706': '#d97706',
        'f59e0b': '#f59e0b',
        'f5e6c8': '#f5e6c8',
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
}