var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart data', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', 150, 120, 110, 140, 115, 125]
            ],
            order: function () {
                return 0;
            }
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('function in data.order', function () {
        it('should return false in isOrderAsc and isOrderDesc functions', function () {
            expect(chart.internal.isOrderAsc() || chart.internal.isOrderDesc()).toBe(false);
        });
    });

    describe('data.xs', function () {

        describe('normal x', function () {
 
            it('should have correct number of xs for each', function () {
                expect(Object.keys(chart.internal.data.xs).length).toBe(3);
                expect(chart.internal.data.xs.data1.length).toBe(6);
                expect(chart.internal.data.xs.data2.length).toBe(6);
                expect(chart.internal.data.xs.data3.length).toBe(6);
            });

            it('should have integer index as x', function () {
                for (var i = 0; i < chart.internal.data.xs.data3.length; i++) {
                    expect(chart.internal.data.xs.data1[i]).toBe(i);
                    expect(chart.internal.data.xs.data2[i]).toBe(i);
                    expect(chart.internal.data.xs.data3[i]).toBe(i);
                }
            });

        });

        describe('timeseries x', function () {
            it('should load timeseries data successfully', function () {
                args = {
                    data: {
                        x : 'date',
                        columns: [
                            ['date', '2013-01-01', '2013-01-02', '2013-01-03'],
                            ['data1', 30, 200, 100],
                            ['data2', 130, 300, 200]
                        ]
                    },
                    axis : {
                        x : {
                            type : 'timeseries'
                        }
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should have correct number of xs', function () {
                expect(Object.keys(chart.internal.data.xs).length).toBe(2);
                expect(chart.internal.data.xs.data1.length).toBe(3);
                expect(chart.internal.data.xs.data2.length).toBe(3);
            });

            it('should have Date object as x', function () {
                var xs = chart.internal.data.xs;
                expect(+xs.data1[0]).toBe(+new Date(2013, 0, 1, 0, 0, 0));
                expect(+xs.data1[1]).toBe(+new Date(2013, 0, 2, 0, 0, 0));
                expect(+xs.data1[2]).toBe(+new Date(2013, 0, 3, 0, 0, 0));
                expect(+xs.data2[0]).toBe(+new Date(2013, 0, 1, 0, 0, 0));
                expect(+xs.data2[1]).toBe(+new Date(2013, 0, 2, 0, 0, 0));
                expect(+xs.data2[2]).toBe(+new Date(2013, 0, 3, 0, 0, 0));
            });
        });

        describe('milliseconds timeseries x', function () {

            describe('as date string', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            x : 'date',
                            xFormat: '%Y-%m-%d %H:%M:%S.%L',
                            columns: [
                                ['date', "2014-05-20 17:25:00.123", "2014-05-20 17:30:00.345"],
                                ['data1', 30, 200],
                                ['data2', 130, 300]
                            ]
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                tick: {
                                    format: '%Y-%m-%d %H:%M:%S.%L',
                                    multiline: false
                                }
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have correct number of xs', function () {
                    expect(Object.keys(chart.internal.data.xs).length).toBe(2);
                    expect(chart.internal.data.xs.data1.length).toBe(2);
                    expect(chart.internal.data.xs.data2.length).toBe(2);
                });

                it('should have Date object as x', function () {
                    var xs = chart.internal.data.xs;
                    expect(+xs.data1[0]).toBe(+new Date(2014, 4, 20, 17, 25, 0, 123));
                    expect(+xs.data1[1]).toBe(+new Date(2014, 4, 20, 17, 30, 0, 345));
                    expect(+xs.data2[0]).toBe(+new Date(2014, 4, 20, 17, 25, 0, 123));
                    expect(+xs.data2[1]).toBe(+new Date(2014, 4, 20, 17, 30, 0, 345));
                });

                it('should have milliseconds tick format', function () {
                    var expected = ["2014-05-20 17:25:00.123", "2014-05-20 17:30:00.345"];
                    chart.internal.main.selectAll('.c3-axis-x g.tick text').each(function (d, i) {
                        expect(d3.select(this).text()).toBe(expected[i]);
                    });
                });

            });

            describe('as unixtime number', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            x : 'date',
                            columns: [
                                ['date', 1417622461123, 1417622522345],
                                ['data1', 30, 200],
                                ['data2', 130, 300]
                            ]
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                tick: {
                                    format: '%Y-%m-%d %H:%M:%S.%L'
                                }
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have correct number of xs', function () {
                    expect(Object.keys(chart.internal.data.xs).length).toBe(2);
                    expect(chart.internal.data.xs.data1.length).toBe(2);
                    expect(chart.internal.data.xs.data2.length).toBe(2);
                });

                it('should have Date object as x', function () {
                    var xs = chart.internal.data.xs;
                    expect(+xs.data1[0]).toBe(+new Date(2014, 11, 3, 16, 1, 1, 123));
                    expect(+xs.data1[1]).toBe(+new Date(2014, 11, 3, 16, 2, 2, 345));
                    expect(+xs.data2[0]).toBe(+new Date(2014, 11, 3, 16, 1, 1, 123));
                    expect(+xs.data2[1]).toBe(+new Date(2014, 11, 3, 16, 2, 2, 345));
                });
            });

            describe('as unixtime string', function () {

                it('should upate args', function () {
                    args = {
                        data: {
                            x : 'date',
                            columns: [
                                ['date', "1417622461123", "1417622522345"],
                                ['data1', 30, 200],
                                ['data2', 130, 300]
                            ]
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                tick: {
                                    format: '%Y-%m-%d %H:%M:%S.%L',
                                    multiline: false
                                }
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have correct number of xs', function () {
                    expect(Object.keys(chart.internal.data.xs).length).toBe(2);
                    expect(chart.internal.data.xs.data1.length).toBe(2);
                    expect(chart.internal.data.xs.data2.length).toBe(2);
                });

                it('should have Date object as x', function () {
                    var xs = chart.internal.data.xs;
                    expect(+xs.data1[0]).toBe(+new Date(2014, 11, 3, 16, 1, 1, 123));
                    expect(+xs.data1[1]).toBe(+new Date(2014, 11, 3, 16, 2, 2, 345));
                    expect(+xs.data2[0]).toBe(+new Date(2014, 11, 3, 16, 1, 1, 123));
                    expect(+xs.data2[1]).toBe(+new Date(2014, 11, 3, 16, 2, 2, 345));
                });

            });

        });

    });

    describe('data.label', function () {

        describe('with small values', function () {

            it('should update args to show data label', function () {
                args = {
                    data: {
                        columns: [
                            ['data1', 0.03, 0.2, 0.1, 0.4, 0.15, 0.250]
                        ],
                        labels: true
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should have proper y domain', function () {
                var domain = chart.internal.y.domain();
                expect(domain[0]).toBeCloseTo(-0.02);
                expect(domain[1]).toBeCloseTo(0.45);
            });
        });

        describe('with positive values and null', function () {

            describe('on not rotated axis', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', 190, 200, 190, null],
                            ],
                            type: 'bar',
                            labels: {
                                format: function (v) {
                                    if (v === null) {
                                        return 'Not Applicable';
                                    }
                                    return d3.format('$')(v);
                                }
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(0, -1);
                    expect(domain[1]).toBeCloseTo(227, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [67, 49, 67, 423],
                        expectedXs = [74, 221, 368, 515];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(189, -1);
                    expect(domain[1]).toBeCloseTo(201, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [375, 40, 375, 422],
                        expectedXs = [6, 198, 391, 583];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

            });

            describe('on rotated axis', function () {

                it('should update args', function () {
                    args.data.type = 'bar';
                    args.axis = {
                        rotated: true
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(0, -1);
                    expect(domain[1]).toBeCloseTo(231, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [57, 163, 269, 375],
                        expectedXs = [490, 516, 490, 4];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(188, -1);
                    expect(domain[1]).toBeCloseTo(202, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [9, 147, 286, 424],
                        expectedXs = [76, 526, 76, 4];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

            });

        });

        describe('with positive values and null', function () {

            describe('on not rotated axis', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', -190, -200, -190, null],
                            ],
                            type: 'bar',
                            labels: {
                                format: function (v) {
                                    if (v === null) {
                                        return 'Not Applicable';
                                    }
                                    return d3.format('$')(v);
                                }
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-227, -1);
                    expect(domain[1]).toBeCloseTo(0, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [368, 387, 368, 12],
                        expectedXs = [74, 221, 368, 515];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-201, -1);
                    expect(domain[1]).toBeCloseTo(-189, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [58, 392, 58, 12],
                        expectedXs = [6, 198, 391, 583];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

            });

            describe('on rotated axis', function () {

                it('should update args', function () {
                    args.data.type = 'bar';
                    args.axis = {
                        rotated: true
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-232, -1);
                    expect(domain[1]).toBeCloseTo(0, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [57, 163, 269, 375],
                        expectedXs = [103, 78, 103, 526];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-202, -1);
                    expect(domain[1]).toBeCloseTo(-188, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [9, 147, 286, 424],
                        expectedXs = [511, 67, 511, 526];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

            });

        });

        describe('with positive and negative values and null', function () {

            describe('on non rotated axis', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', -190, 200, 190, null],
                            ],
                            type: 'bar',
                            labels: {
                                format: function (v) {
                                    if (v === null) {
                                        return 'Not Applicable';
                                    }
                                    return d3.format('$')(v);
                                }
                            }
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-243, -1);
                    expect(domain[1]).toBeCloseTo(253, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [392, 43, 52, 215],
                        expectedXs = [74, 221, 368, 515];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-243, -1);
                    expect(domain[1]).toBeCloseTo(253, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [392, 40, 49, 212],
                        expectedXs = [6, 198, 391, 583];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });
            });

            describe('on rotated axis', function () {

                it('should update args', function () {
                    args.data.type = 'bar';
                    args.axis = {
                        rotated: true
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-254, -1);
                    expect(domain[1]).toBeCloseTo(260, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [57, 163, 269, 375],
                        expectedXs = [69, 525, 513, 295];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-254, -1);
                    expect(domain[1]).toBeCloseTo(260, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [9, 147, 286, 424],
                        expectedXs = [67, 527, 515, 297];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });
            });

        });

        describe('with positive grouped values', function () {

            describe('on non rotated axis', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', 30, 200, 100, 500],
                                ['data2', 50, 20, 10, 40],
                                ['data3', 250, 220, 210, 240],
                            ],
                            groups: [['data1', 'data2', 'data3']],
                            labels: true,
                            type: 'bar',
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(0, -1);
                    expect(domain[1]).toBeCloseTo(885, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [385, 317, 370, 164],
                        expectedXs = [74, 221, 368, 515];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-94, -1);
                    expect(domain[1]).toBeCloseTo(884, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [344, 284, 331, 144],
                        expectedXs = [6, 198, 391, 583];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

            });

            describe('on rotated axis', function () {

                it('should update args', function () {
                    args.data.type = 'bar';
                    args.axis = {
                        rotated: true
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(0, -1);
                    expect(domain[1]).toBeCloseTo(888, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [57, 163, 269, 375],
                        expectedXs = [57, 150, 77, 363];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-87, -1);
                    expect(domain[1]).toBeCloseTo(887, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [9, 147, 286, 424],
                        expectedXs = [107, 192, 125, 386];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });
            });

        });

        describe('with negative grouped values', function () {

            describe('on non rotated axis', function () {

                it('should update args', function () {
                    args = {
                        data: {
                            columns: [
                                ['data1', -30, -200, -100, -500],
                                ['data2', -50, -20, -10, -40],
                                ['data3', -250, -220, -210, -240]
                            ],
                            groups: [['data1', 'data2', 'data3']],
                            labels: true,
                            type: 'bar',
                        }
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-885, -1);
                    expect(domain[1]).toBeCloseTo(0, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [51, 118, 65, 272],
                        expectedXs = [74, 221, 368, 515];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-884, -1);
                    expect(domain[1]).toBeCloseTo(94, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [88, 149, 101, 288],
                        expectedXs = [6, 198, 391, 583];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

            });

            describe('on rotated axis', function () {

                it('should update args', function () {
                    args.data.type = 'bar';
                    args.axis = {
                        rotated: true
                    };
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-894, -1);
                    expect(domain[1]).toBeCloseTo(0, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [57, 163, 269, 375],
                        expectedXs = [533, 440, 513, 230];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });

                it('should update args', function () {
                    args.data.type = 'line';
                    expect(true).toBeTruthy();
                });

                it('should have y domain with proper padding', function () {
                    var domain = chart.internal.y.domain();
                    expect(domain[0]).toBeCloseTo(-894, -1);
                    expect(domain[1]).toBeCloseTo(94, -1);
                });

                it('should locate labels above each data point', function () {
                    var texts = chart.internal.main.selectAll('.c3-texts-data1 text'),
                        expectedYs = [9, 147, 286, 424],
                        expectedXs = [480, 397, 462, 205];
                    texts.each(function (d, i) {
                        var text = d3.select(this);
                        expect(+text.attr('y')).toBeCloseTo(expectedYs[i], -2);
                        expect(+text.attr('x')).toBeCloseTo(expectedXs[i], -2);
                    });
                });
            });

        });

    });

});
