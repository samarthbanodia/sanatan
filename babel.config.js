// NativeWind v4 + Expo SDK 56.
// - `jsxImportSource: nativewind` + the `nativewind/babel` preset enable className styling.
// - The Reanimated/worklets babel plugin is auto-configured by babel-preset-expo in SDK 56,
//   so it must NOT be added manually here (doing so double-registers it).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
