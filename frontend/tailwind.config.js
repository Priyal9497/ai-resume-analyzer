/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#9B6CF6',
          400: '#8B5CF6',
          500: '#6C3CE1', // Your custom purple
          600: '#5b21b6',
        },
        secondary: {
          400: '#F05A78',
          500: '#E9405F', // Your custom pink
        },
        accent: {
          500: '#F5A623', // Your custom orange
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        grotesk: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}