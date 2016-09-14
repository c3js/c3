/**
 * Rollup Config
 */

import babel from 'rollup-plugin-babel';

export default {
    entry: 'es6_modules/rollup.entry.js',
    format: 'umd',
    moduleName: 'c3',
    external: ['d3'],
    globals: {
        d3: 'd3',
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ],
    dest: 'c3.js'
};
