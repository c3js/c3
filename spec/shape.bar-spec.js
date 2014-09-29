var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

var initDom = window.initDom,
    setEvent = window.setEvent;

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
        if (typeof chart === 'undefined') {
            initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter').style('display', 'none');

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('internal.isWithinBar', function () {

        describe('with normal axis', function () {

            it('should not be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setEvent(chart, 0, 0);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setEvent(chart, 31, 280);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

            it('should not be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setEvent(chart, 68, 280);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setEvent(chart, 68, 350);
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
                setEvent(chart, 0, 0);
                expect(chart.internal.isWithinBar(bar)).toBeFalsy();
            });

            it('should be within bar', function () {
                var bar = d3.select('.c3-target-data1 .c3-bar-0').node();
                setEvent(chart, 190, 20);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

            it('should be within bar of negative value', function () {
                var bar = d3.select('.c3-target-data3 .c3-bar-0').node();
                setEvent(chart, 68, 50);
                expect(chart.internal.isWithinBar(bar)).toBeTruthy();
            });

        });

    });

});
