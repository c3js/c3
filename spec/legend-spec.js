var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart legend', function () {
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

    it('should be located on the center of chart', function () {
        var box = chart.internal.legend.node().getBoundingClientRect();
        expect(box.left + box.right).toBe(640);
    });

});
