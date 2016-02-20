describe('c3 chart arc', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('show pie chart', function () {

        it('should update args to have pie chart', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30],
                        ['data2', 150],
                        ['data3', 120]
                    ],
                    type: 'pie'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should have correct classes', function () {
            var chartArc = d3.select('.c3-chart-arcs'),
            arcs = {
                data1: chartArc.select('.c3-chart-arc.c3-target.c3-target-data1')
                    .select('g.c3-shapes.c3-shapes-data1.c3-arcs.c3-arcs-data1')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data1'),
                data2: chartArc.select('.c3-chart-arc.c3-target.c3-target-data2')
                    .select('g.c3-shapes.c3-shapes-data2.c3-arcs.c3-arcs-data2')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data2'),
                data3: chartArc.select('.c3-chart-arc.c3-target.c3-target-data3')
                    .select('g.c3-shapes.c3-shapes-data3.c3-arcs.c3-arcs-data3')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data3')
            };
            expect(arcs.data1.size()).toBe(1);
            expect(arcs.data2.size()).toBe(1);
            expect(arcs.data3.size()).toBe(1);
        });

        it('should have correct d', function () {
            expect(d3.select('.c3-arc-data1').attr('d')).toMatch(/M-124\..+,-171\..+A211\..+,211\..+ 0 0,1 -3\..+,-211\..+L0,0Z/);
            expect(d3.select('.c3-arc-data2').attr('d')).toMatch(/M1\..+,-211\..+A211\..+,211\..+ 0 0,1 1\..+,211\..+L0,0Z/);
            expect(d3.select('.c3-arc-data3').attr('d')).toMatch(/M1\..+,211\..+A211\..+,211\..+ 0 0,1 -124\..+,-171\..+L0,0Z/);
        });

        it('should set args with data id that can be converted to a color', function () {
            args.data.columns = [
                ['black', 30],
                ['data2', 150],
                ['data3', 120]
            ];
            expect(true).toBeTruthy();
        });

        it('should have correct d even if data id can be converted to a color', function (done) {
            setTimeout(function () {
                expect(d3.select('.c3-arc-black').attr('d')).toMatch(/M-124\..+,-171\..+A211\..+,211\..+ 0 0,1 -3\..+,-211\..+L0,0Z/);
                done();
            }, 500);
        });

        it('should update args to have empty pie chart', function () {
            args = {
                data: {
                    columns: [
                        ['data1', null],
                        ['data2', null],
                        ['data3', null]
                    ],
                    type: 'pie'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should have correct d attribute', function () {
            var chartArc = d3.select('.c3-chart-arcs'),
            arcs = {
                data1: chartArc.select('.c3-chart-arc.c3-target.c3-target-data1')
                    .select('g.c3-shapes.c3-shapes-data1.c3-arcs.c3-arcs-data1')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data1'),
                data2: chartArc.select('.c3-chart-arc.c3-target.c3-target-data2')
                    .select('g.c3-shapes.c3-shapes-data2.c3-arcs.c3-arcs-data2')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data2'),
                data3: chartArc.select('.c3-chart-arc.c3-target.c3-target-data3')
                    .select('g.c3-shapes.c3-shapes-data3.c3-arcs.c3-arcs-data3')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data3')
            };
            expect(arcs.data1.attr('d').indexOf('NaN')).toBe(-1);
            expect(arcs.data2.attr('d').indexOf('NaN')).toBe(-1);
            expect(arcs.data3.attr('d').indexOf('NaN')).toBe(-1);
        });

    });

    describe('show gauge', function () {

        it('should update args to have a 180 degree gauge', function () {
            args = {
                gauge: {
                    width: 10,
                    max: 10,
                    expand: true
                },
                data: {
                    columns: [
                        ['data', 8]
                    ],
                    type: 'gauge'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should have correct d for Pi radian gauge', function () {
            var chartArc = d3.select('.c3-chart-arcs'),
                data = chartArc.select('.c3-chart-arc.c3-target.c3-target-data')
                    .select('g.c3-shapes.c3-shapes-data.c3-arcs.c3-arcs-data')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data');

            expect(data.attr('d')).toMatch('M-304,-3.7229262694079536e-14A304,304 0 0,1 245.94116628998404,-178.68671669691184L237.85099634623455,-172.8088641739871A294,294 0 0,0 -294,-3.6004615894932184e-14Z'); //jshint ignore:line
        });

        it('should update args to have a 2 Pi radian gauge that starts at Pi/2', function() {
            args = {
                gauge: {
                    width: 10,
                    max: 10,
                    expand: true,
                    fullCircle: true
                },
                data: {
                    columns: [
                        ['data', 8]
                    ],
                    type: 'gauge',
                    fullCircle: true,
                    startingAngle: Math.PI/2
                }
            };
            expect(true).toBeTruthy();
        });

        it('should have correct d for 2 Pi radian gauge starting at Pi/2', function() {
            var chartArc = d3.select('.c3-chart-arcs'),
                data = chartArc.select('.c3-chart-arc.c3-target.c3-target-data')
                    .select('g.c3-shapes.c3-shapes-data.c3-arcs.c3-arcs-data')
                    .select('path.c3-shape.c3-shape.c3-arc.c3-arc-data');

            expect(data.attr('d')).toMatch('M-304,-3.7229262694079536e-14A304,304 0 0,1 245.94116628998404,-178.68671669691184L237.85099634623455,-172.8088641739871A294,294 0 0,0 -294,-3.6004615894932184e-14Z'); //jshint ignore:line
        });
    });

});
