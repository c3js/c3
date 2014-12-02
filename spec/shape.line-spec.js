var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart shape line', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, -150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', -150, 120, 110, 140, 115, 125]
            ],
            type: 'line'
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('shape-rendering for line chart', function () {

        it("should not have shape-rendering when it's line chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering');
                expect(style).toBe('auto');
            });
        });

        it('should chnage to step chart', function () {
            args.data.type = 'step';
            expect(true).toBeTruthy();
        });

        it("should have shape-rendering = crispedges when it's step chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering');
                expect(style).toBe('crispedges');
            });
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

        it('should change args to include null data on scatter plot', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, null, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'scatter'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should not show the circle for null', function (done) {
            setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                expect(+target.select('.c3-circle-0').style('opacity')).toBe(0.5);
                expect(+target.select('.c3-circle-1').style('opacity')).toBe(0);
                expect(+target.select('.c3-circle-2').style('opacity')).toBe(0.5);
                done();
            }, 500);
        });

    });

});
