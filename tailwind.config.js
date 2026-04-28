/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#161D31',
          900: '#1E2A42',
          800: '#121212',
          700: '#1a1a1a',
          600: '#262626',
        },
        'border-card': 'rgba(255,255,255,0.07)',
        siac: {
          armed: '#0B986A',
          active: '#22D3EE',
          accent: '#22D3EE',
          disarmed: '#D89A1E',
          alarmed: '#FAD92A',
          blocked: '#F51E1E',
          off: '#4A4949',
          // Compatibility aliases for existing components
          green: '#0B986A',
          red: '#F51E1E',
          orange: '#D89A1E',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
