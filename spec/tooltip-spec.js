var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart tooltip', function () {
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

    describe('tooltip position', function () {

        describe('without left margin', function () {

            it('should show tooltip on proper position', function () {
                var eventRect = d3.select('.c3-event-rect-2').node();
                window.setMouseEvent(chart, 'mousemove', 100, 100, eventRect);

                var tooltipContainer = d3.select('.c3-tooltip-container'),
                    top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
                    left = Math.floor(+tooltipContainer.style('left').replace(/px/, '')),
                    topExpected = 115,
                    leftExpected = 307;
                expect(top).toBe(topExpected);
                expect(left).toBe(leftExpected);
            });

        });

        describe('with left margin', function () {

            it('should set left margin', function () {
                d3.select('#chart').style('margin-left', '300px');
                expect(true).toBeTruthy();
            });

            it('should show tooltip on proper position', function () {
                var eventRect = d3.select('.c3-event-rect-2').node();
                window.setMouseEvent(chart, 'mousemove', 100, 100, eventRect);

                var tooltipContainer = d3.select('.c3-tooltip-container'),
                    top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
                    left = Math.floor(+tooltipContainer.style('left').replace(/px/, '')),
                    topExpected = 115,
                    leftExpected = 307;
                expect(top).toBe(topExpected);
                expect(left).toBe(leftExpected);
            });

        });

    });

});
