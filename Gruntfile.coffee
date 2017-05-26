module.exports = (grunt) ->
    require('load-grunt-tasks') grunt, pattern: ['grunt-contrib-*', 'grunt-sass']

    grunt.initConfig
        watch:
          sass:
            tasks: 'sass'
            files: ['src/scss/*.scss']

        jshint:
          c3: 'c3.js'
          spec: 'spec/*.js'
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

        sass:
          options:
            sourcemap: 'none'
          c3:
            files:
              'c3.css': 'src/scss/main.scss'

    grunt.registerTask 'lint', ['jshint']
    grunt.registerTask 'build', ['concat', 'sass']
    grunt.registerTask 'minify', ['cssmin', 'uglify']
