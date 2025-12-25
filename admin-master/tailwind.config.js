/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyanCustom: {
          500: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}