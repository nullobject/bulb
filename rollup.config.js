import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

const name = process.env.BUILD === 'production' ? 'bulb.min.js' : 'bulb.js'
const plugins = [babel({ exclude: 'node_modules/**' }), resolve(), commonjs()]

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
