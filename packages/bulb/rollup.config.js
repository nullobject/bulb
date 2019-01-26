import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'

import pkg from './package.json'

const plugins = [
  babel({ exclude: '**/node_modules/**' }),
  resolve(),
  filesize()
]

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins
  }, {
    input: 'src/index.js',
    output: [
      {
        file: pkg.unpkg,
        format: 'iife',
        name: 'bulb',
        extend: 'bulb'
      }
    ],
    plugins: plugins.concat([uglify()])
  }
]
