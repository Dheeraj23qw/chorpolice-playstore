module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      // ✅ Standard Expo preset (handles Reanimated and NativeWind automatically in SDK 52+)
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // This is a PRESET in v4.1+
    ],
    plugins: [
      // ✅ MUST ALWAYS BE LAST (keeping for experimental v4 support)
      "react-native-reanimated/plugin",
    ],
  };
};
