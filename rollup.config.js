import pkg from './package.json'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import {minify} from 'uglify-es'

export default [
  // UMD and ES versions.
  {
    input: 'src/bulb',
    output: [
      {file: pkg.main, format: 'umd', name: 'bulb'},
      {file: pkg.module, format: 'es'}
    ],
    plugins: [resolve()]
  },

  // Browser minified version.
  {
    input: 'src/bulb',
    output: [
      {file: pkg.unpkg, format: 'umd', name: 'bulb'}
    ],
    plugins: [resolve(), uglify({}, minify)]
  }
]
