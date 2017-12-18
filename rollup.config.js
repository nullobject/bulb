import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import {minify} from 'uglify-es'

const plugins = [
  babel({exclude: '**/node_modules/**'}),
  resolve()
]

export default [
  // UMD and ES versions.
  {
    input: 'src/bulb',
    output: [
      {file: pkg.main, format: 'umd', name: 'bulb'},
      {file: pkg.module, format: 'es'}
    ],
    plugins
  },

  // Browser minified version.
  {
    input: 'src/bulb',
    output: [
      {file: pkg.unpkg, format: 'umd', name: 'bulb'}
    ],
    plugins: plugins.concat([uglify({}, minify)])
  }
]
