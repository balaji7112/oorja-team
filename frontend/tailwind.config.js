/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#07110F',
        'bg-secondary': '#0B1715',
        'energy-green': '#20D67B',
        'energy-cyan': '#27D7D0',
        'energy-solar': '#FFB84D',
        'energy-accent': '#FF8A3D',
        'energy-grid': '#4A9EE0',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
