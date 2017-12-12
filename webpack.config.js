const DefinePlugin = require('webpack').DefinePlugin
const path = require('path')

module.exports = env => {
  env = env || {}
  const filename = env.NODE_ENV === 'production' ? 'bulb.min.js' : 'bulb.js'

  return {
    entry: {
      fkit: './src/bulb.js'
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: filename,
      library: 'bulb',
      libraryTarget: 'var'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['babel-preset-es2015']
            }
          }
        }
      ]
    },
    plugins: [
      new DefinePlugin({
        DEVELOPMENT: env.NODE_ENV === 'development',
        PRODUCTION: env.NODE_ENV === 'production'
      })
    ]
  }
}
