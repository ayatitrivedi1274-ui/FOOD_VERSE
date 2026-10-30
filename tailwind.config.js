/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFCF5',
          100: '#FBF7EF',
          200: '#F4EDDD',
          300: '#E9DFC8',
        },
        leaf: {
          50: '#EEF8EE',
          100: '#D6F0D9',
          200: '#AEE0B4',
          300: '#7DCB86',
          400: '#4FB15E',
          500: '#2F9443',
          600: '#217A35',
          700: '#1B612B',
          800: '#184D25',
          900: '#143F21',
        },
        ink: {
          500: '#6B776E',
          600: '#55625A',
          700: '#3D4A40',
          900: '#1F2A22',
        },
        lake: {
          50: '#EAF4F8',
          500: '#3A7CA5',
          700: '#285A7A',
        },
        apricot: {
          100: '#FFEBD2',
          500: '#F08A2C',
          700: '#A85212',
        },
        amber: {
          50: '#FFF6DB',
          500: '#E0A21B',
          700: '#8A5E08',
        },
        berry: {
          50: '#FDECEC',
          500: '#D64545',
          700: '#A82F2F',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 42, 34, 0.04), 0 8px 24px -12px rgba(31, 42, 34, 0.12)',
        lift: '0 4px 12px rgba(31, 42, 34, 0.06), 0 20px 40px -16px rgba(31, 42, 34, 0.2)',
      },
    },
  },
  plugins: [],
};
