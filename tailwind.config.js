/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          950: '#080b10',
          900: '#0d1117',
          850: '#111827',
          800: '#162031',
        },
        shred: {
          green: '#8ee7a8',
          mint: '#c8ffd5',
          amber: '#ffc66d',
          coral: '#ff7a72',
          cyan: '#76e4f7',
        },
      },
      boxShadow: {
        glow: '0 0 42px rgba(118, 228, 247, 0.22)',
        bill: '0 18px 50px rgba(0, 0, 0, 0.28)',
      },
    },
  },
  plugins: [],
};
