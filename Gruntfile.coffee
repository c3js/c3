
module.exports = (grunt) ->

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

    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-contrib-jasmine'

    grunt.registerTask 'default', ['jshint', 'jasmine']
