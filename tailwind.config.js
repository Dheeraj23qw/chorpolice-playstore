// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./modal/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  

  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom Branding for your Rate Us/Spin components
        primary: {
          DEFAULT: "#6366f1", // indigo-500
          dark: "#4338ca",    // indigo-700
        },
        success: {
          DEFAULT: "#22c55e", // green-500
          dark: "#15803d",    // green-700
          muted: "#14532d",   // green-950
        },
        background: "#09090b", // zinc-950
      },
      fontFamily: {
        'main': ['outfit'],
        'main-md': ['outfit-medium'],
        'main-bold': ['outfit-bold'],
        'game': ['myfont'],
        'game-bold': ['myfont-bold'],
      },
      // Added Animation features for your Spin Button
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
};