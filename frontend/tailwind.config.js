/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        coffee: {
          50: '#FDFBF7',
          100: '#F5F0E8',
          200: '#E8E0D5',
          300: '#D4A373',
          400: '#A67B5B',
          500: '#6F4E37',
          800: '#5C4A42',
          900: '#2C1810',
        },
      },
    },
  },
};