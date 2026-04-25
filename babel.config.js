module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === "production";

  return {
    presets: [
      // ✅ Standard Expo preset
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // ✅ Mutes all console.logs only in production builds
      ...(isProduction ? ["transform-remove-console"] : []),

      // ✅ MUST ALWAYS BE LAST
      "react-native-reanimated/plugin",
    ],
  };
};
