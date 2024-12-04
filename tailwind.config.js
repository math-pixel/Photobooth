/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'primary': {
          from: '#0051FF',
          to: '#03C0D4',
        },
        'button': {
          accept: '#4CAF50',
          reject: '#FF4444',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'countdown': 'countdown 1s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-out forwards',
      },
      keyframes: {
        countdown: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}