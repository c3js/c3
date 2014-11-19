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
        if (typeof chart === 'undefined') {
            window.initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter').style('display', 'none');

        window.setTimeout(function () {
            done();
        }, 10);
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
            it('should load timeseries data successfully', function () {
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

    });
});
