const path = require('path')

module.exports = config =>
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: ['htdocs/css/c3.css', 'src/**/*.ts', 'spec/**/*'],
    preprocessors: {
      'spec/**/*.ts': ['karma-typescript'],
      'src/**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: {
      coverageOptions: {
        exclude: /spec/
      },
      reports: {
        lcov: 'coverage'
      }
    },
    reporters: ['spec', 'karma-typescript'],
    browsers: ['Chrome'],
    singleRun: true
  })
