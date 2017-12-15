import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import {minify} from 'uglify-es'

const filename = process.env.NODE_ENV === 'production' ? 'bulb.min.js' : 'bulb.js'

const config = {
  input: 'src/bulb',
  output: {
    file: 'dist/' + filename,
    format: 'iife'
  },
  name: 'bulb',
  plugins: [resolve()]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify({}, minify))
}

export default config
