/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🔍 FILE SCANNING (VERY IMPORTANT)
  // Tailwind will ONLY generate styles used in these files.
  // If you forget a folder → styles WON'T apply there.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", // Expo Router screens
    "./components/**/*.{js,jsx,ts,tsx}", // Reusable UI components
    "./screens/**/*.{js,jsx,ts,tsx}", // (Optional) if you use screens folder
    "./modal/**/*.{js,jsx,ts,tsx}", // Modals like BettingModal
    "./hooks/**/*.{js,jsx,ts,tsx}", // Custom hooks (sometimes contain UI)
    "./features/**/*.{js,jsx,ts,tsx}", // Redux / feature modules
    "./utils/**/*.{js,jsx,ts,tsx}", // Utility-based UI (rare but safe)
  ],

  // ⚡ NativeWind preset → Enables Tailwind in React Native
  // Without this, className WON'T work in RN
  presets: [require("nativewind/preset")],

  // 🌙 Dark mode strategy
  // "class" means you control theme manually (better for apps)
  darkMode: "class",

  theme: {
    extend: {
      /* 🎨 COLORS (Your Design System) */
      colors: {
        // Primary brand color (used in buttons, highlights)
        primary: "#6366f1",

        // Dark variant for pressed / hover states
        primaryDark: "#4338ca",

        // Success states (wins, rewards, etc.)
        success: "#22c55e",
        successDark: "#15803d",
        successMuted: "#14532d",

        // Global background color (used everywhere)
        background: "#09090b",
      },

      /* 🔤 FONTS (MUST MATCH useFonts keys exactly) */
      fontFamily: {
        // Main UI font
        main: ["outfit"],

        // Medium weight
        "main-md": ["outfit-medium"],

        // Bold headings
        "main-bold": ["outfit-bold"],

        // Game-style font (fun UI)
        game: ["myfont"],
        "game-bold": ["myfont-bold"],
      },

      /* ✨ ANIMATIONS (SAFE FOR REACT NATIVE) */
      animation: {
        // Slow pulse animation (buttons, alerts, glow effects)
        "pulse-slow": "pulse 3s ease-in-out infinite",

        // Small shake/wiggle animation (feedback)
        wiggle: "wiggle 0.3s ease-in-out",
      },

      /* 🎬 KEYFRAMES (RN SAFE FORMAT) */
      keyframes: {
        wiggle: {
          // IMPORTANT:
          // React Native uses transform ARRAY, not string like web
          "0%, 100%": { transform: [{ rotate: "-3deg" }] },
          "50%": { transform: [{ rotate: "3deg" }] },
        },
      },
    },
  },

  // 🔌 Plugins (empty for now, can add later if needed)
  plugins: [],
};
