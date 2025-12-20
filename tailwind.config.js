/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fefaf6',
          100: '#fdf5ec',
          200: '#fae8d3',
          300: '#f6d4b0',
          400: '#f0b882',
          500: '#e99a52',
          600: '#d97d2e',
          700: '#b46224',
          800: '#925021',
          900: '#784420',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

