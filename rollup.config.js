import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

const name = process.env.BUILD === 'production' ? 'bulb.min.js' : 'bulb.js'
const plugins = [buble(), resolve(), commonjs()]

if (process.env.BUILD === 'production') {
  plugins.push(uglify())
}

export default {
  input: 'src/bulb',
  output: {
    file: 'dist/' + name,
    format: 'iife'
  },
  name: 'bulb',
  plugins: plugins
}
