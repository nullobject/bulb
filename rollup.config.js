import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

export default {
  input: 'src/bulb',
  output: {
    file: 'dist/bulb.js',
    format: 'iife'
  },
  name: 'bulb',
  plugins: [
    buble(),
    resolve(),
    commonjs(),
    uglify()
  ]
}
