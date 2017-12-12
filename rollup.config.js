import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

const filename = process.env.BUILD === 'production' ? 'bulb.min.js' : 'bulb.js'
const plugins = [commonjs(), babel({exclude: 'node_modules/**'}), resolve()]

if (process.env.BUILD === 'production') {
  plugins.push(uglify())
}

export default {
  input: 'src/bulb',
  output: {
    file: 'dist/' + filename,
    format: 'iife'
  },
  name: 'bulb',
  plugins
}
