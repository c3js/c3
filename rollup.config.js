import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output: {
        format: 'umd',
        name: 'c3',
    },
    plugins: [babel({
        presets: [['es2015', {
            modules: false
        }]],
        plugins: [
            'external-helpers'
        ]
    })]
};
