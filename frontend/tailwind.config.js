/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand color standard:
        //  - pink / pink-dark: primary conversion CTAs (the "Create / Start
        //    building / Use this template" funnel buttons) and key accents
        //    (hero H1 keyword, card hover borders/rings). Hover -> pink-dark.
        //  - blue / blue-hover: in-app and utility buttons (consent banner,
        //    Create editor controls, donate, popup dismiss), navigation/recovery
        //    buttons (Back to blog, Go Home), and all inline text links.
        //  - blue-dark: dark section/hero backgrounds.
        brand: {
          blue: '#1B8FF2',
          'blue-hover': '#0F6BB8',
          'blue-dark': '#134A86',
          'blue-light': '#4DB6F7',
          pink: '#F11C6B',
          'pink-dark': '#C7124F',
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
