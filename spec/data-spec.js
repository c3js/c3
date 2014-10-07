var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart data', function () {
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
                ],
                order: function () {
                    return 0;
                }
            }
        });
        d3 = chart.internal.d3;
    });

    describe('function in data.order', function () {
        it('should return false in isOrderAsc and isOrderDesc functions', function () {
            expect(chart.internal.isOrderAsc() || chart.internal.isOrderDesc()).toBe(false);
        });
    });
});
