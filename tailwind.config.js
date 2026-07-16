/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jar: {
          bg: '#0c0a09',
          glow: '#c4a574',
          paper: '#f5f0e8',
        },
      },
      fontFamily: {
        message: ['Lora', 'Georgia', 'serif'],
        signature: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
}
