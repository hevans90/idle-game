const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.output.scriptType = 'text/javascript';
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.(frag|glsl|vs|fs)$/,
      loader: 'ts-shader-loader',
    },
    {
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    },
  ];
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      timers: require.resolve('timers-browserify'),
    },
  };
  return config;
});
