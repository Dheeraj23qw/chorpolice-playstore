const {
  createRunOncePlugin,
  withAndroidStyles,
  AndroidConfig,
} = require("@expo/config-plugins");

/**
 * This function modifies the Android styles.xml to explicitly 
 * disable the system's "Force Dark" feature.
 */
function setForceDarkModeToFalse(styles) {
  // We apply this to the main AppTheme to ensure it covers the whole app
  styles = AndroidConfig.Styles.assignStylesValue(styles, {
    add: true,
    parent: AndroidConfig.Styles.getAppThemeLightNoActionBarGroup(),
    name: "android:forceDarkAllowed",
    value: "false",
  });

  return styles;
}

const withDisableForcedDarkModeAndroid = (config) => {
  return withAndroidStyles(config, (config) => {
    config.modResults = setForceDarkModeToFalse(config.modResults);
    return config;
  });
};

// Exporting the plugin so app.json can pick it up
module.exports = createRunOncePlugin(
  withDisableForcedDarkModeAndroid,
  "disable-forced-dark-mode",
  "1.0.0"
);