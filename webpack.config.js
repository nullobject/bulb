var DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
  entry: {
    bulb: './src/bulb.js'
  },
  output: {
    path:          __dirname + '/dist',
    filename:      '[name].js',
    library:       'bulb',
    libraryTarget: 'var'
  },
  plugins: [
    new DefinePlugin({
      DEVELOPMENT: process.env.NODE_ENV === 'development' || true,
      PRODUCTION:  process.env.NODE_ENV === 'production' || false
    })
  ]
};
