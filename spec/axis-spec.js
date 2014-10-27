var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart axis', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', 150, 120, 110, 140, 115, 125]
            ]
        },
        axis: {
            y: {
                tick: {
                    values: null,
                    count: undefined
                }
            },
            y2: {
                tick: {
                    values: null,
                    count: undefined
                }
            }
        }
    };

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            window.initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter')
            .style('position', 'absolute')
            .style('right', 0);

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('axis.y.tick.count', function () {

        var i = 1;

        beforeEach(function () {
            args.axis.y.tick.count = i++;
            chart = window.c3.generate(args);
        });

        it('should have only 1 tick on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(1);
        });

        it('should have 2 ticks on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(2);
        });

        it('should have 3 ticks on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(3);
        });

    });

    describe('axis.y.tick.values', function () {

        var values = [100, 500];

        beforeEach(function () {
            args.axis.y.tick.values = values;
            chart = window.c3.generate(args);
        });

        it('should have only 2 tick on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(2);
        });

        it('should have specified tick texts', function () {
            d3.select('.c3-axis-y').selectAll('g.tick').each(function (d, i) {
                var text = d3.select(this).select('text').text();
                expect(+text).toBe(values[i]);
            });
        });

    });

    describe('axis.x.tick.width', function () {

        describe('indexed x axis and y/y2 axis', function () {

            describe('not rotated', function () {

                it('should update args successfully', function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', 30, 200, 100, 400, 150, 250],
                                ['data2', 50, 20, 10, 40, 15, 25]
                            ],
                            axes: {
                                data2: 'y2'
                            }
                        },
                        axis: {
                            y2: {
                                show: true
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should construct indexed x axis properly', function () {
                    var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick'),
                        expectedX = '0',
                        expectedDy = '.71em';
                    expect(ticks.size()).toBe(6);
                    ticks.each(function (d, i) {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                        tspans.each(function () {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe(i + '');
                            expect(tspan.attr('x')).toBe(expectedX);
                            expect(tspan.attr('dy')).toBe(expectedDy);
                        });
                    });
                });

                it('should set axis.x.tick.format', function () {
                    args.axis.x = {
                        tick: {
                            format: function () {
                                return 'very long tick text on x axis';
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should not split x axis tick text to multiple lines', function () {
                    var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick'),
                        expectedX = '0',
                        expectedDy = '.71em';
                    expect(ticks.size()).toBe(6);
                    ticks.each(function () {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                        tspans.each(function () {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe('very long tick text on x axis');
                            expect(tspan.attr('x')).toBe(expectedX);
                            expect(tspan.attr('dy')).toBe(expectedDy);
                        });
                    });
                });

                it('should construct y axis properly', function () {
                    var ticks = chart.internal.main.select('.c3-axis-y').selectAll('g.tick'),
                        expectedX = '-9',
                        expectedDy = '3';
                    expect(ticks.size()).toBe(9);
                    ticks.each(function (d) {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                        tspans.each(function () {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe(d + '');
                            expect(tspan.attr('x')).toBe(expectedX);
                            expect(tspan.attr('dy')).toBe(expectedDy);
                        });
                    });
                });

                it('should construct y2 axis properly', function () {
                    var ticks = chart.internal.main.select('.c3-axis-y2').selectAll('g.tick'),
                        expectedX = '9',
                        expectedDy = '3';
                    expect(ticks.size()).toBe(9);
                    ticks.each(function (d) {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                        tspans.each(function () {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe(d + '');
                            expect(tspan.attr('x')).toBe(expectedX);
                            expect(tspan.attr('dy')).toBe(expectedDy);
                        });
                    });
                });

                it('should set big values in y', function () {
                    args.data.columns = [
                        ['data1', 3000000000000000, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ];
                    expect(true).toBeTruthy();
                });

                it('should not split y axis tick text to multiple lines', function () {
                    var ticks = chart.internal.main.select('.c3-axis-y2').selectAll('g.tick');
                    ticks.each(function () {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                    });
                });
            });

            describe('rotated', function () {

                it('should update args to rotate axis', function () {
                    args.axis.rotated = true;
                    expect(true).toBeTruthy();
                });

                it('should not split x axis tick text to multiple lines', function () {
                    var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick'),
                        expectedX = '-9',
                        expectedDy = '3';
                    expect(ticks.size()).toBe(6);
                    ticks.each(function () {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                        tspans.each(function () {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe('very long tick text on x axis');
                            expect(tspan.attr('x')).toBe(expectedX);
                            expect(tspan.attr('dy')).toBe(expectedDy);
                        });
                    });
                });

                it('should not split y axis tick text to multiple lines', function () {
                    var ticks = chart.internal.main.select('.c3-axis-y').selectAll('g.tick'),
                        expectedTexts = [
                            '0',
                            '500000000000000',
                            '1000000000000000',
                            '1500000000000000',
                            '2000000000000000',
                            '2500000000000000',
                            '3000000000000000'
                        ],
                        expectedX = '0',
                        expectedDy = '.71em';
                    expect(ticks.size()).toBe(7);
                    ticks.each(function (d, i) {
                        var tspans = d3.select(this).selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                        tspans.each(function () {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe(expectedTexts[i]);
                            expect(tspan.attr('x')).toBe(expectedX);
                            expect(tspan.attr('dy')).toBe(expectedDy);
                        });
                    });
                });
            });
        });

        describe('category axis', function () {

            describe('not rotated', function () {

                it('should update args successfully', function () {
                    args = {
                        data: {
                            x: 'x',
                            columns: [
                                ['x', 'this is a very long tick text on category axis', 'cat1', 'cat2', 'cat3', 'cat4', 'cat5'],
                                ['data1', 30, 200, 100, 400, 150, 250],
                                ['data2', 50, 20, 10, 40, 15, 25]
                            ]
                        },
                        axis: {
                            x: {
                                type: 'category'
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should locate ticks properly', function () {
                    var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick');
                    ticks.each(function (d, i) {
                        var tspans = d3.select(this).selectAll('tspan'),
                            expectedX = '0',
                            expectedDy = '.40em';
                        if (i > 0) { // i === 0 should be checked in next test
                            expect(tspans.size()).toBe(1);
                            tspans.each(function () {
                                var tspan = d3.select(this);
                                expect(tspan.attr('x')).toBe(expectedX);
                                expect(tspan.attr('dy')).toBe(expectedDy);
                            });
                        }
                    });
                });

                it('should split tick text properly', function () {
                    var tick = chart.internal.main.select('.c3-axis-x').select('g.tick'),
                        tspans = tick.selectAll('tspan'),
                        expectedTickTexts = [
                            'this is a very',
                            'long tick text on',
                            'category axis'
                        ],
                        expectedX = '0';
                    expect(tspans.size()).toBe(3);
                    tspans.each(function (d, i) {
                        var tspan = d3.select(this);
                        expect(tspan.text()).toBe(expectedTickTexts[i]);
                        expect(tspan.attr('x')).toBe(expectedX);
                        // unable to define pricise number because it differs depends on environment..
                        if (i === 0) {
                            expect(tspan.attr('dy')).toBe('.40em');
                        } else {
                            expect(tspan.attr('dy')).toBeGreaterThan(8);
                        }
                    });
                });
            });

            describe('rotated', function () {

                it('should update args to rotate axis', function () {
                    args.axis.rotated = true;
                    expect(true).toBeTruthy();
                });

                it('should locate ticks on rotated axis properly', function () {
                    var ticks = chart.internal.main.select('.c3-axis-x').selectAll('g.tick');
                    ticks.each(function (d, i) {
                        var tspans = d3.select(this).selectAll('tspan'),
                            expectedX = '-9',
                            expectedDy = '2';
                        if (i > 0) { // i === 0 should be checked in next test
                            expect(tspans.size()).toBe(1);
                            tspans.each(function () {
                                var tspan = d3.select(this);
                                expect(tspan.attr('x')).toBe(expectedX);
                                expect(tspan.attr('dy')).toBe(expectedDy);
                            });
                        }
                    });
                });

                it('should split tick text on rotated axis properly', function () {
                    var tick = chart.internal.main.select('.c3-axis-x').select('g.tick'),
                        tspans = tick.selectAll('tspan'),
                        expectedTickTexts = [
                            'this is a very',
                            'long tick text',
                            'on category axis'
                        ],
                        expectedX = '-9';
                    expect(tspans.size()).toBe(3);
                    tspans.each(function (d, i) {
                        var tspan = d3.select(this);
                        expect(tspan.text()).toBe(expectedTickTexts[i]);
                        expect(tspan.attr('x')).toBe(expectedX);
                        // unable to define pricise number because it differs depends on environment..
                        if (i === 0) {
                            expect(tspan.attr('dy')).toBeLessThan(0);
                        } else {
                            expect(tspan.attr('dy')).toBeGreaterThan(8);
                        }
                    });
                });

            });

            describe('option used', function () {

                describe('as null', function () {

                    it('should update args not to split ticks', function () {
                        args.axis.x.tick = {
                            width: null
                        };
                        expect(true).toBeTruthy();
                    });

                    it('should not split x tick', function () {
                        var tick = chart.internal.main.select('.c3-axis-x').select('g.tick'),
                            tspans = tick.selectAll('tspan');
                        expect(tspans.size()).toBe(1);
                    });

                });

                describe('as value', function () {

                    it('should update args not to split ticks', function () {
                        args.axis.x.tick = {
                            width: 150
                        };
                        expect(true).toBeTruthy();
                    });

                    it('should split x tick to 2 lines properly', function () {
                        var tick = chart.internal.main.select('.c3-axis-x').select('g.tick'),
                            tspans = tick.selectAll('tspan'),
                            expectedTickTexts = [
                                'this is a very long tick text',
                                'on category axis'
                            ],
                            expectedX = '-9';
                        expect(tspans.size()).toBe(2);
                        tspans.each(function (d, i) {
                            var tspan = d3.select(this);
                            expect(tspan.text()).toBe(expectedTickTexts[i]);
                            expect(tspan.attr('x')).toBe(expectedX);
                            // unable to define pricise number because it differs depends on environment..
                            if (i === 0) {
                                expect(tspan.attr('dy')).toBeLessThan(0);
                            } else {
                                expect(tspan.attr('dy')).toBeGreaterThan(8);
                            }
                        });
                    });

                });

            });

        });

    });

});
