describe('c3 api axis', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('axis.labels', function () {

        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 50, 20, 10]
                    ],
                    axes: {
                        data1: 'y',
                        data2: 'y2'
                    }
                },
                axis: {
                    y: {
                        label: 'Y Axis Label'
                    },
                    y2: {
                        show: true,
                        label: 'Y2 Axis Label'
                    }
                }
            };
        });

        it('updates y axis label', function () {
            chart.axis.labels({y: 'New Y Axis Label'});
            var label = d3.select('.c3-axis-y-label');
            expect(label.text()).toBe('New Y Axis Label');
            expect(label.attr('dx')).toBe('-0.5em');
            expect(label.attr('dy')).toBe('1.2em');
        });

        it('updates y axis label', function () {
            chart.axis.labels({y2: 'New Y2 Axis Label'});
            var label = d3.select('.c3-axis-y2-label');
            expect(label.text()).toBe('New Y2 Axis Label');
            expect(label.attr('dx')).toBe('-0.5em');
            expect(label.attr('dy')).toBe('-0.5em');
        });

         it('updates axis max values', function () {
            chart.axis.max({x: 100, y: 300, y2: 100});
            var max_values = chart.axis.max();
            expect(max_values.x).toBe(100);
            expect(max_values.y).toBe(300);
            expect(max_values.y2).toBe(100);
        });

         it('updates axis min values', function () {
            chart.axis.min({x: 0, y: 20, y2: 50});
            var min_values = chart.axis.min();
            expect(min_values.x).toBe(0);
            expect(min_values.y).toBe(20);
            expect(min_values.y2).toBe(50);
        });

        it('updates axis range', function () {
            chart.axis.range({min: 5, max: 250});
            var range = chart.axis.range();
            expect(range.max.y).toBe(250);
            expect(range.min.y).toBe(5);
        });


    });

    describe('axis.types', function() {

        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 30, 200, 100]
                    ],
                    axes: {
                        data1: 'y',
                        data2: 'y2'
                    }
                },
                axis: {
                    y: {
                        label: 'Y Axis Label'
                    },
                    y2: {
                        show: true,
                        type: 'log',
                        label: 'Y2 Axis Label'
                    }
                }
            };
        });

        it('retrieves y/y2 axis types', function () {
            expect(chart.axis.types()).toEqual({
                y: 'linear',
                y2: 'log'
            });

            const linearDomain = chart.internal.y.domain();
            const logDomain = chart.internal.y2.domain();

            chart.axis.types({
                y: 'log',
                y2: 'linear'
            });

            expect(chart.internal.y2.domain()).toEqual(linearDomain);
            expect(chart.internal.y.domain()).toEqual(logDomain);

            expect(chart.axis.types()).toEqual({
                y: 'log',
                y2: 'linear'
            });
        });
    });
});
