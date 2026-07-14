/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  theme: {
  extend: {
    // ...your existing stuff stays here
    fontFamily: {
      display: ['Sora', 'sans-serif'],
    },
    colors: {
      ink: '#101A2E',
      ink2: '#1B2A47',
      marigold: '#F2A93B',
      marigold2: '#E0912A',
      cream: '#FBF7EF',
      slate: '#5B6B85',
    },
  },
  },
};
