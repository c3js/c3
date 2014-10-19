var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 api zoom', function () {
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
        zoom: {
            enabled: true
        }
    };

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            window.initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
//        chart.internal.d3.select('.jasmine_html-reporter').style('display', 'none');

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('zoom', function () {

        it('should be zoomed properly', function () {
            var target = [3, 5], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(domain[0]).toBe(target[0]);
            expect(domain[1]).toBe(target[1]);
        });

        it('should be zoomed properly again', function () {
            var target = [1, 4], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(domain[0]).toBe(target[0]);
            expect(domain[1]).toBe(target[1]);
        });

        it('should load timeseries data', function () {
            args = {
                data: {
                    x: 'date',
                    columns: [
                        ['date', '2014-01-01', '2014-01-02', '2014-08-01', '2014-10-19'],
                        ['data1', 30, 200, 100, 400]
                    ]
                },
                axis: {
                    x: {
                        type: 'timeseries'
                    }
                },
                zoom: {
                    enabled: true
                }
            };
            expect(true).toBeTruthy();
        });

        it('should be zoomed properly', function () {
            var target = [new Date(2014, 7, 1), new Date(2014, 8, 1)], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(+domain[0]).toBe(+target[0]);
            expect(+domain[1]).toBe(+target[1]);
        });

        it('should be zoomed properly', function () {
            var target = ['2014-08-01', '2014-09-01'], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(+domain[0]).toBe(+chart.internal.parseDate(target[0]));
            expect(+domain[1]).toBe(+chart.internal.parseDate(target[1]));
        });

    });

    describe('unzoom', function () {

        it('should load indexed data', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250]
                    ]
                },
                zoom: {
                    enabled: true
                }
            };
            expect(true).toBeTruthy();
        });

        it('should be unzoomed properly', function () {
            var target = [1, 4], orginal = chart.internal.x.domain(), domain;

            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(domain[0]).toBe(target[0]);
            expect(domain[1]).toBe(target[1]);

            chart.unzoom();
            domain = chart.internal.x.domain();
            expect(domain[0]).toBe(orginal[0]);
            expect(domain[1]).toBe(orginal[1]);
        });

    });

});
