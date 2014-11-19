var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

var setMouseEvent = window.setMouseEvent;

describe('c3 chart shape bar', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, -150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', -150, 120, 110, 140, 115, 125]
            ],
            type: 'bar'
        },
        axis: {
            rotated: false
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('internal.isWithinBar', function () {

        describe('with normal axis', function () {

            it('should not be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 0, 0);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 31, 280);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

            it('should not be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 68, 280);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 68, 350);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

        });

        describe('with rotated axis', function () {

            it('should change the chart as axis rotated', function () {
                args.axis.rotated = true;
                expect(true).toBeTruthy();
            });

            it('should not be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 0, 0);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 190, 20);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

            it('should be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setMouseEvent(chart, 'click', 68, 50);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

        });

    });

});
