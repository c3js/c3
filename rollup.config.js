import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output: {
        name: 'c3',
        format: 'umd'
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
