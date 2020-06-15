import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'htdocs/js/c3.js',
      name: 'c3',
      format: 'umd',
      banner: `/* @license C3.js v${pkg.version} | (c) C3 Team and other contributors | http://c3js.org/ */`,
      globals: { d3: 'd3' }
    },
    plugins: [typescript()],
    external: ['d3']
  }
]
