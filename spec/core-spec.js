var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', 150, 120, 110, 140, 115, 125]
            ]
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('init', function () {

        it('should be created', function () {
            var svg = d3.select('#chart svg');
            expect(svg).not.toBeNull();
        });

        it('should set 3rd party property to Function', function () {
            Function.prototype.$extIsFunction = true;
            expect(true).toBeTruthy();
        });

        it('should be created even if 3rd party property has been set', function () {
            var svg = d3.select('#chart svg');
            expect(svg).not.toBeNull();
        });

    });

    describe('size', function () {

        it('should have same width', function () {
            var svg = d3.select('#chart svg');
            expect(+svg.attr('width')).toBe(640);
        });

        it('should have same height', function () {
            var svg = d3.select('#chart svg');
            expect(+svg.attr('height')).toBe(480);
        });

    });

    describe('bindto', function () {

        it('should accept d3.selection object', function () {
            args.bindto = d3.select('#chart');
            expect(true).toBeTruthy();
        });

        it('should be created', function () {
            var svg = d3.select('#chart svg');
            expect(svg).not.toBeNull();
        });

    });

    describe('empty data', function () {

        it('should upaate args for empty data', function () {
            args = {
                data: {
                    columns: [
                        ['data1'],
                        ['data2']
                    ]
                }
            };
            expect(true).toBeTruthy();
        });

        it('should generate a chart', function () {
            var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick');
            expect(ticks.size()).toBe(0);
        });

        it('should upaate args for empty data', function () {
            args = {
                data: {
                    x: 'x',
                    columns: [
                        ['x'],
                        ['data1'],
                        ['data2']
                    ]
                },
                axis: {
                    x: {
                        type: 'timeseries'
                    }
                }
            };
            expect(true).toBeTruthy();
        });

        it('should generate a chart', function () {
            var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick');
            expect(ticks.size()).toBe(0);
        });

    });

});
