/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': '#0d0d0d', // Near-black for high contrast
        'theme-bg-secondary': '#1a1a2e', // Dark navy blue for depth
        'theme-primary': '#00e5ff', // Vibrant cyan
        'theme-secondary': '#be00ff', // Vibrant purple
        'theme-accent': '#ff00aa', // Vibrant pink/magenta
        'theme-highlight': '#ffff00', // Bright yellow for combos/highlights
        'theme-text-light': '#ffffff',
        'theme-text-dark': '#a0a0a0', // Muted gray for secondary text
      },
      boxShadow: {
        'glow-primary': '0 0 15px 5px rgba(0, 229, 255, 0.5)',
        'glow-secondary': '0 0 15px 5px rgba(190, 0, 255, 0.5)',
        'glow-accent': '0 0 15px 5px rgba(255, 0, 170, 0.5)',
        'glow-highlight': '0 0 20px 7px rgba(255, 255, 0, 0.6)',
      },
      animation: {
        blob: 'blob 7s infinite',
        flicker: 'flicker 3s infinite alternate',
        'grid-pan': 'grid-pan 60s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'grid-pan': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
    },
  },
  plugins: [],
}
