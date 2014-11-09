var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

var initDom = window.initDom;

describe('c3 chart shape line', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, -150, 250],
                ['data2', 50, 20, 10, 40, 15, 25],
                ['data3', -150, 120, 110, 140, 115, 125]
            ],
            type: 'line'
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

    describe('shape-rendering for line chart', function () {

        it("should not have shape-rendering when it's line chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering');
                expect(style).toBe('auto');
            });
        });

        it('should chnage to step chart', function () {
            args.data.type = 'step';
            expect(true).toBeTruthy();
        });

        it("should have shape-rendering = crispedges when it's step chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering');
                expect(style).toBe('crispedges');
            });
        });

    });

});
