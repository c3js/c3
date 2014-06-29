module.exports = (grunt) ->
    require('load-grunt-tasks') grunt, pattern: 'grunt-contrib-*'

    grunt.initConfig
        watch:
          concat:
            tasks: 'concat'
            files: ['src/*.js']

        concat:
          dist:
            src: [
              'src/head.js',
              'src/c3.core.js',
              'src/c3.render.bar.js',
              'src/c3.draw.bar.js',
              'src/c3.axis.js',
              'src/tail.js'
            ]
            dest: 'dist/c3.js'

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
