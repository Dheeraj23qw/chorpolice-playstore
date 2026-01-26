// tailwind.config.js
module.exports = {
  // Add "./screens/**/*.{js,jsx,ts,tsx}" to the list below
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}" ,
    "./modal/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        'main': ['outfit'],
        'main-md': ['outfit-medium'],
        'main-bold': ['outfit-bold'],
        'game': ['myfont'],
        'game-bold': ['myfont-bold'],
      },
    },
  },
  plugins: [],
};