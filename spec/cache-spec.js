describe('c3 cache', function () {
    'use strict';

    var chart;

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
    });

    it('returns undefined for unknown values', function() {
        expect(chart.internal.getFromCache('undefined')).toBeUndefined();
    });

    it('returns cached value', function() {
        chart.internal.addToCache('cached', 1);

        expect(chart.internal.getFromCache('cached')).toEqual(1);

        chart.internal.addToCache('cached', { x: 1 });

        expect(chart.internal.getFromCache('cached')).toEqual({ x: 1 });
    });

    it('can clear cached values', function() {
        chart.internal.addToCache('cached', 1);

        expect(chart.internal.getFromCache('cached')).toEqual(1);

        chart.internal.resetCache();

        expect(chart.internal.getFromCache('cached')).toBeUndefined();
    });
});

