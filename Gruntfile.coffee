module.exports = (grunt) ->
    require('load-grunt-tasks') grunt, pattern: ['grunt-contrib-*', 'grunt-sass', 'grunt-karma']





    grunt.initConfig
        watch:
          concat:
            tasks: 'concat'
            files: ['src/*.js']
          sass:
            tasks: 'sass'
            files: ['src/scss/*.scss']

        concat:
          axis:
            options:
                process: (src, filepath) ->
                  if filepath.indexOf('axis/index')!=-1
                    src= "import {CLASS,isValue,isFunction,isString,isUndefined,isDefined,ceil10,asHalfPixel,diffDomain,isEmpty,notEmpty,getOption,hasValue,sanitise,getPathBox, ChartInternal} from './chartinternal.js';"+'\n'+src;

                  if filepath.indexOf('axis/axis')!=-1
                    src = src + 'export {Axis};'+'\n'+'export default Axis;';
                  return src
            src: [
              'src/axis/index.js',
              'src/axis/c3.axis.js',
              'src/axis/axis.js',
            ]
            dest: 'es6_modules/axis.js'

          chart:
            options:
                process: (src, filepath) ->
                  if filepath.indexOf('chart/index')!=-1
                    src= "import {CLASS,isValue,isFunction,isString,isUndefined,isDefined,ceil10,asHalfPixel,diffDomain,isEmpty,notEmpty,getOption,hasValue,sanitise,getPathBox, ChartInternal} from './chartinternal.js';"+'\n'+src;

                  if filepath.indexOf('chart/api.tooltip')!=-1
                    src = src + 'export {Chart};'+'\n'+'export default Chart;';
                  return src
            src: [
              'src/chart/index.js',
              'src/chart/api.focus.js',
              'src/chart/api.show.js',
              'src/chart/api.zoom.js',
              'src/chart/api.load.js',
              'src/chart/api.flow.js',
              'src/chart/api.selection.js',
              'src/chart/api.transform.js',
              'src/chart/api.group.js',
              'src/chart/api.grid.js',
              'src/chart/api.region.js',
              'src/chart/api.data.js',
              'src/chart/api.category.js',
              'src/chart/api.color.js',
              'src/chart/api.x.js',
              'src/chart/api.axis.js',
              'src/chart/api.legend.js',
              'src/chart/api.chart.js',
              'src/chart/api.tooltip.js'
            ]
            dest: 'es6_modules/chart.js'

          chartinternal:
            options:
                process: (src, filepath) ->
                  if filepath.indexOf('chartinternal/index')!=-1
                    src= "import d3 from 'd3';"+'\n'+src;
                    src= "import {Axis} from './axis.js';"+'\n'+src;

                  if filepath.indexOf('chartinternal/ua')!=-1
                    src = src + 'export {CLASS,isValue,isFunction,isString,isUndefined,isDefined,ceil10,asHalfPixel,diffDomain,isEmpty,notEmpty,getOption,hasValue,sanitise,getPathBox, ChartInternal};'+'\n'+'export default ChartIntenal;'
                  return src
            src: [
              'src/chartinternal/index.js',
              'src/chartinternal/config.js',
              'src/chartinternal/scale.js',
              'src/chartinternal/domain.js',
              'src/chartinternal/data.js',
              'src/chartinternal/data.convert.js',
              'src/chartinternal/data.load.js',
              'src/chartinternal/category.js',
              'src/chartinternal/interaction.js',
              'src/chartinternal/size.js',
              'src/chartinternal/shape.js',
              'src/chartinternal/shape.line.js',
              'src/chartinternal/shape.bar.js',
              'src/chartinternal/text.js',
              'src/chartinternal/type.js',
              'src/chartinternal/grid.js',
              'src/chartinternal/tooltip.js',
              'src/chartinternal/legend.js',
              'src/chartinternal/title.js',
              'src/chartinternal/clip.js',
              'src/chartinternal/arc.js',
              'src/chartinternal/region.js',
              'src/chartinternal/drag.js',
              'src/chartinternal/selection.js',
              'src/chartinternal/subchart.js',
              'src/chartinternal/zoom.js',
              'src/chartinternal/color.js',
              'src/chartinternal/format.js',
              'src/chartinternal/cache.js',
              'src/chartinternal/class.js',
              'src/chartinternal/util.js',
              'src/chartinternal/transform.js',
              'src/chartinternal/flow.js',
              'src/chartinternal/ua.js'
            ]
            dest: 'es6_modules/chartinternal.js'

          dist:
            options:
              process: (src, filepath) ->
                if filepath != 'src/head.js' && filepath != 'src/tail.js'
                  lines = []
                  src.split('\n').forEach (line) ->
                    lines.push( (if line.length > 0 then '    ' else '') + line)
                  src = lines.join('\n')
                return src
            src: [
              'src/head.js',


              'src/axis/index.js',
              'src/axis/c3.axis.js',
              'src/axis/axis.js',

              'src/chartinternal/index.js',
              'src/chartinternal/config.js',
              'src/chartinternal/scale.js',
              'src/chartinternal/domain.js',
              'src/chartinternal/data.js',
              'src/chartinternal/data.convert.js',
              'src/chartinternal/data.load.js',
              'src/chartinternal/category.js',
              'src/chartinternal/interaction.js',
              'src/chartinternal/size.js',
              'src/chartinternal/shape.js',
              'src/chartinternal/shape.line.js',
              'src/chartinternal/shape.bar.js',
              'src/chartinternal/text.js',
              'src/chartinternal/type.js',
              'src/chartinternal/grid.js',
              'src/chartinternal/tooltip.js',
              'src/chartinternal/legend.js',
              'src/chartinternal/title.js',
              'src/chartinternal/clip.js',
              'src/chartinternal/arc.js',
              'src/chartinternal/region.js',
              'src/chartinternal/drag.js',
              'src/chartinternal/selection.js',
              'src/chartinternal/subchart.js',
              'src/chartinternal/zoom.js',
              'src/chartinternal/color.js',
              'src/chartinternal/format.js',
              'src/chartinternal/cache.js',
              'src/chartinternal/class.js',
              'src/chartinternal/util.js',
              'src/chartinternal/transform.js',
              'src/chartinternal/flow.js',
              'src/chartinternal/ua.js',

              'src/chart/index.js',
              'src/chart/api.focus.js',
              'src/chart/api.show.js',
              'src/chart/api.zoom.js',
              'src/chart/api.load.js',
              'src/chart/api.flow.js',
              'src/chart/api.selection.js',
              'src/chart/api.transform.js',
              'src/chart/api.group.js',
              'src/chart/api.grid.js',
              'src/chart/api.region.js',
              'src/chart/api.data.js',
              'src/chart/api.category.js',
              'src/chart/api.color.js',
              'src/chart/api.x.js',
              'src/chart/api.axis.js',
              'src/chart/api.legend.js',
              'src/chart/api.chart.js',
              'src/chart/api.tooltip.js',


              'src/tail.js',
              'src/polyfill.js'

            ]
            dest: 'c3.js'

        jshint:
          c3: 'c3.js'
          spec: 'spec/*.js'
          options:
            reporter: require('jshint-stylish')
            jshintrc: '.jshintrc'

        karma:
          unit:
            configFile: 'karma.conf.js'

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
    grunt.registerTask 'test', ['karma']
    grunt.registerTask 'build', ['concat:dist', 'sass']
    grunt.registerTask 'minify', ['cssmin', 'uglify']
    grunt.registerTask 'default', ['lint', 'build', 'test', 'minify']
    # grunt.registerTask 'build_modules', ['concat:axis', 'concat:chart', 'concat:chartinternal']
