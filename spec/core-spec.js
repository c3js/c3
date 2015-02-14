describe('c3 chart', function () {
    'use strict';

    var chart;

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

        describe('selector', function () {
            it('update args', function () {
                d3.select('#chart').html('');
                args.bindto = '#chart';
                expect(true).toBeTruthy();
            });
            it('should be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(1);
            });
        });

        describe('d3.selection object', function () {
            it('update args', function () {
                d3.select('#chart').html('');
                args.bindto = d3.select('#chart');
                expect(true).toBeTruthy();
            });
            it('should be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(1);
            });
        });

        describe('null', function () {
            it('update args', function () {
                d3.select('#chart').html('');
                args.bindto = null;
                expect(true).toBeTruthy();
            });
            it('should not be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(0);
            });
        });

        describe('empty string', function () {
            it('update args', function () {
                d3.select('#chart').html('');
                args.bindto = '';
                expect(true).toBeTruthy();
            });
            it('should not be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(0);
            });
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
