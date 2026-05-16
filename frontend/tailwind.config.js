/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFB703',
          light: '#FFCF4A',
          dark: '#FB8500',
        },
        black: {
          DEFAULT: '#023047',
          soft: '#052f43',
          card: '#073b52',
        },
      },
    },
  },
  plugins: [],
}
