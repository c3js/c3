describe('c3 api.x', function () {
    'use strict';

    var chart;

    var args = {
        data: {
            x: 'x',
            columns: [
                ['x', 10, 30, 45, 50, 70, 100],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 20, 180, 240, 100, 190]
            ]
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    it('should return initial ticks for axis x', function () {
        var expectedValues =   [10, 30, 45, 50, 70, 100];
        d3.select('.c3-axis-x').selectAll('g.tick').each(function (d, i) {
            var text = d3.select(this).select('text').text();
            expect(+text).toBe(expectedValues[i]);
        });
    });

    it('should return new ticks for axis x after calling chart.x', function () {
        var expectedValues =   [16, 26, 55, 60, 75, 90];
        chart.x(expectedValues);
        d3.select('.c3-axis-x').selectAll('g.tick').each(function (d, i) {
            var text = d3.select(this).select('text').text();
            expect(+text).toBe(expectedValues[i]);
        });
    });
});

describe('c3 api.xs', function () {
    'use strict';

    var chart;

    var args = {
        data: {
            xs: {
                'data1': 'x1',
                'data2': 'x2',
            },
            columns: [
                ['x1', 10, 30, 50, 70, 90, 110],
                ['x2', 20, 40, 60, 80, 100],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 20, 180, 240, 100, 190]
            ]
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    it('should return initial ticks for axis x', function () {
        var expectedValues =   ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "110"];
        d3.select('.c3-axis-x').selectAll('g.tick').each(function (d, i) {
            var text = d3.select(this).select('text').text();
            expect(text).toBe(expectedValues[i]);
        });
    });

    it('should return new ticks for axis x after calling chart.xs', function () {
        var expectedValues =    ["15", "25", "35", "45", "55", "65", "75", "85", "95", "105", "115"];
        chart.xs({
            data1: [15, 35, 55, 75, 95, 115],
            data2: [25, 45, 65, 85, 105]
        });
        d3.select('.c3-axis-x').selectAll('g.tick').each(function (d, i) {
            var text = d3.select(this).select('text').text();
            expect(text).toBe(expectedValues[i]);
        });
    });

});
