module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Required for your "react-native-reanimated" dependency
      "react-native-reanimated/plugin",
    ],
  };
};