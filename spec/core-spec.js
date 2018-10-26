describe('c3 chart', function () {
    'use strict';

    var chart;

    var args = {
        svg: {
            classname: 'customclass'
        },
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

        it('should bind to window focus event', done => {
            const addEventListener = window.addEventListener;
            window.addEventListener = (event, handler) => {
                if (event === 'focus') {
                    setTimeout(() => {
                      expect(handler).toBe(chart.internal.windowFocusHandler);
                      window.addEventListener = addEventListener; // restore the original
                      done();
                    }, 10);
                }
            };
            chart = window.initChart(chart, args, () => {});
        });

        describe('should set 3rd party property to Function', function () {
            beforeAll(function () {
                Function.prototype.$extIsFunction = true;
            });

            it('should be created even if 3rd party property has been set', function () {
                var svg = d3.select('#chart svg');
                expect(svg).not.toBeNull();
            });

            it('should be created with a custom class', function () {
                var svg = d3.select('#chart svg');
                expect(svg.attr('class')).not.toBeNull();
                expect(svg.attr('class')).toBe('customclass');
            });
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

    describe('call resize and resized callbacks', function () {
        beforeAll(function () {
            args.bindto = '#chart';
            args.axis = {
                rotated: true
            };
            args.resize_var = false;
            args.resized_var = false;

            args.onresize = function () {
                args.resize_var = true;
            };
            args.onresized = function () {
                args.resized_var = true;
            };

        });

        it('arbitrary parameters should be false before resize', function () {
            expect(args.resize_var).toBe(false);
            expect(args.resized_var).toBe(false);
        });

        it('arbitrary parameters should be true after resize', function () {
            window.dispatchEvent(new Event('resize'));
            expect(args.resize_var).toBe(true);
            expect(args.resized_var).toBe(true);
        });
    });

    describe('bindto', function () {

        describe('selector', function () {
            beforeAll(function () {
                d3.select('#chart').html('');
                args.bindto = '#chart';
            });

            it('should be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(1);
            });
        });

        describe('d3.selection object', function () {
            beforeAll(function () {
                d3.select('#chart').html('');
                args.bindto = d3.select('#chart');
            });
            it('should be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(1);
            });
        });

        describe('null', function () {
            beforeAll(function () {
                d3.select('#chart').html('');
                args.bindto = null;
            });

            it('should not be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(0);
            });
        });

        describe('empty string', function () {
            beforeAll(function () {
                d3.select('#chart').html('');
                args.bindto = '';
            });

            it('should not be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(0);
            });
        });
        describe('bind to selector with rotated axis', function () {
            beforeAll(function () {
                args.bindto = '#chart';
                args.axis = {
                    rotated: true
                };
            });

            it('should be created', function () {
                var svg = d3.select('#chart svg');
                expect(svg.size()).toBe(1);
            });
        });
    });

    describe('empty data', function () {
        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1'],
                        ['data2']
                    ]
                }
            };
        });

        it('should generate a chart', function () {
            var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick');
            expect(ticks.size()).toBe(0);
        });

        describe('more empty data', function () {
            beforeAll(function () {
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
            });

            it('should generate a chart', function () {
                var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick');
                expect(ticks.size()).toBe(0);
            });
        });
    });
});

