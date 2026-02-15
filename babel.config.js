module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

  const plugins = [
    // Required for Reanimated (must be listed last usually)
    "react-native-reanimated/plugin",
  ];

  // Only strip consoles when building for production
  if (isProduction) {
    plugins.push("transform-remove-console");
  }

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: plugins,
  };
};