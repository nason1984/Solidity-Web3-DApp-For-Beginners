/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#00A1E4',
        'secondary-blue': '#0077B6',
        'dark-blue': '#005082',
        'light-blue-1': '#90E0EF',
        'light-blue-2': '#CAF0F8',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
