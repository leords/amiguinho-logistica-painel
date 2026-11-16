/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Segoe UI', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        orange: {
          DEFAULT: '#ff8c00',
          light: '#fff3e0',
          mid: '#ffd699',
        },
        green: {
          DEFAULT: '#2f9e44',
          dark: '#2b8a3e',
          light: '#ebfbee',
          mid: '#8ce99a',
        },
        blue: {
          DEFAULT: '#1971c2',
          light: '#e7f5ff',
          mid: '#a5d8ff',
        },
        brand: {
          DEFAULT: '#e50914',
          dark: '#b91c1c',
          light: '#fef2f2',
          mid: '#fecaca',
        },
        purple: {
          DEFAULT: '#e50914',
          light: '#fef2f2',
          mid: '#fecaca',
        },
        red: {
          DEFAULT: '#c92a2a',
          light: '#fff5f5',
          mid: '#ffc9c9',
        },
        yellow: {
          text: '#e67700',
          light: '#fff9db',
          mid: '#ffe066',
        },
        gray: {
          900: '#1a1f2e',
          700: '#495057',
          500: '#868e96',
          300: '#dee2e6',
          100: '#f8f9fa',
        },
        'bg-app': '#f2f4f7',
        border: '#eaecef',
        white: '#ffffff',
      },
      borderRadius: {
        sm: '8px',
        card: '14px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 8px rgba(0, 0, 0, 0.04)',
        md: '0 2px 10px rgba(0, 0, 0, 0.08), 0 6px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
