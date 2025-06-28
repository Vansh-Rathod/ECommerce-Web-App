/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4ff',
          100: '#bae0ff',
          200: '#91caff',
          300: '#69b1ff',
          400: '#4096ff',
          500: '#1677ff', // Primary color
          600: '#0958d9',
          700: '#003eb3',
          800: '#002c8c',
          900: '#001d66',
        },
        success: {
          500: '#52c41a',
        },
        warning: {
          500: '#faad14',
        },
        error: {
          500: '#f5222d',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
  // This ensures Tailwind doesn't conflict with Ant Design
  corePlugins: {
    preflight: false,
  },
};