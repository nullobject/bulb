import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import {uglify} from 'rollup-plugin-uglify'

const plugins = [
  babel({exclude: '**/node_modules/**'}),
  resolve(),
  filesize()
]

export default [
  // UMD and ES versions.
  {
    input: 'src/index.js',
    output: [
      {file: pkg.main, format: 'umd', name: 'bulb'},
      {file: pkg.module, format: 'es'}
    ],
    plugins
  },

  // Browser minified version.
  {
    input: 'src/index.js',
    output: [
      {file: pkg.unpkg, format: 'umd', name: 'bulb'}
    ],
    plugins: plugins.concat([uglify()])
  }
]
