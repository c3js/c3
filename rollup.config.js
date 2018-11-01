import babel from 'rollup-plugin-babel';
import pkg from './package.json'

export default {
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
};
