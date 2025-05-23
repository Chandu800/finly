/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        transform: "transform",
      },
      colors: {
        // dark mode palette
        dark: {
          background: '#202222',
          secBackground: "#191a1a",
          card: '#1E1E1E',
          border: '#2C2C2C',
          text: '#8d9191',
          textHover: "#2d2f2f",
          subtext: '#A0A0A0',
          accent: '#3B82F6',   // blue
          success: '#22C55E',  // green
          warning: '#FBBF24',  // yellow
          error: '#EF4444',    // red
        },
      },
    },
  },
  plugins: [],
}