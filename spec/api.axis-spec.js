describe('c3 api axis', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('axis.labels', function () {

        it('should update args', function () {
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
            expect(true).toBeTruthy();
        });

        it('should update y axis label', function () {
            chart.axis.labels({y: 'New Y Axis Label'});
            var label = d3.select('.c3-axis-y-label');
            expect(label.text()).toBe('New Y Axis Label');
            expect(label.attr('dx')).toBe('-0.5em');
            expect(label.attr('dy')).toBe('1.2em');
        });

        it('should update y axis label', function () {
            chart.axis.labels({y2: 'New Y2 Axis Label'});
            var label = d3.select('.c3-axis-y2-label');
            expect(label.text()).toBe('New Y2 Axis Label');
            expect(label.attr('dx')).toBe('-0.5em');
            expect(label.attr('dy')).toBe('-0.5em');
        });

    });

    describe('isShown', function(){
        it('should get value', function(){
             args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 50, 20, 10]
                    ],
                },
                axis: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true,
                    }
                }
            };

            chart = window.initChart(chart, args);

            expect(chart.axis.isXShown()).toBe(true);
            expect(chart.axis.isYShown()).toBe(true);

            args.axis.x.show = false;
            args.axis.y.show = false;

            chart = window.initChart(chart, args);

            expect(chart.axis.isXShown()).toBe(false);
            expect(chart.axis.isYShown()).toBe(false);
                
        });

        it('should set value', function(){
            chart.axis.isXShown(true);

            expect(chart.axis.isXShown()).toBe(true);
            expect(chart.axis.isYShown()).toBe(false);

            chart.axis.isYShown(true);

            expect(chart.axis.isXShown()).toBe(true);
            expect(chart.axis.isYShown()).toBe(true);

            chart.axis.isXShown(false);

            expect(chart.axis.isXShown()).toBe(false);
            expect(chart.axis.isYShown()).toBe(true);

            chart.axis.isYShown(false);

            expect(chart.axis.isXShown()).toBe(false);
            expect(chart.axis.isYShown()).toBe(false);
        });

        it('should actualy show and hide axis', function(){
            function check(axis, prop){
                expect(d3.select('.c3-axis-' + axis).style('visibility')).toBe(prop);
            }

            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100],
                        ['data2', 50, 20, 10]
                    ],
                },
                axis: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true,
                    }
                }
            };

            chart = window.initChart(chart, args);

            chart.axis.isXShown(false);

            check('x', 'hidden');
            check('y', 'visible');

            chart.axis.isYShown(false);

            check('x', 'hidden');
            check('y', 'hidden');

            chart.axis.isXShown(true);

            check('x', 'visible');
            check('y', 'hidden');

            chart.axis.isYShown(true);

            check('x', 'visible');
            check('y', 'visible');
        });
    });
});
