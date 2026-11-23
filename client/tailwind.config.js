/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lichess: {
          dark: '#161512',
          surface: '#262421',
          surfaceHover: '#363431',
          border: '#3f3c38',
          accent: '#629924',
          accentHover: '#72b02a',
          blue: '#3692e7',
          gold: '#e29b14',
          red: '#cc3333'
        }
      }
    },
  },
  plugins: [],
}
