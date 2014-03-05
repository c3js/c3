module.exports = (grunt) ->
    require('load-grunt-tasks') grunt, pattern: 'grunt-contrib-*'

    grunt.initConfig
        jshint:
          c3: 'c3.js'
          spec: 'spec/*.js'
          options:
            jshintrc: '.jshintrc'

        jasmine:
          c3:
            src: 'c3.js'
            options:
              specs: 'spec/*.js'

        uglify:
          c3:
            files:
              'c3.min.js': 'c3.js'

    grunt.registerTask 'default', ['jshint', 'jasmine', 'uglify']
