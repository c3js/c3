const path = require('path');

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'browserify'],
    files: [
      'c3.css',
      'spec/*-helper.js',
      'spec/*-spec.js'
    ],
    preprocessors: {
      'spec/*.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [['babelify', { presets: ['env'], plugins: ['istanbul'] }]]
    },
    reporters: ['spec', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary']
    },
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true,
    browserNoActivityTimeout: 120000,
  })
};
