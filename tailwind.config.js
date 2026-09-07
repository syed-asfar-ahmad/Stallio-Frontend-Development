export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f3f1fd',
          100: '#ebe8fc',
          200: '#d6cff9',
          300: '#b8adf5',
          400: '#5e2bec',
          500: '#5b45e5',
          600: '#3f34ba',
          700: '#352ea3',
          800: '#2f2184',
          900: '#251a66',
          950: '#1a1247',
        },
      },
    },
  },
  plugins: [],
};
