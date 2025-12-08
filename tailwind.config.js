/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        calendar: {
          blue: '#4285f4',
          green: '#34a853',
          yellow: '#fbbc04',
          red: '#ea4335',
          purple: '#9c27b0',
          orange: '#ff9800',
          teal: '#009688',
          pink: '#e91e63',
          indigo: '#3f51b5',
          cyan: '#00bcd4',
        }
      }
    },
  },
  plugins: [],
}
