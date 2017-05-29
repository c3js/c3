// Karma configuration
// Generated on Wed Sep 30 2015 22:01:48 GMT+0900 (KST)
const istanbul = require('rollup-plugin-istanbul');
const path = require('path');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/d3/d3.min.js',
      'src/index.js',
      'spec/*-helper.js',
      'spec/*-spec.js',
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/index.js': ['rollup', 'sourcemap']
    },

    rollupPreprocessor: {
        plugins: [
            istanbul({
                exclude: ['spec/**/*.js'],
            })
        ],
        format: 'iife',               // Helps prevent naming collisions.
        moduleName: 'c3',             // Required for 'iife' format.
        sourceMap: 'inline',          // Sensible for testing.
        globals: {
            d3: 'd3',
        },
        external: ['d3']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage-istanbul'],


    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // logLevel: config.LOG_DEBUG,
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    browserNoActivityTimeout: 120000,
  })
}
