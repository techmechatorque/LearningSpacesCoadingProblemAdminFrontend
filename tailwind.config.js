/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',        // Pitch black / dark gray
          panel: '#1e1e1e',     // Monaco editor dark background / sidebars
          border: '#2e2e2e',    // Subtle separator line
          card: '#161616',      // Form / card container
          hover: '#2a2a2a',     // Item hover state
          text: '#e3e3e3',      // Default light text
          muted: '#8e8e8e',     // Subdued text
        },
        brand: {
          primary: '#e5a50a',   // LeetCode gold/orange primary
          secondary: '#2cbb5d', // LeetCode green
          danger: '#ef4444',    // Danger red
        }
      },
    },
  },
  plugins: [],
}
