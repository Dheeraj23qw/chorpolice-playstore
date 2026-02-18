module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';
  const plugins = [];

  // 1. Production-only: Strip consoles to boost Android performance
  if (isProduction) {
    plugins.push("transform-remove-console");
  }

  // 2. Reanimated MUST ALWAYS be the absolute last plugin in the array
  plugins.push("react-native-reanimated/plugin");

  return {
    presets: [
      // NativeWind v4 requires this jsxImportSource to enable the className prop
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: plugins,
  };
};