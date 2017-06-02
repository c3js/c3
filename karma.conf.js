module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'browserify'],
    files: [
      'node_modules/d3/d3.min.js',
      'c3.css',
      'spec/*-helper.js',
      'spec/*-spec.js',
    ],
    preprocessors: {
      'spec/c3-helper.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [['babelify', { presets: ['es2015'], plugins: ['istanbul'] }]]
    },
    reporters: ['spec', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary']
    },
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: true,
    browserNoActivityTimeout: 120000,
  })
};
