var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart zoom', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 3150, 250],
                ['data2', 50, 20, 10, 40, 15, 6025]
            ]
        },
        axis: {
            x: {
                extent: [1, 2]
            }
        },
        zoom: {
            enable: true
        },
        subchart: {
            show: true
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('default extent', function () {

        it('should have default extent', function () {
            var yDomain = chart.internal.y.domain(),
                subYDomain = chart.internal.subY.domain(),
                brushExtent = chart.internal.brush.extent(),
                expectedYDomain = [-9, 219],
                expectedSubYDomain = [-591.5, 6626.5],
                expectedBrushExtent = [1, 2];
            expect(yDomain[0]).toBe(expectedYDomain[0]);
            expect(yDomain[1]).toBe(expectedYDomain[1]);
            expect(subYDomain[0]).toBe(expectedSubYDomain[0]);
            expect(subYDomain[1]).toBe(expectedSubYDomain[1]);
            expect(brushExtent[0]).toBe(expectedBrushExtent[0]);
            expect(brushExtent[1]).toBe(expectedBrushExtent[1]);
        });
        
    });

});
