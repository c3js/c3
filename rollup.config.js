import babel from 'rollup-plugin-babel';
import modify from 'rollup-plugin-modify';
import pkg from './package.json'

export default [{
    input: 'src/index.js',
    output: {
        file: 'htdocs/js/c3.js',
        name: 'c3',
        format: 'umd',
        banner: `/* @license C3.js v${pkg.version} | (c) C3 Team and other contributors | http://c3js.org/ */`,
        globals:{
            d3:'d3'
        }
    },
    plugins: [babel({
        presets: [['@babel/preset-env', {
            modules: false
        }]]
    })],
    external: ['d3'],
},{
    input: 'src/index.js',
    output: {
        file: 'htdocs/js/c3.esm.js',
        name: 'c3',
        format: 'es',
        banner: `/* @license C3.js v${pkg.version} | (c) C3 Team and other contributors | http://c3js.org/ */`,
        intro: `import * as d3 from 'd3';`,
    },
    plugins: [modify({
        find: /\$\$\.d3 =.+?;/,
        replace: '$$.d3 = d3;'
    })],
    external: ['d3'],
}];
