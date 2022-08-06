/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'yoduh-green-1': '#152515'
      }
    }
  },
  plugins: [require('daisyui')]
};
