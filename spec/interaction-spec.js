var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart interaction', function () {
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

    describe('generate event rects', function () {

        describe('custom x', function () {

            it('should generate bar chart', function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', 0, 1000, 3000, 10000],
                            ['data', 10, 10, 10, 10]
                        ],
                        type: 'bar'
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should have 4 event rects properly', function () {
                var lefts = [77.5, 137, 203.5, 402.5],
                    widths = [59.5, 66.5, 199, 191.5];
                d3.selectAll('.c3-event-rect').each(function (d, i) {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBe(lefts[i]);
                    expect(box.width).toBe(widths[i]);
                });
            });

            it('should generate bar chart with only one data', function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', 0],
                            ['data', 10]
                        ],
                        type: 'bar'
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should have 1 event rects properly', function () {
                var eventRects = d3.selectAll('.c3-event-rect');
                expect(eventRects.size()).toBe(1);
                eventRects.each(function () {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBe(40.5);
                    expect(box.width).toBe(590);
                });
            });
        });

        describe('timeseries', function () {

            it('should generate line chart with timeseries', function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', '20140101', '20140201', '20140210',  '20140301'],
                            ['data', 10, 10, 10, 10]
                        ]
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should have 4 event rects properly', function () {
                var lefts = [43.5, 191, 349, 494],
                    widths = [147.5, 158, 145, 134];
                d3.selectAll('.c3-event-rect').each(function (d, i) {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBe(lefts[i]);
                    expect(box.width).toBe(widths[i]);
                });

            });

            it('should generate line chart with only 1 data timeseries', function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', '20140101'],
                            ['data', 10]
                        ]
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should have 1 event rects properly', function () {
                var eventRects = d3.selectAll('.c3-event-rect');
                expect(eventRects.size()).toBe(1);
                eventRects.each(function () {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBe(40.5);
                    expect(box.width).toBe(590);
                });
            });

        });

    });

});
