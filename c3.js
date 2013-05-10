(function (window) {

    window.c3 = {}

    /* 
     * Generate chart according to config
     */
    c3.generate = function (config) {

        var c3 = { data : {} },
            cache = {}

        /*-- Handle Config --*/

        function checkConfig (key, message) {
            if ( ! (key in config)) throw Error(message)
        }

        function getConfig (keys, defaultValue) {
            var target = config
            for (var i = 0; i < keys.length; i++) {
                if ( ! (keys[i] in target)) return defaultValue
                target = target[keys[i]]
            }
            return target
        }

        // bindto - id to bind the chart
        checkConfig('bindto', 'bindto is required in config')

        var __size_width = getConfig(['size','width'], 640),
            __size_height = getConfig(['size','height'], 480)

        // data - data configuration
        checkConfig('data', 'data is required in config')

        var __data_x = getConfig(['data','x'], 'x'),
            __data_x_format = getConfig(['data','x_format'], '%Y-%m-%d'),
            __data_id_converter = getConfig(['data','id_converter'], function(id){ return id; }),
            __data_names = getConfig(['data','names'], {}),
            __data_types = getConfig(['data','types'], {}),
            __data_regions = getConfig(['data','regions'], {}),
            __data_colors = getConfig(['data','colors'], {}),
            __data_selection_enabled = getConfig(['data','selection','enabled'], false),
            __data_selection_grouped = getConfig(['data','selection','grouped'], false),
            __data_selection_isselectable = getConfig(['data','selection','isselectable'], function(d){return true})

        // subchart
        var __subchart_show = getConfig(['subchart','show'], true),
            __subchart_size_height = __subchart_show ? getConfig(['subchart','size','height'], 60) : 0,
            __subchart_default = getConfig(['subchart','default'], null)

        // color
        var __color_pattern = getConfig(['color','pattern'], null)

        // legend
        var __legend_show = getConfig(['legend','show'], true),
            __legend_item_width = getConfig(['legend','item','width'], 80), // TODO: auto
            __legend_item_onclick = getConfig(['legend','item','onclick'], function(){})

        // axis
        var __axis_x_type = getConfig(['axis','x','type'], 'indexed'),
            __axis_x_categories = getConfig(['axis','x','categories'], ['hoge']),
            __axis_x_tick_centered = getConfig(['axis','x','tick','centered'], false),
            __axis_y_max = getConfig(['axis','y','max'], null),
            __axis_y_min = getConfig(['axis','y','min'], null),
            __axis_y_center = getConfig(['axis','y','center'], null),
            __axis_y_text = getConfig(['axis','y','text'], null),
            __axis_y_rescale = getConfig(['axis','y','rescale'], true)

        // grid
        var __grid_x_show = getConfig(['grid','x','show'], false),
            __grid_x_type = getConfig(['grid','x','type'], 'tick'),
            __grid_x_lines = getConfig(['grid','x','lines'], null),
            __grid_y_show = getConfig(['grid','y','show'], false),
            __grid_y_type = getConfig(['grid','y','type'], 'tick'),
            __grid_y_lines = getConfig(['grid','y','lines'], null)

        // point - point of each data
        var __point_show = getConfig(['point','show'], false),
            __point_r = __point_show ? getConfig(['point','r'], 2.5) : 0,
            __point_focus_line_enabled = getConfig(['point','focus','line','enabled'], false),
            __point_focus_expand_enabled = getConfig(['point','focus','expand','enabled'], __point_show),
            __point_focus_expand_r = getConfig(['point','focus','expand','r'], __point_focus_expand_enabled ? 4 : __point_r),
            __point_select_r = getConfig(['point','focus','select','r'], 8),
            __point_onclick = getConfig(['point','onclick'], function(){}),
            __point_onselected = getConfig(['point','onselected'], function(){}),
            __point_onunselected = getConfig(['point','onunselected'], function(){})

        // region - region to change style
        var __regions = getConfig(['regions'], null)

        // tooltip - show when mouseover on each data
        var __tooltip_contents = getConfig(['tooltip','contents'], function(d) {
            var date = isTimeSeries ? d[0].x.getFullYear() + '.' + (d[0].x.getMonth()+1) + '.' + d[0].x.getDate() : isCategorized ? category(d[0].x) : d[0].x,
                text = "<table class='tooltip'><tr><th colspan='2'>" + date + "</th></tr>"
            for (var i = 0; i < d.length; i++){
                var value = (typeof d[i].value !== 'undefined') ? (Math.round(d[i].value*100)/100).toFixed(2) : '-'
                text += "<tr><td>" + d[i].name + "</td><td class='value'>" + value + "</td></tr>"
            }
            return text + "</table>"
        })

        /*-- Set Variables --*/

        var clipId = config.bindto.replace('#','') + '-clip',
            clipPath = "url(#" + clipId + ")"

        var isTimeSeries = (__axis_x_type === 'timeseries'),
            isCategorized = (__axis_x_type === 'categorized')

        var dragStart = null, dragging = false

        var legendHeight = __legend_show ? 40 : 0

        var customTimeFormat = timeFormat([
            [d3.time.format("%Y/%-m/%-d"), function() { return true }],
            [d3.time.format("%-m/%-d"), function(d) { return d.getMonth() }],
            [d3.time.format("%-m/%-d"), function(d) { return d.getDate() != 1 }],
            [d3.time.format("%-m/%-d"), function(d) { return d.getDay() && d.getDate() != 1 }],
            [d3.time.format("%I %p"), function(d) { return d.getHours() }],
            [d3.time.format("%I:%M"), function(d) { return d.getMinutes() }],
            [d3.time.format(":%S"), function(d) { return d.getSeconds() }],
            [d3.time.format(".%L"), function(d) { return d.getMilliseconds() }]
        ])
        function timeFormat(formats) {
            return function(date) {
                var i = formats.length - 1, f = formats[i]
                while (!f[1](date)) f = formats[--i]
                return f[0](date)
            }
        }

        /*-- Set Chart Params --*/

        var margin_bottom = 20 + __subchart_size_height + legendHeight,
            margin2_top = __size_height - __subchart_size_height - legendHeight,
            margin2_bottom = 20 + legendHeight,
            margin3_top = __size_height - legendHeight,
            margin = {top: 10, right: 20, bottom: margin_bottom, left: 40},
            margin2 = {top: margin2_top, right: 20, bottom: margin2_bottom, left: 40},
            margin3 = {top: margin3_top, right: 20, bottom: 0, left: 40},
            width = __size_width - margin.left - margin.right,
            height = __size_height - margin.top - margin.bottom,
            height2 = __size_height - margin2.top - margin2.bottom,
            height3 = __size_height - margin3.top - margin3.bottom

        var parseDate = d3.time.format(__data_x_format).parse

        var x = ((isTimeSeries) ? d3.time.scale() : d3.scale.linear()).range([0, width]),
            x2 = ((isTimeSeries) ? d3.time.scale() : d3.scale.linear()).range([0, width]),
            y = d3.scale.linear().range([height, 10]),
            y2 = d3.scale.linear().range([height2, 10])

        // TODO: Enable set position
        var xAxis = isCategorized ? categoryAxis() : d3.svg.axis(),
            xAxis2 = isCategorized ? categoryAxis() : d3.svg.axis(),
            yAxis = d3.svg.axis()

        xAxis.scale(x).orient("bottom")
        xAxis2.scale(x2).orient("bottom")
        yAxis.scale(y).orient("left")

        if (isTimeSeries) {
            xAxis.tickFormat(customTimeFormat)
            // TODO: fix
            xAxis.tickOffset = function () {
                return 0
            };
            // TODO: fix
            xAxis2.tickOffset = function () {
                return 0
            }
        }
        if (isCategorized) {
            xAxis.categories(__axis_x_categories).tickCentered(__axis_x_tick_centered)
            xAxis2.categories(__axis_x_categories).tickCentered(__axis_x_tick_centered)
        }

        // Use custom scale if needed
        if (isCategorized) {
            // TODO: fix this
            // TODO: fix x_grid
            (function () {
                var _x = x, _x2 = x2
                var keys = Object.keys(x), key, i
                x = function(d){ return _x(d) + xAxis.tickOffset() }
                x2 = function(d){ return _x2(d) + xAxis2.tickOffset() }
                for (i = 0; i < keys.length; i++) {
                    key = keys[i]
                    x[key] = _x[key]
                    x2[key] = _x2[key]
                }
                x.domain = function (domain) {
                    if (!arguments.length) {
                        var domain = _x.domain()
                        domain[1]++
                        return domain
                    }
                    _x.domain(domain)
                    return x
                }
            })()
        }

        // For main region
        var lineOnMain = function (d) {
            return isLineType(d) ? lineWithRegions(d.values, __data_regions[d.id]) : ""//"M 0 0"
        }

        // For brush region
        var lineOnSub = (function () {
            var line = d3.svg.line()
                .x(function(d){ return x2(d.x) })
                .y(function(d){ return y2(d.value) })
            return function (d) {
                return isLineType(d) ? line(d.values) : ""//"M 0 0"
            }
        })()

        // For region
        var regionStart = function (d) {
            return ('start' in d) ? x(d.start) : 0
        }
        var regionWidth = function (d) {
            var start = ('start' in d) ? x(d.start) : 0,
                end = ('end' in d) ? x(d.end) : width,
                w = end - start
            return (w < 0) ? 0 : w
        }

        // Define color
        var color = generateColor(__data_colors, __color_pattern)

        // Define svgs
        var svg = d3.select(config.bindto).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        svg.append("defs")

        svg.select("defs").append("clipPath")
            .attr("id", clipId)
          .append("rect")
            .attr("width", width)
            .attr("height", height)

        svg.select("defs").append("clipPath")
            .attr("id", "xaxis-clip")
          .append("rect")
            .attr("x", -1)
            .attr("y", -1)
            .attr("width", width + 2)
            .attr("height", 40)

        // Define regions
        var main = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        var context = null
        if (__subchart_show) {
            context = svg.append("g")
                .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
        }
        var legend = null
        if (__legend_show) {
            legend = svg.append("g")
                .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")")
        }

        // Define tooltip
        var tooltip = d3.select(config.bindto)
              .style("position", "relative")
            .append("div")
              .style("position", "absolute")
              .style("width", "30%") // TODO: cul actual width when show
              .style("z-index", "10")
              .style("visibility", "hidden")

        /*-- Define Functions --*/

        //-- Domain --//

        function getYDomainMin (targets) {
            return (__axis_y_min !== null) ? __axis_y_min : d3.min(targets, function(t) { return d3.min(t.values, function(v) { return v.value }) })
        }
        function getYDomainMax (targets) {
            return (__axis_y_max !== null) ? __axis_y_max : d3.max(targets, function(t) { return d3.max(t.values, function(v) { return v.value }) })
        }
        function getYDomain (targets) {
            var yDomainMin = getYDomainMin(targets),
                yDomainMax = getYDomainMax(targets),
                padding = Math.abs(yDomainMax - yDomainMin) * 0.1
            if (__axis_y_center !== null) {
                yDomainAbs = Math.max(Math.abs(yDomainMin), Math.abs(yDomainMax))
                yDomainMax = yDomainAbs - __axis_y_center
                yDomainMin = __axis_y_center - yDomainAbs
            }
            return [yDomainMin-padding, yDomainMax+padding]
        }
        function getXDomainRatio () {
            if (brush.empty()) return 1
            var domain = x2.domain(), extent = brush.extent()
            return (domain[1] - domain[0]) / (extent[1] - extent[0])
        }

        //-- Cache --//

        function hasCaches (ids) {
            for (var i = 0; i < ids.length; i++){
                if ( ! (ids[i] in cache)) return false
            }
            return true
        }
        function addCache (id, target) {
            cache[id] = target
        }
        function getCaches (ids) {
            var targets = []
            for (var i = 0; i < ids.length; i++){
                if (ids[i] in cache) targets.push(cache[ids[i]])
            }
            return targets
        }

        //-- Data --//

        function convertRowsToData (rows) {
            var keys = rows[0], new_row = {}, new_rows = [], i, j
            for (i = 1; i < rows.length; i++) {
                new_row = {}
                for (j = 0; j < rows[i].length; j++) {
                    new_row[keys[j]] = rows[i][j]
                }
                new_rows.push(new_row)
            }
            return new_rows
        }
        function convertColumnsToData (columns) {
            var new_rows = [], i, j, key
            for (i = 0; i < columns.length; i++) {
                key = columns[i][0]
                for (j = 1; j < columns[i].length; j++) {
                    if (typeof new_rows[j-1] === 'undefined') {
                        new_rows[j-1] = {}
                    }
                    new_rows[j-1][key] = columns[i][j]
                }
            }
            return new_rows
        }
        function convertDataToTargets (data) {
            var ids = d3.keys(data[0]).filter(function(key){ return key !== __data_x })
            var targets, i = 0

            data.forEach(function(d) {
                d.x = (isTimeSeries) ? parseDate(d[__data_x]) : i++
                if (firstDate === null) firstDate = new Date(d.x)
                lastDate = new Date(d.x)
            })

            targets = ids.map(function(id,i) {
                var convertedId = __data_id_converter(id)
                return {
                    id : convertedId,
                    id_org : id,
                    values : data.map(function(d) {
                        return {x: d.x, value: +d[id], id: convertedId}
                    })
                }
            })

            // cache as original id keyed
            targets.forEach(function(d){
                addCache(d.id_org, d)
            })

            return targets
        }
        function maxDataCount () {
            return d3.max(c3.data.targets, function(t){ return t.values.length })
        }
        function getTargetIds (targets) {
            targets = (typeof targets === 'undefined') ? c3.data.targets : targets
            return targets.map(function(d){ return d.id; })
        }
        function hasTarget (id) {
            var ids = getTargetIds(), i
            for (i = 0; i < ids.length; i++) {
                if (ids[i] === id) return true
            }
            return false
        }
        function getTargetsNum (filter) {
            if (typeof c3.data.targets === 'undefined') return 0
            return typeof filter !== 'undefined' ? c3.data.targets.filter(filter).length : c3.data.targets.length;
        }
        function category (i) {
            return i < __axis_x_categories.length ? __axis_x_categories[i] : i
        }

        //-- Bar --//

        function getBarTargetIndices () {
            var indices = {}, i = 0
            c3.data.targets.forEach(function(d) {
                if (isBarType(d)) {
                    indices[d.id] = i++
                }
            })
            return indices
        }
        function getBarX (scale, barWidth, barTargetsNum, barIndices) {
            return function (d) {
                var barIndex = d.id in barIndices ? barIndices[d.id] : 0
                return scale(d.x) - barWidth * (barTargetsNum/2 - barIndex)
            }
        }
        function getBarY (scale) {
            return function (d) { return scale(d.value) }
        }
        function getBarW (axis, barTargetsNum) {
            return (axis.tickOffset()*2*0.6) / barTargetsNum
        }
        function getBarH (scale, height) {
            return function (d) {
                var h = height-scale(d.value)
                return h < 0 ? 0 : h
            }
        }

        //-- Type --//

        function setTargetType (targets, type) {
            var targetIds = typeof targets === 'undefined' ? getTargetIds() : targets
            if (typeof targetIds === 'string') targetIds = [targetIds]
            for (var i = 0; i < targetIds.length; i++) {
                __data_types[targetIds[i]] = type
            }
        }
        function isLineType (d) {
            var id = (typeof d === 'string') ? d : d.id
            return !(id in __data_types) || __data_types[id] === 'line'
        }
        function isBarType (d) {
            var id = (typeof d === 'string') ? d : d.id
            return __data_types[id] === 'bar'
        }
        function lineData (d) {
            return isLineType(d) ? d.values : []
        }
        function barData (d) {
            return isBarType(d) ? d.values : []
        }

        //-- Color --//

        function generateColor (_colors, _pattern) {
            var ids = [],
                colors = _colors,
                pattern = (_pattern !== null) ? _pattern : ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728','#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'] //same as d3.scale.category10()

            return function (id) {
                // if specified, choose that color
                if (id in colors) return _colors[id]

                // if not specified, choose from pattern
                if ( ! (ids.indexOf(id) >= 0)) {
                    ids.push(id)
                }
                return pattern[ids.indexOf(id) % pattern.length]
            }
        }

        //-- Util --//

        function isWithinCircle (_this, _r) {
            var mouse = d3.mouse(_this), d3_this = d3.select(_this)
            var cx = d3_this.attr("cx")*1, cy = d3_this.attr("cy")*1
            return Math.sqrt(Math.pow(cx-mouse[0],2)+Math.pow(cy-mouse[1],2)) < _r
        }
        function isWithinBar (_this) {
            var mouse = d3.mouse(_this), d3_this = d3.select(_this)
            var x = d3_this.attr("x")*1, y = d3_this.attr("y")*1, w = d3_this.attr("width")*1
            var sx = x - 10, ex = x + w + 10, ey = y - 10
            return sx < mouse[0] && mouse[0] < ex && ey < mouse[1]
        }
        function isWithinRegions (x, regions) {
            var i
            for (i = 0; i < regions.length; i++) {
                if (regions[i].start < x && x <= regions[i].end) return true
            }
            return false
        }

        //-- Selection --//

        function selectPoint (target, d, i) {
            __point_onselected(target, d)
            // add selected-circle on low layer g
            main.select(".selected-circles-" + d.id).selectAll('.selected-circle-' + i)
                .data([d])
              .enter().append('circle')
                .attr("class", function(d){ return "selected-circle selected-circle-" + i })
                .attr("cx", function(d){ return x(d.x) })
                .attr("cy", function(d){ return y(d.value) })
                .attr("stroke", function(){ return color(d.id) })
                .attr("r", __point_select_r * 1.4)
              .transition().duration(100)
                .attr("r", __point_select_r)
        }
        function unselectPoint (target, d, i) {
            __point_onunselected(target, d)
            // remove selected-circle from low layer g
            main.select(".selected-circles-" + d.id).selectAll(".selected-circle-" + i)
              .transition().duration(100).attr('r', 0)
                .remove()
        }
        function togglePoint (selected, target, d, i) {
            (selected) ? selectPoint(target, d, i) : unselectPoint(target, d, i)
        }

        function selectBar (target, d, i) {
            target.transition().duration(100)
                .style("fill-opacity", 0.4)
                .style("stroke-width", "1px")
        }
        function unselectBar (target, d, i) {
            target.transition().duration(100)
                .style("fill-opacity", 1)
                .style("stroke-width", target.classed("_e_") ? "4px" : null)
            .each('end', function(){ target.transition().style("stroke-width", null) })
        }
        function toggleBar (selected, target, d, i) {
            (selected) ? selectBar(target, d, i) : unselectBar(target, d, i)
        }

        //-- Shape --//

        function lineWithRegions (d, regions) {
            var prev = -1, i, j
            var s = "M"
            var xp, yp, dx, dy, dd, diff, diff2

            // Check start/end of regions
            if (typeof regions !== 'undefined') {
                for (i = 0; i < regions.length; i++){
                    if (typeof regions[i].start === 'undefined') {
                        regions[i].start = d[0].x
                    }
                    if (typeof regions[i].end === 'undefined') {
                        regions[i].end = d[d.length-1].x
                    }
                }
            }

            // Generate
            for (i = 0; i < d.length; i++) {
                // Draw as normal
                if (typeof regions === 'undefined' || ! isWithinRegions(d[i].x, regions)) {
                    s += " "+x(d[i].x)+" "+y(d[i].value)
                }
                // Draw with region
                else {
                    xp = d3.scale.linear().range([d[i-1].x, d[i].x])
                    yp = d3.scale.linear().range([d[i-1].value, d[i].value])
                    dx = x(d[i].x) - x(d[i-1].x)
                    dy = y(d[i].value) - y(d[i-1].value)
                    dd = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2))
                    diff = 2/dd
                    diffx2 = diff*2
                    for (j = diff; j <= 1; j += diffx2) {
                        s += "M"+x(xp(j))+" "+y(yp(j))+" "+x(xp(j+diff))+" "+y(yp(j+diff))
                    }
                }
                prev = d[i].x
            }
            return s
        }

        /*-- Define brush --*/

        var brush = d3.svg.brush().x(x2).on("brush", redraw)

        /*-- Draw Chart --*/

        // for brush area culculation
        var firstDate = null,
            lastDate = null

        function init (data) {
            var targets = c3.data.targets = convertDataToTargets(data)
            var rectWidth
            var grid, xgridLine

            // TODO: set names if names not specified

            x.domain(d3.extent(data.map(function(d){ return d.x })))
            y.domain(getYDomain(targets))
            x2.domain(x.domain())
            y2.domain(y.domain())

            /*-- Main Region --*/

            grid = main.append('g')
                .attr("clip-path", clipPath)
                .attr('class', 'grid')

            // X-Grid
            if (__grid_x_show) {
                grid.append("g").attr("class", "xgrids")
            }
            if (__grid_x_lines) {
                xgridLine = grid.append('g')
                    .attr("class", "xgrid-lines")
                  .selectAll('.xgrid-line')
                    .data(__grid_x_lines)
                  .enter().append('g')
                    .attr("class", "xgrid-line")
                xgridLine.append('line')
                    .attr("class", function(d){ return "" + d['class'] })
                    .attr("x1", function(d){ return x(d.value) })
                    .attr("x2", function(d){ return x(d.value) })
                    .attr("y1", margin.top)
                    .attr("y2", height)
                xgridLine.append('text')
                    .attr("class", function(d){ return "" + d['class'] })
                    .attr('x', function(d){ return x(d.value) })
                    .attr('y', height-8)
                    .attr('dx', 6)
                    .text(function(d){ return d.text })
            }
            if (__point_focus_line_enabled) {
                grid.append('g')
                    .attr("class", "xgrid-focus")
                  .append('line')
                    .attr('class', 'xgrid-focus')
                    .attr("x1", -10)
                    .attr("x2", -10)
                    .attr("y1", margin.top)
                    .attr("y2", height)
            }

            // Y-Grid
            if (__grid_y_show) {
                grid.append('g').attr('class', 'ygrids')
            }
            if (__grid_y_lines) {
                grid.append('g')
                    .attr('class', 'ygrid-lines')
                  .selectAll('ygrid-line')
                    .data(__grid_y_lines)
                  .enter().append('line')
                    .attr("class", function(d){ return "ygrid-line " + d['class'] })
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", function(d){ return y(d.value) })
                    .attr("y2", function(d){ return y(d.value) })
            }

            // Area
            if (__regions !== null) {
                grid.append('g')
                    .attr("class", "regions")
                  .selectAll('rect.region')
                    .data(__regions)
                  .enter().append('rect')
                    .attr('class', function(d,i){ return 'region region-' + i })
                    .attr("x", regionStart)
                    .attr("y", margin.top)
                    .attr("width", regionWidth)
                    .attr("height", height)
            }

            // Define g for chart area
            main.append('g')
                .attr("clip-path", clipPath)
                .attr('class', 'chart')

            // Cover whole with rects for events
            rectWidth = ((width*getXDomainRatio())/(maxDataCount()-1))
            main.select('.chart').append("g")
                .attr("class", "event-rects")
                .style('fill-opacity', 0)
              .selectAll(".event-rects")
                .data(data)
              .enter().append("rect")
                .attr("class", function(d,i){ return "event-rect event-rect-"+i })
                .style("cursor", function(d){ return __data_selection_enabled && __data_selection_grouped ? "pointer" : null })
                .attr("x", function(d){ return x(d.x) - (rectWidth/2) })
                .attr("y", function(d){ return 0 })
                .attr("width", rectWidth)
                .attr("height", height)
                .on('mouseover', function(d,i) {
                    if (dragging) return // do nothing if dragging

                    var selectedData = c3.data.targets.map(function(d){ return d.values[i] });
                    var j, newData

                    // Add id,name to selectedData
                    for (j = 0; j < selectedData.length; j++) {
                        selectedData[j].name = __data_names[selectedData[j].id]
                    }
                    // Sort selectedData as names order
                    if (Object.keys(__data_names).length > 0) {
                        newData = []
                        for (var id in __data_names) {
                            for (j = 0; j < selectedData.length; j++) {
                                if (selectedData[j].id === id) {
                                    newData.push(selectedData[j])
                                    selectedData.shift(j)
                                    break
                                }
                            }
                        }
                        selectedData = newData.concat(selectedData) // Add remained
                    }

                    // Expand circles if needed
                    if (__point_focus_expand_enabled) {
                        main.selectAll('.target-circle-'+i)
                            .classed("_e_", true)
                            .attr('r', __point_focus_expand_r)
                    }

                    // Expand bars
                    main.selectAll(".target-bar-"+i)
                        .classed("_e_", true)

                    // Show xgrid focus line
                    main.selectAll('line.xgrid-focus')
                        .style("visibility","visible")
                        .data([selectedData[0]])
                        .attr('x1', function(d){ return x(d.x) })
                        .attr('x2', function(d){ return x(d.x) })

                    // Set tooltip
                    tooltip.style("top", (d3.mouse(this)[1] + 30) + "px")
                           .style("left", (x(selectedData[0].x) + 60) + "px")
                    tooltip.html(__tooltip_contents(selectedData))
                    tooltip.style("visibility", "visible")
                })
                .on('mouseout', function(d,i) {
                    main.select('line.xgrid-focus').style("visibility", "hidden")
                    tooltip.style("visibility", "hidden")
                    // Undo expanded circles
                    main.selectAll('.target-circle-'+i)
                        .filter(function(){ return d3.select(this).classed('_e_') })
                        .classed("_e_", false)
                        .attr('r', __point_r)
                    // Undo expanded bar
                    main.selectAll(".target-bar-"+i)
                        .classed("_e_", false)
                })
                .on('mousemove', function(d,i){
                    if ( ! __data_selection_enabled || dragging) return
                    if ( __data_selection_grouped) return // nothing to do when grouped

                    main.selectAll('.target-circle-'+i+', .target-bar-'+i)
                        .filter(function(d){ return __data_selection_isselectable(d) })
                        .each(function(d){
                            var _this = d3.select(this).classed('_e_', true)
                            if (this.nodeName === 'circle') _this.attr('r', __point_focus_expand_r)
                            d3.select('.event-rect-'+i).style('cursor', null)
                        })
                        .filter(function(d){
                            var _this = d3.select(this)
                            if (this.nodeName === 'circle') {
                                return isWithinCircle(this, __point_select_r)
                            }
                            else if (this.nodeName === 'rect') {
                                return isWithinBar(this, _this.attr('x'), _this.attr('y'))
                            }
                        })
                        .each(function(d){
                            var _this = d3.select(this)
                            if ( ! _this.classed('_e_')) {
                                _this.classed('_e_', true)
                                if (this.nodeName === 'circle') _this.attr('r', __point_select_r)
                            }
                            d3.select('.event-rect-'+i).style('cursor', 'pointer')
                        })
                })
                .on('click', function(d,i) {
                    main.selectAll('.target-circle-'+i+', .target-bar-'+i).each(function(d){
                        var _this = d3.select(this),
                            isSelected = _this.classed('_s_')
                        var isWithin = false, toggle
                        if (this.nodeName === 'circle') {
                            isWithin = isWithinCircle(this, __point_select_r*1.5)
                            toggle = togglePoint
                        }
                        else if (this.nodeName === 'rect') {
                            isWithin = isWithinBar(this)
                            toggle = toggleBar
                        }
                        if (__data_selection_grouped || isWithin) {
                            if (__data_selection_enabled && __data_selection_isselectable(d)) {
                                _this.classed('_s_', !isSelected)
                                toggle(!isSelected, _this, d, i)
                            }
                            __point_onclick(d, _this) // TODO: should be __data_onclick
                        }
                    })
                })
                .call(
                    d3.behavior.drag().origin(Object).on('drag', function(d){
                        if ( ! __data_selection_enabled) return // do nothing if not selectable

                        var sx = dragStart[0], sy = dragStart[1],
                            mouse = d3.mouse(this),
                            mx = mouse[0],
                            my = mouse[1],
                            minX = Math.min(sx,mx),
                            maxX = Math.max(sx,mx),
                            minY = (__data_selection_grouped) ? margin.top : Math.min(sy,my),
                            maxY = (__data_selection_grouped) ? height : Math.max(sy,my)
                        main.select('.dragarea')
                            .attr('x', minX)
                            .attr('y', minY)
                            .attr('width', maxX-minX)
                            .attr('height', maxY-minY)
                        main.selectAll('.target-circles, .target-bars')
                            .selectAll('.target-circle, .target-bar')
                            .filter(function(d){ return __data_selection_isselectable(d) })
                            .each(function(d,i){
                                var _this = d3.select(this),
                                    isSelected = _this.classed('_s_'),
                                    isIncluded = _this.classed('_i_'),
                                    _x, _y, _w, toggle, isWithin = false
                                if (this.nodeName === 'circle') {
                                    _x = _this.attr("cx")*1
                                    _y = _this.attr("cy")*1
                                    toggle = togglePoint
                                    isWithin = minX < _x && _x < maxX && minY < _y && _y < maxY
                                }
                                else if (this.nodeName === 'rect') {
                                    _x = _this.attr("x")*1
                                    _y = _this.attr("y")*1
                                    _w = _this.attr('width')*1
                                    toggle = toggleBar
                                    isWithin = minX < _x+_w && _x < maxX && _y < maxY
                                }
                                if (isWithin ^ isIncluded) {
                                    _this.classed('_i_', !isIncluded)
                                    // TODO: included/unincluded callback here
                                    _this.classed('_s_', !isSelected)
                                    toggle(!isSelected, _this, d, i)
                                }
                            })
                    })
                    .on('dragstart', function() {
                        if ( ! __data_selection_enabled) return // do nothing if not selectable
                        dragStart = d3.mouse(this)
                        main.select('.chart').append('rect')
                            .attr('class', 'dragarea')
                            .style('opacity', 0.1)
                        dragging = true
                        // TODO: add callback here
                    })
                    .on('dragend', function() {
                        if ( ! __data_selection_enabled) return // do nothing if not selectable
                        main.select('.dragarea')
                          .transition().duration(100)
                            .style('opacity', 0)
                          .remove()
                        main.selectAll('.target-circle, .target-bar')
                            .classed('_i_', false)
                        dragging = false
                        // TODO: add callback here
                    })
                )

            // ATTENTION: This must be called AFTER chart added
            // Add Axis
            main.append("g")
                .attr("class", "x axis")
                .attr("clip-path", "url(#xaxis-clip)")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
            main.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy", "1.4em")
                .attr("dx", "-.8em")
                .style("text-anchor", "end")
                .text(__axis_y_text)

            /*-- Context Region --*/

            if (__subchart_show) {
                // Define g for chart area
                context.append('g')
                    .attr("clip-path", clipPath)
                    .attr('class', 'chart')

                // ATTENTION: This must be called AFTER chart rendered and BEFORE brush called.
                // Update extetn for Brush
                if (__subchart_default !== null) {
                    brush.extent((isTimeSeries) ? __subchart_default(firstDate,lastDate) : __subchart_default(0,maxDataCount()-1))
                }

                // Add extent rect for Brush
                context.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                  .selectAll("rect")
                    .attr("height", height2)

                // ATTENTION: This must be called AFTER chart added
                // Add Axis
                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2)
            }

            /*-- Legend Region --*/

            if (__legend_show) updateLegend(targets)

            // Set targets
            updateTargets(targets)

            // Draw with targets
            redraw(false, true, true)
        }

        function redraw (withTransition, withY, withSubchart) {
            var xgrid, xgridData, xgridLine
            var mainPath, mainCircle, mainBar, contextPath
            var barTargetsNum = getTargetsNum(isBarType), barIndices = getBarTargetIndices()
            var barX, barY, barW, barH
            var rectWidth

            withY = (typeof withY === 'undefined') ? false : withY
            withSubchart = (typeof withSubchart === 'undefined') ? false : withSubchart

            x.domain(brush.empty() ? x2.domain() : brush.extent())

            // ticks for x-axis
            // ATTENTION: call here to update tickOffset
            main.selectAll(".x.axis").call(xAxis)

            // grid
            if (__grid_x_show) {
                if (__grid_x_type === 'year') {
                    xgridData = []
                    firstYear = firstDate.getFullYear()
                    lastYear = lastDate.getFullYear()
                    for (var year = firstYear; year <= lastYear; year++) {
                        xgridData.push(new Date(year + '-01-01 00:00:00'))
                    }
                } else {
                    xgridData = x.ticks(10)
                }

                xgrid = main.select('.xgrids').selectAll(".xgrid")
                    .data(xgridData)
                xgrid.enter().append('line').attr("class", "xgrid")
                xgrid.exit().remove()
                main.selectAll(".xgrid")
                    .attr("x1", function(d){ return x(d) - xAxis.tickOffset(); })
                    .attr("x2", function(d){ return x(d) - xAxis.tickOffset(); })
                    .attr("y1", margin.top)
                    .attr("y2", height)
            }
            if (__grid_x_lines) {
                xgridLine = main.selectAll(".xgrid-lines")
                xgridLine.selectAll('line')
                    .attr("x1", function(d){ return x(d.value) })
                    .attr("x2", function(d){ return x(d.value) })
                xgridLine.selectAll('text')
                    .attr("x", function(d){ return x(d.value) })
            }
            // Y-Grid
            if (withY && __grid_y_show) {
                ygrid = main.select('.ygrids').selectAll(".ygrid")
                    .data(y.ticks(10))
                ygrid.enter().append('line')
                    .attr('class', 'ygrid')
                ygrid.attr("x1", 0)
                     .attr("x2", width)
                     .attr("y1", y)
                     .attr("y2", y)
                     .attr("opacity", 0)
                   .transition()
                     .attr("opacity", 1)
                ygrid.exit().remove()
            }
            if (withY && __grid_y_lines) {
                main.select('.ygrid-lines').selectAll('.ygrid-line')
                    .attr("y1", function(d){ return y(d.value) })
                    .attr("y2", function(d){ return y(d.value) })
            }

            // lines and cricles
            main.selectAll('.target-line')
              .transition().duration(withTransition ? 100 : 0)
                .attr("d", lineOnMain)
            mainCircle = main.selectAll('.target-circles').selectAll('.target-circle')
                .data(lineData)
            mainCircle.transition().duration(withTransition ? 100 : 0)
                .attr("cx", function(d){ return x(d.x) })
                .attr("cy", function(d){ return y(d.value) })
            mainCircle.enter().append("circle")
                .attr("class", function(d,i){ return "target-circle target-circle-" + i })
                .attr("cx", function(d){ return x(d.x) })
                .attr("cy", function(d){ return y(d.value) })
                .attr("r", __point_r)
            mainCircle.exit()
                .attr("y", 0)
                .remove()

            // bars
            barW = getBarW(xAxis, barTargetsNum)
            barH = getBarH(y, height)
            barX = getBarX(x, barW, barTargetsNum, barIndices)
            barY = getBarY(y)
            mainBar = main.selectAll('.target-bars').selectAll('.target-bar')
                .data(barData)
            mainBar.transition().duration(withTransition ? 100 : 0)
                .attr("x", barX).attr("y", barY).attr("width", barW).attr("height", barH)
            mainBar.enter().append('rect')
                .attr("class", function(d,i){ return "target-bar target-bar-" + i })
                .attr("x", barX).attr("y", height).attr("width", barW).attr("height", 0)
                .style("opacity", 0)
              .transition().duration(withTransition ? 100 : 0)
                .attr('y', barY).attr('height', barH)
                .style('opacity', 1)
            mainBar.exit().transition().duration(withTransition ? 100 : 0)
                .attr('y', height).attr('height', 0)
                .style('opacity', 0)
                .remove()

            // subchart
            if (withSubchart && __subchart_show) {
                context.selectAll('.target-line')
                  .transition().duration(withTransition ? 100 : 0)
                    .attr("d", lineOnSub)

                // bars
                barW = getBarW(xAxis2, barTargetsNum)
                barH = getBarH(y2, height2)
                barX = getBarX(x2, barW, barTargetsNum, barIndices)
                barY = getBarY(y2)
                contextBar = context.selectAll('.target-bars').selectAll('.target-bar')
                    .data(barData)
                contextBar.transition().duration(withTransition ? 100 : 0)
                    .attr("x", barX).attr("y", barY).attr("width", barW).attr("height", barH)
                contextBar.enter().append('rect')
                    .attr("class", function(d,i){ return "target-bar target-bar-" + i })
                    .attr("x", barX).attr("y", height2).attr("width", barW).attr("height", 0)
                    .style("opacity", 0)
                  .transition()
                    .attr('y', barY).attr('height', barH)
                    .style('opacity', 1)
                contextBar.exit().transition()
                    .attr('y', height2).attr('height', 0).style('opacity', 0)
                    .remove()
            }

            // circles for select
            main.selectAll('.selected-circle')
                .attr("cx", function(d) { return x(d.x) })
                .attr("cy", function(d) { return y(d.value) })

            // rect for mouseover
            rectWidth = ((width*getXDomainRatio())/(maxDataCount()-1))
            main.selectAll('rect.event-rect')
                .attr("width", rectWidth)
                .attr("x", function(d) { return x(d.x) - (rectWidth/2) })
            main.selectAll('rect.region')
                .attr("x", regionStart)
                .attr("width", regionWidth)
            // TODO: enter/exti section for data add/remove
        }

        function updateTargets (targets) {
            var f, c

            /*-- Main --*/

            f = main.select('.chart')
              .selectAll('.target')
                .data(targets)
              .enter().append('g')
                .attr('class', function(d){ return 'target target-' + d.id })
                .style("pointer-events", "none")
                .style('opacity', 0)

            // Lines for each data
            f.append("path")
                .attr("class", function(d){ return "target-line target-line-" + d.id })
                .style("stroke", function(d) { return color(d.id) })
            // Circles for each data point on lines
            f.append('g')
                .attr("class", function(d){ return "selected-circles selected-circles-" + d.id })
            f.append('g')
                .attr("class", function(d){ return "target-circles target-circles-" + d.id })
                .style("fill", function(d){ return color(d.id) })
                .style("cursor", function(d){ return __data_selection_isselectable(d) ? "pointer" : null })
            // Bars for each data
            f.append('g')
                .attr("class", function(d){ return "target-bars target-bars-" + d.id })
                .style("fill", function(d){ return color(d.id) })
                .style("stroke", function(d){ return color(d.id) })
                .style("stroke-width", 0)
                .style("cursor", function(d){ return __data_selection_isselectable(d) ? "pointer" : null })

            /*-- Context --*/

            if (__subchart_show) {
                c = context.select('.chart')
                  .selectAll('.target')
                    .data(targets)
                  .enter().append('g')
                    .attr('class', function(d){ return 'target target-' + d.id })
                    .style('opacity', 0)

                // Lines for each data
                c.append("path")
                    .attr("class", function(d){ return "target-line target-line-" + d.id })
                    .style("stroke", function(d) { return color(d.id) })
                // Bars for each data
                c.append('g')
                    .attr("class", function(d){ return "target-bars target-bars-" + d.id })
                    .style("fill", function(d){ return color(d.id) })
            }

            /*-- Legend --*/

            if (__legend_show) {
                updateLegend(targets)
            }

            /*-- Show --*/

            // Fade-in each chart
            d3.selectAll('.target')
                .transition()
                .style("opacity", 1)
        }

        function load (targets, done) {
            // Update/Add data
            c3.data.targets.forEach(function(d){
                for (var i = 0; i < targets.length; i++) {
                    if (d.id === targets[i].id) {
                        d.values = targets[i].values
                        targets.splice(i,1)
                        break
                    }
                }
            })
            c3.data.targets = c3.data.targets.concat(targets) // add remained

            if (__axis_y_rescale) {
                y.domain(getYDomain(c3.data.targets))
                y2.domain(y.domain())
                main.select('.y.axis').transition().call(yAxis)
            }

            // Set targets
            updateTargets(c3.data.targets)

            // Redraw with new targets
            redraw(true, true, true)

            done()
        }

        /*-- Draw Legend --*/

        function updateLegend (targets) {
            var ids = getTargetIds(targets), l
            var padding = width/2 - __legend_item_width*Object.keys(targets).length/2

            // Define g for legend area
            l = legend.selectAll('.legend-item')
                .data(ids)
              .enter().append('g')
                .attr('class', function(d){ return 'legend-item legend-item-' + d })
                .style('cursor', 'pointer')
                .on('click', function(d){
                    __legend_item_onclick(d)
                })
                .on('mouseover', function(d){
                    d3.selectAll('.legend-item').filter(function(_d){ return _d !== d })
                      .transition().duration(100)
                        .style('opacity', 0.3)
                    c3.defocus()
                    c3.focus(d)
                })
                .on('mouseout', function(d){
                    d3.selectAll('.legend-item')
                      .transition().duration(100)
                        .style('opacity', 1)
                    c3.revert()
                })
            l.append('rect')
                .attr("class", "legend-item-event")
                .style('fill-opacity', 0)
                .attr('x', -200)
                .attr('y', function(){ return legendHeight/2 - 16 })
                .attr('width', __legend_item_width)
                .attr('height', 24)
            l.append('rect')
                .attr("class", "legend-item-tile")
                .style('fill', function(d){ return color(d) })
                .attr('x', -200)
                .attr('y', function(){ return legendHeight/2 - 9 })
                .attr('width', 10)
                .attr('height', 10)
            l.append('text')
                .text(function(d){ return __data_names[d] })
                .attr('x', -200)
                .attr('y', function(d,i){ return legendHeight/2 })

            legend.selectAll('rect.legend-item-event')
                .data(ids)
              .transition()
                .attr('x', function(d,i){ return padding + __legend_item_width*i })

            legend.selectAll('rect.legend-item-tile')
                .data(ids)
              .transition()
                .attr('x', function(d,i){ return padding + __legend_item_width*i })

            legend.selectAll('text')
                .data(ids)
              .transition()
                .attr('x', function(d,i){ return padding + __legend_item_width*i + 14 })
        }

        /*-- Event Handling --*/

        function getTargetSelector (target) {
            return (typeof target === 'undefined') ? '.target' : '.target-' + target
        }

        c3.focus = function (target) {
            d3.selectAll(getTargetSelector(target))
                .filter(function(d){ return hasTarget(d.id) })
                .classed('focused', true)
                .transition().duration(100)
                .style('opacity', 1)
        }

        c3.defocus = function (target) {
            d3.selectAll(getTargetSelector(target))
                .filter(function(d){ return hasTarget(d.id) })
                .classed('focused', false)
                .transition().duration(100)
                .style('opacity', 0.3)
        }

        c3.revert = function (target) {
            d3.selectAll(getTargetSelector(target))
                .filter(function(d){ return hasTarget(d.id) })
                .classed('focused', false)
                .transition().duration(100)
                .style('opacity', 1)
        }

        c3.show = function (target) {
            d3.selectAll(getTargetSelector(target))
                .transition()
                .style('opacity', 1)
        }

        c3.hide = function (target) {
            d3.selectAll(getTargetSelector(target))
                .transition()
                .style('opacity', 0)
        }

        c3.load = function (args) {
            // check args
            if (typeof args.done === 'undefined') {
                args.done = function() {}
            }
            // use cache if exists
            if ('cacheIds' in args && hasCaches(args.cacheIds)) {
                load(getCaches(args.cacheIds), args.done)
                return
            }
            // load data
            if ('data' in args) {
                load(convertDataToTargets(data), args.done)
            }
            else if ('url' in args) {
                d3.csv(args.url, function(error, data){
                    load(convertDataToTargets(data), args.done)
                })
            }
            else if ('rows' in args) {
                load(convertDataToTargets(convertRowsToData(args.rows)), args.done)
            }
            else if ('columns' in args) {
                load(convertDataToTargets(convertColumnsToData(args.columns)), args.done)
            }
            else {
                throw Error('url or rows or columns is required.')
            }
        }

        c3.unload = function (target) {
            c3.data.targets = c3.data.targets.filter(function(d){
                return d.id != target
            })
            d3.selectAll('.target-'+target)
              .transition()
                .style('opacity', 0)
                .remove()

            if (__legend_show) {
                d3.selectAll('.legend-item-'+target).remove()
                updateLegend(c3.data.targets)
            }

            if (__axis_y_rescale){
                y.domain(getYDomain(c3.data.targets))
                y2.domain(y.domain())
                main.select('.y.axis').transition().call(yAxis)
            }

            if (c3.data.targets.length > 0) redraw(true, true, true)
        }

        c3.selected = function (target) {
            var suffix = (typeof target !== 'undefined') ? '-' + target : ''
            return d3.merge(
                main.selectAll('.target-circles' + suffix)
                    .selectAll('circle')
                    .filter(function(){ return d3.select(this).classed('_s_') })
                    .map(function(d){ return d.map(function(_d){ return _d.__data__ }) })
            )
        }

        c3.select = function (indices, resetOther) {
            if ( ! __data_selection_enabled) return
            main.selectAll('.target-circles').selectAll('.target-circle').each(function(d,i){
                if (indices.indexOf(i) >= 0) {
                    if (__data_selection_grouped || __data_selection_isselectable(d)) {
                        selectPoint(d3.select(this).classed('_s_',true), d, i)
                    }
                } else if (typeof resetOther !== 'undefined' && resetOther) {
                    unselectPoint(d3.select(this).classed('_s_',false), d, i)
                }
            })
        }

        c3.unselect = function (indices) {
            if ( ! __data_selection_enabled) return
            main.selectAll('.target-circles').selectAll('.target-circle').each(function(d,i){
                if (typeof indices === 'undefined' || indices.indexOf(i) >= 0) {
                    if (__data_selection_grouped || __data_selection_isselectable(d)) {
                        unselectPoint(d3.select(this).classed('_s_',false), d, i)
                    }
                }
            })
        }

        c3.toLine = function (targets) {
            setTargetType(targets, 'line')
            redraw(true, true, true)
        }

        c3.toBar = function (targets) {
            setTargetType(targets, 'bar')
            redraw(true, true, true)
        }

        /*-- Load data and init chart with defined functions --*/

        if ('url' in config.data) {
            d3.csv(config.data.url, function(error, data) { init(data) })
        }
        else if ('rows' in config.data) {
            init(convertRowsToData(config.data.rows))
        }
        else if ('columns' in config.data) {
            init(convertColumnsToData(config.data.columns))
        }
        else {
            throw Error('url or rows or columns is required.')
        }

        return c3
    }

    function categoryAxis () {
        var scale = d3.scale.linear(), orient = "bottom", tickMajorSize = 6, tickMinorSize = 6, tickEndSize = 6, tickPadding = 3, tickCentered = false, tickTextNum = 30, tickOffset = 0, categories = []
        function axisX (selection, x) {
            selection.attr("transform", function(d){
                return "translate(" + (x(d) + tickOffset) + ",0)"
            })
        }
        function axisY (selection, y) {
            selection.attr("transform", function(d){
                return "translate(" + y(d) + ",0)"
            })
        }
        function scaleExtent (domain) {
            var start = domain[0], stop = domain[domain.length - 1]
            return start < stop ? [ start, stop ] : [ stop, start ]
        }
        function generateTicks (domain) {
            var ticks = []
            for (var i = Math.ceil(domain[0]); i < domain[1]; i++) {
                ticks.push(i)
            }
            if (ticks.length > 0 && ticks[0] > 0) {
                ticks.unshift(ticks[0] - (ticks[1]-ticks[0]))
            }
            return ticks
        }
        function shouldShowTickText (ticks, i) {
            return ticks.length < tickTextNum || i % Math.ceil(ticks.length / tickTextNum) == 0
        }
        function category (i) {
            return i < categories.length ? categories[i] : i
        }
        function axis(g) {
            g.each(function() {
                var g = d3.select(this)
                var ticks = generateTicks(scale.domain())
                var tick = g.selectAll(".tick.major").data(ticks, String), tickEnter = tick.enter().insert("g", "path").attr("class", "tick major").style("opacity", 1e-6), tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(), tickUpdate = d3.transition(tick).style("opacity", 1), tickTransform, tickX
                var range = scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range()), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), d3.transition(path))
                var scale1 = scale.copy(), scale0 = this.__chart__ || scale1
                this.__chart__ = scale1
                tickEnter.append("line")
                tickEnter.append("text")
                var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text"), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text")

                tickOffset = (scale1(1)-scale1(0))/2
                tickX = tickCentered ? 0 : tickOffset

                switch (orient) {
                case "bottom":
                    {
                        tickTransform = axisX
                        lineEnter.attr("y2", tickMajorSize)
                        textEnter.attr("y", Math.max(tickMajorSize, 0) + tickPadding)
                        lineUpdate.attr("x1", tickX).attr("x2", tickX).attr("y2", tickMajorSize)
                        textUpdate.attr("x", 0).attr("y", Math.max(tickMajorSize, 0) + tickPadding)
                        text.attr("dy", ".71em").style("text-anchor", "middle")
                        text.text(function(i){ return shouldShowTickText(ticks, i) ? category(i) : "" })
                        pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize + "V0H" + range[1] + "V" + tickEndSize)
                        break
                    }
/* TODO: implement
                case "top":
                    {
                        tickTransform = axisX
                        lineEnter.attr("y2", -tickMajorSize)
                        textEnter.attr("y", -(Math.max(tickMajorSize, 0) + tickPadding))
                        lineUpdate.attr("x2", 0).attr("y2", -tickMajorSize)
                        textUpdate.attr("x", 0).attr("y", -(Math.max(tickMajorSize, 0) + tickPadding))
                        text.attr("dy", "0em").style("text-anchor", "middle")
                        pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize + "V0H" + range[1] + "V" + -tickEndSize)
                        break
                    }
                case "left":
                    {
                        tickTransform = axisY
                        lineEnter.attr("x2", -tickMajorSize)
                        textEnter.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding))
                        lineUpdate.attr("x2", -tickMajorSize).attr("y2", 0)
                        textUpdate.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding)).attr("y", 0)
                        text.attr("dy", ".32em").style("text-anchor", "end")
                        pathUpdate.attr("d", "M" + -tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize)
                        break
                    }
                case "right":
                    {
                        tickTransform = axisY
                        lineEnter.attr("x2", tickMajorSize)
                        textEnter.attr("x", Math.max(tickMajorSize, 0) + tickPadding)
                        lineUpdate.attr("x2", tickMajorSize).attr("y2", 0)
                        textUpdate.attr("x", Math.max(tickMajorSize, 0) + tickPadding).attr("y", 0)
                        text.attr("dy", ".32em").style("text-anchor", "start")
                        pathUpdate.attr("d", "M" + tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize)
                        break
                    }
*/
                }
                if (scale.ticks) {
                    tickEnter.call(tickTransform, scale0)
                    tickUpdate.call(tickTransform, scale1)
                    tickExit.call(tickTransform, scale1)
                } else {
                    var dx = scale1.rangeBand() / 2, x = function(d) {
                        return scale1(d) + dx
                    }
                    tickEnter.call(tickTransform, x)
                    tickUpdate.call(tickTransform, x)
                }
            })
        }
        axis.scale = function(x) {
            if (!arguments.length) return scale
            scale = x
            return axis
        }
        axis.orient = function(x) {
            if (!arguments.length) return orient
            orient = x in {top:1,right:1,bottom:1,left:1} ? x + "" : "bottom"
            return axis
        }
        axis.categories = function(x) {
            if (!arguments.length) return categories
            categories = x
            return axis
        }
        axis.tickCentered = function(x) {
            if (!arguments.length) return tickCentered
            tickCentered = x
            return axis
        }
        axis.tickOffset = function() {
            return tickOffset
        }
        return axis
    }

})(window)
