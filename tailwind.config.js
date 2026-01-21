// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Keeps system dark mode from breaking your UI
  theme: {
    extend: {
      fontFamily: {
        // "Outfit" family for UI and General Text
        'main': ['outfit'],
        'main-md': ['outfit-medium'],
        'main-bold': ['outfit-bold'],

        // "Yanone Kaffeesatz" for Game Titles and Action Buttons
        'game': ['myfont'],
        'game-bold': ['myfont-bold'],
      },
    },
  },
  plugins: [],
};