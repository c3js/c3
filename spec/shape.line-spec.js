describe('c3 chart shape line', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    var parseSvgPath = window.parseSvgPath;

    describe('shape-rendering for line chart', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'line'
                }
            };
            expect(true).toBeTruthy();

        });

        it("Should render the lines correctly", function(done) {
             setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                var commands = parseSvgPath( target.select('.c3-line-data1').attr('d'));
                expect(commands.length).toBe(6);
                done();
            }, 500);
        });

        it("should not have shape-rendering when it's line chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering');
                expect(style).toBe('auto');
            });
        });

        it('should change to step chart', function () {
            args.data.type = 'step';
            expect(true).toBeTruthy();
        });

        it("should have shape-rendering = crispedges when it's step chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering').toLowerCase();
                expect(style).toBe('crispedges');
            });
        });

        it('should change to spline chart', function () {
            args.data.type = 'spline';
            expect(true).toBeTruthy();
        });

        it('should use cardinal interpolation by default', function () {
            expect(chart.internal.config.spline_interpolation_type).toBe('cardinal');
        });

    });

    describe('point.show option', function () {

        it('should change args to include null data', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, null, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'line'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should not show the circle for null', function (done) {
            setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                expect(+target.select('.c3-circle-0').style('opacity')).toBe(1);
                expect(+target.select('.c3-circle-1').style('opacity')).toBe(0);
                expect(+target.select('.c3-circle-2').style('opacity')).toBe(1);
                done();
            }, 500);
        });

        it('should not draw a line segment for null data', function(done) {
            setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                var commands = parseSvgPath( target.select('.c3-line-data1').attr('d'));
                var segments = 0;
                for(var i = 0; i < commands.length; i++) {
                    (commands[i].command === 'L') ? segments++ : null;
                }
                expect(segments).toBe(3);
                done();
            }, 500);
        });

        // it('should change args to include null data on scatter plot', function () {
        //     args = {
        //         data: {
        //             columns: [
        //                 ['data1', 30, null, 100, 400, -150, 250],
        //                 ['data2', 50, 20, 10, 40, 15, 25],
        //                 ['data3', -150, 120, 110, 140, 115, 125]
        //             ],
        //             type: 'scatter'
        //         }
        //     };
        //     expect(true).toBeTruthy();
        // });

        // it('should not show the circle for null', function (done) {
        //     setTimeout(function () {
        //         var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
        //         expect(+target.select('.c3-circle-0').style('opacity')).toBe(0.5);
        //         expect(+target.select('.c3-circle-1').style('opacity')).toBe(0);
        //         expect(+target.select('.c3-circle-2').style('opacity')).toBe(0.5);
        //         done();
        //     }, 500);
        // });

    });

    describe('spline.interpolation option', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'spline'
                },
                spline: {
                    interpolation: {
                        type: 'monotone'
                    }
                }
            };

            expect(true).toBeTruthy();
        });

        it('should update interpolation function', function() {
            expect(chart.internal.getInterpolate(chart.data()[0])).toBe('monotone');
        });

        it('should not use a non-valid interpolation', function () {
            args.spline.interpolation.type = 'foo';
            expect(true).toBeTruthy();
        });

        it('should use cardinal interpolation when given option is not valid', function() {
            expect(chart.internal.getInterpolate(chart.data()[0])).toBe('cardinal');
        });

    });

});
