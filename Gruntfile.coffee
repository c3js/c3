module.exports = (grunt) ->
    require('load-grunt-tasks') grunt, pattern: ['grunt-contrib-*', 'grunt-sass']

    grunt.initConfig

        jshint:
          c3: 'src/**/*.js'
          spec: 'spec/**/*.js'
          options:
            reporter: require('jshint-stylish')
            jshintrc: '.jshintrc'

        uglify:
          c3:
            files:
              'c3.min.js': 'c3.js'

        cssmin:
          c3:
            src: 'c3.css'
            dest: 'c3.min.css'

    grunt.registerTask 'lint', ['jshint']
    grunt.registerTask 'minify', ['cssmin', 'uglify']
