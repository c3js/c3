var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart', function () {
    'use strict';

    var chart, d3;

    beforeEach(function () {
        window.initDom();

        chart = window.c3.generate({
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25],
                    ['data3', 150, 120, 110, 140, 115, 125]
                ]
            }
        });

        d3 = chart.internal.d3;
    });

    it('should be created', function () {
        var svg = d3.select('#chart svg');
        expect(svg).not.toBeNull();
    });

    it('should have same width', function () {
        var svg = d3.select('#chart svg');
        expect(+svg.attr('width')).toBe(640);
    });

    it('should have same height', function () {
        var svg = d3.select('#chart svg');
        expect(+svg.attr('height')).toBe(480);
    });

});
