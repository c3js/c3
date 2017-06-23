var setMouseEvent = window.setMouseEvent;

describe('c3 chart shape bar', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('with groups', function () {

        describe('with indexed data', function () {
            beforeAll(function () {
                args = {
                    data: {
                        columns: [
                            ['data1', 30, 200, -100, 400, -150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25],
                        ],
                        groups: [
                            ['data1', 'data2'],
                        ],
                        type: 'bar'
                    },
                };
            });
            it('should be stacked', function () {
                var expectedBottom = [275, 293, 365, 281, 395, 290];
                chart.internal.main.selectAll('.c3-bars-data1 .c3-bar').each(function (d, i) {
                    var rect = d3.select(this).node().getBoundingClientRect();
                    expect(rect.bottom).toBeCloseTo(expectedBottom[i], -1);
                });
           });
        });

        describe('with timeseries data', function () {
            beforeAll(function () {
                args = {
                    data: {
                        x: 'date',
                        columns: [
                            ['date', '2012-12-24', '2012-12-25', '2012-12-26', '2012-12-27', '2012-12-28', '2012-12-29'],
                            ['data1', 30, 200, -100, 400, -150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25],
                        ],
                        groups: [
                            ['data1', 'data2'],
                        ],
                        type: 'bar'
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                        }
                    }
                };
            });
            it('should be stacked', function () {
                var expectedBottom = [275, 293, 365, 281, 395, 290];
                chart.internal.main.selectAll('.c3-bars-data1 .c3-bar').each(function (d, i) {
                    var rect = d3.select(this).node().getBoundingClientRect();
                    expect(rect.bottom).toBeCloseTo(expectedBottom[i], -1);
                });
           });
        });

        describe('with category data', function () {
            beforeAll(function () {
                args = {
                    data: {
                        x: 'date',
                        columns: [
                            ['date', '2012-12-24', '2012-12-25', '2012-12-26', '2012-12-27', '2012-12-28', '2012-12-29'],
                            ['data1', 30, 200, -100, 400, -150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25],
                        ],
                        groups: [
                            ['data1', 'data2'],
                        ],
                        type: 'bar'
                    },
                    axis: {
                        x: {
                            type: 'category',
                        }
                    }
                };
            });

            it('should be stacked', function () {
                var expectedBottom = [275, 293, 365, 281, 395, 290];
                chart.internal.main.selectAll('.c3-bars-data1 .c3-bar').each(function (d, i) {
                    var rect = d3.select(this).node().getBoundingClientRect();
                    expect(rect.bottom).toBeCloseTo(expectedBottom[i], -1);
                });
           });
        });

    });

    describe('internal.isWithinBar', function () {

        describe('with normal axis', function () {

            beforeAll(function () {
                args = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, -150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25],
                            ['data3', -150, 120, 110, 140, 115, 125]
                        ],
                        type: 'bar'
                    },
                    axis: {
                        rotated: false
                    }
                };
            });

            it('should not be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 0, 0);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 31, 280);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

            it('should not be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 68, 280);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 68, 350);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

        });

        describe('with rotated axis', function () {

            beforeAll(function () {
                args.axis.rotated = true;
            });

            it('should not be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 0, 0);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 190, 20);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

            it('should be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 68, 50);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

        });

    });

});
