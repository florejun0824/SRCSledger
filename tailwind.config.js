/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line tells Tailwind to scan all JS/JSX/TS/TSX files in the src folder
    "./public/index.html", // Also include your main HTML file
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Define custom font family if using Google Fonts
      },
      // Add custom keyframes for animations
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      // Apply the animation
      animation: {
        'bounce-slow': 'bounce-slow 4s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
