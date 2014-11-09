var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart types', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', 150, 120, 110, 140, 115, 125]
            ],
            type: 'pie'
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

    describe('internal.hasArcType', function () {

        it('should return true', function () {
            expect(chart.internal.hasArcType()).toBeTruthy();
        });

        it('should change chart type to "bar" successfully', function () {
            args.data.type = 'bar';
            expect(true).toBeTruthy();
        });

        it('should return false', function () {
            expect(chart.internal.hasArcType()).toBeFalsy();
        });

    });

    describe('internal.hasType', function () {

        it('should change chart type to "pie" successfully', function () {
            args.data.type = 'pie';
            expect(true).toBeTruthy();
        });

        it('should return true for "pie" type', function () {
            expect(chart.internal.hasType('pie')).toBeTruthy();
        });

        it('should return false for "line" type', function () {
            expect(chart.internal.hasType('line')).toBeFalsy();
        });

        it('should return false for "bar" type', function () {
            expect(chart.internal.hasType('bar')).toBeFalsy();
        });

        it('should unload successfully', function () {
            chart.unload([]);
            expect(true).toBeTruthy();
        });

        it('should return true for "pie" type even if no data', function () {
            expect(chart.internal.hasType('pie')).toBeTruthy();
        });

        it('should return false for "line" type even if no data', function () {
            expect(chart.internal.hasType('line')).toBeFalsy();
        });

        it('should return false for "bar" type even if no data', function () {
            expect(chart.internal.hasType('bar')).toBeFalsy();
        });

        it('should change chart type to "bar" successfully', function () {
            args.data.type = 'bar';
            expect(true).toBeTruthy();
        });

        it('should return false for "pie" type even if no data', function () {
            expect(chart.internal.hasType('pie')).toBeFalsy();
        });

        it('should return false for "line" type even if no data', function () {
            expect(chart.internal.hasType('line')).toBeFalsy();
        });

        it('should return true for "bar" type even if no data', function () {
            expect(chart.internal.hasType('bar')).toBeTruthy();
        });


    });

});
