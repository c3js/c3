var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 api grid', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250]
            ]
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('ygrid.add and ygrid.remove', function () {

        it('should update y grids', function (done) {
            var main = chart.internal.main,
                expectedGrids = [
                    {
                        value: 100,
                        text: 'Pressure Low'
                    },
                    {
                        value: 200,
                        text: 'Pressure High'
                    }
                ],
                grids;

            // Call ygrids.add
            chart.ygrids.add(expectedGrids);
            setTimeout(function () {
                grids = main.selectAll('.c3-ygrid-line');
                expect(grids.size()).toBe(expectedGrids.length);
                grids.each(function (d, i) {
                    var y = +d3.select(this).select('line').attr('y1'),
                        text = d3.select(this).select('text').text(),
                        expectedY = Math.round(chart.internal.y(expectedGrids[i].value)),
                        expectedText = expectedGrids[i].text;
                    expect(y).toBe(expectedY);
                    expect(text).toBe(expectedText);
                });

                // Call ygrids.remove
                chart.ygrids.remove(expectedGrids);
                setTimeout(function () {
                    grids = main.selectAll('.c3-ygrid-line');
                    expect(grids.size()).toBe(0);
                }, 500);

            }, 500);


            setTimeout(function () {
                done();
            }, 1200);
        });

    });

});
