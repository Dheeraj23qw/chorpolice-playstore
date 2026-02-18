/** @type {import('tailwindcss').Config} */
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
        primary: {
          DEFAULT: "#6366f1", 
          dark: "#4338ca",    
        },
        success: {
          DEFAULT: "#22c55e", 
          dark: "#15803d",    
          muted: "#14532d",   
        },
        background: "#09090b", 
      },
      fontFamily: {
        // Ensure these strings match your useFonts hook keys exactly!
        'main': ['outfit'],
        'main-md': ['outfit-medium'],
        'main-bold': ['outfit-bold'],
        'game': ['myfont'],
        'game-bold': ['myfont-bold'],
      },
      // Note: These will work on Web immediately. 
      // For Android, ensure you are using NativeWind v4.1+
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