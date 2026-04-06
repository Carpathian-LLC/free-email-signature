/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1B8FF2',
          'blue-hover': '#0F6BB8',
          'blue-dark': '#134A86',
          'blue-light': '#4DB6F7',
        },
        page: {
          bg: '#ffffff',
          'bg-alt': '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
