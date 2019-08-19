var setMouseEvent = window.setMouseEvent;

describe('c3 chart interaction', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('generate event rects', function () {

        describe('custom x', function () {

            beforeAll(function () {
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
            });

            it('should have only 1 event rect properly', function () {
                var eventRects = d3.selectAll('.c3-event-rect');
                expect(eventRects.size()).toBe(1);
                eventRects.each(function () {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBeCloseTo(40.5, -2);
                    expect(box.width).toBeCloseTo(598, -2);
                });
            });

            describe('mouseover', function () {
                const moveMouse = (event, x = 0, y = 0) =>
                    setMouseEvent(chart, event, x, y, d3.select('.c3-event-rect').node());

                beforeAll(function () {
                    window.mouseoverCounter = 0;
                    window.mouseoutCounter = 0;
                    args = {
                        data: {
                            columns: [
                                ['data1', 30, 200, 100, 400, -150, 250],
                                ['data2', 50, 20, 10, 40, 15, 25],
                                ['data3', -150, 120, 110, 140, 115, 125]
                            ],
                            type: 'bar',
                            onmouseout: function() {
                                window.mouseoutCounter += 1;
                            },
                            onmouseover: function() {
                                window.mouseoverCounter += 1;
                            }
                        },
                        axis: {
                            rotated: false
                        }
                    };
                });

                it('should be undefined when not within bar', function () {
                    moveMouse('mouseout');

                    expect(window.mouseoutCounter).toEqual(0);
                    expect(window.mouseoverCounter).toEqual(0);
                    expect(chart.internal.mouseover).toBeUndefined();
                });

                it('should be data value when within bar', function () {
                    moveMouse('mousemove', 31, 280);

                    expect(window.mouseoutCounter).toEqual(0);
                    expect(window.mouseoverCounter).toEqual(1);
                    expect(chart.internal.mouseover).toEqual({
                        x: 0,
                        value: 30,
                        index: 0,
                        id: 'data1',
                        name: 'data1'
                    });
                });

                it('should be undefined after leaving chart', function () {
                    moveMouse('mousemove', 31, 280);
                    moveMouse('mouseout');

                    expect(window.mouseoutCounter).toEqual(1);
                    expect(window.mouseoverCounter).toEqual(1);
                    expect(chart.internal.mouseover).toBeUndefined();
                });

                it('should retrigger mouseover event when returning to same value', function () {
                    moveMouse('mousemove', 31, 280);
                    moveMouse('mouseout');
                    moveMouse('mousemove', 31, 280);

                    expect(window.mouseoutCounter).toEqual(1);
                    expect(window.mouseoverCounter).toEqual(2);
                    expect(chart.internal.mouseover).toEqual({
                        x: 0,
                        value: 30,
                        index: 0,
                        id: 'data1',
                        name: 'data1'
                    });
                });
            });

            describe('should generate bar chart with only one data', function () {
                beforeAll(function(){
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
                });

                it('should have 1 event rects properly', function () {
                    var eventRects = d3.selectAll('.c3-event-rect');
                    expect(eventRects.size()).toBe(1);
                    eventRects.each(function () {
                        var box = d3.select(this).node().getBoundingClientRect();
                        expect(box.left).toBeCloseTo(40.5, -2);
                        expect(box.width).toBeCloseTo(598, -2);
                    });
                });
            });
        });

        describe('timeseries', function () {
            beforeAll(function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', '20140101', '20140201', '20140210',  '20140301'],
                            ['data', 10, 10, 10, 10]
                        ]
                    }
                };
            });

            it('should have only 1 event rect properly', function () {
                var eventRects = d3.selectAll('.c3-event-rect');
                expect(eventRects.size()).toBe(1);
                eventRects.each(function () {
                    var box = d3.select(this).node().getBoundingClientRect();
                    expect(box.left).toBeCloseTo(40.5, -2);
                    expect(box.width).toBeCloseTo(598, -2);
                });
            });

            describe('should generate line chart with only 1 data timeseries', function () {
                beforeAll(function(){
                    args = {
                        data: {
                            x: 'x',
                            columns: [
                                ['x', '20140101'],
                                ['data', 10]
                            ]
                        }
                    };
                });

                it('should have 1 event rects properly', function () {
                    var eventRects = d3.selectAll('.c3-event-rect');
                    expect(eventRects.size()).toBe(1);
                    eventRects.each(function () {
                        var box = d3.select(this).node().getBoundingClientRect();
                        expect(box.left).toBeCloseTo(40.5, -2);
                        expect(box.width).toBeCloseTo(598, -2);
                    });
                });
            });
        });
    });
});
