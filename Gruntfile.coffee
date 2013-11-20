
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

    grunt.registerTask 'default', ['jshint', 'jasmine']
