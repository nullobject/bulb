import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const plugins = [
  babel(),
  commonjs(),
  resolve()
]

export default [
  {
    input: [
      'src/Bus.js',
      'src/Signal.js',
      'src/index.js'
    ],
    output: {
      dir: 'dist',
      format: 'cjs',
      esModule: false
    },
    plugins
  }, {
    input: 'src/index.js',
    output: [
      {
        file: pkg.module,
        format: 'esm'
      }
    ],
    plugins: plugins.concat(filesize())
  }, {
    input: 'src/index.js',
    output: {
      file: pkg.unpkg,
      format: 'iife',
      name: 'Bulb'
    },
    plugins: plugins.concat(filesize(), terser())
  }
]
