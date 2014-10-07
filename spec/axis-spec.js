var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart axis', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', 150, 120, 110, 140, 115, 125]
            ]
        },
        axis: {
            y: {
                tick: {
                    values: null,
                    count: undefined
                }
            },
            y2: {
                tick: {
                    values: null,
                    count: undefined
                }
            }
        }
    };

    beforeEach(function () {
        window.initDom();
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
    });

    describe('axis.y.tick.count', function () {

        var i = 1;

        beforeEach(function () {
            args.axis.y.tick.count = i++;
            chart = window.c3.generate(args);
        });

        it('should have only 1 tick on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(1);
        });

        it('should have 2 ticks on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(2);
        });

        it('should have 3 ticks on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(3);
        });

    });

    describe('axis.y.tick.values', function () {

        var values = [100, 500];

        beforeEach(function () {
            args.axis.y.tick.values = values;
            chart = window.c3.generate(args);
        });

        it('should have only 2 tick on y axis', function () {
            var ticksSize = d3.select('.c3-axis-y').selectAll('g.tick').size();
            expect(ticksSize).toBe(2);
        });

        it('should have specified tick texts', function () {
            d3.select('.c3-axis-y').selectAll('g.tick').each(function (d, i) {
                var text = d3.select(this).select('text').text();
                expect(+text).toBe(values[i]);
            });
        });

    });

});
