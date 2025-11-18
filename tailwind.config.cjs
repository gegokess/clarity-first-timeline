/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#030712',
        surface: '#0C1220',
        panel: '#151C2F',
        'panel-alt': '#1B243C',
        border: '#222C44',
        line: '#25335B',
        text: '#F4F7FB',
        'text-muted': '#94A3C5',
        success: '#43F5C0',
        warning: '#FACC15',
        danger: '#FF6574',
        info: '#5F8BFF',
        'accent-1': '#6E7EFF',
        'accent-2': '#49E9FF',
        'accent-3': '#5DE1A4',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      borderRadius: {
        'xs': '6px',
        'sm': '10px',
        'md': '14px',
        'lg': '18px',
        'full': '9999px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(10, 12, 21, 0.4)',
        md: '0 15px 35px rgba(5, 10, 25, 0.35)',
        lg: '0 30px 60px rgba(5, 10, 25, 0.45)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(120deg, #6E7EFF 0%, #49E9FF 45%, #5DE1A4 100%)',
      },
    },
  },
  plugins: [],
}
