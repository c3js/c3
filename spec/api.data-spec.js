var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 api data', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25]
            ]
        }
    };

    beforeEach(function (done) {
        if (typeof chart === 'undefined') {
            window.initDom();
        }
        chart = window.c3.generate(args);
        d3 = chart.internal.d3;
        chart.internal.d3.select('.jasmine_html-reporter')
            .style('position', 'absolute')
            .style('right', 0);

        window.setTimeout(function () {
            done();
        }, 10);
    });

    describe('data()', function () {

        it('should return all of data if no argument given', function () {
            var results = chart.data(),
                expected = ['data1', 'data2'];
            results.forEach(function (result, i) {
                expect(result.id).toBe(expected[i]);
            });
        });

        it('should return specifid data if string argument given', function () {
            var results = chart.data('data1');
            expect(results.length).toBe(1);
            expect(results[0].id).toBe('data1');
        });

        it('should return specifid data if array argument given', function () {
            var results = chart.data(['data1', 'data2']);
            expect(results.length).toBe(2);
            expect(results[0].id).toBe('data1');
            expect(results[1].id).toBe('data2');
        });

    });

    describe('data.shown()', function () {

        it('should return only shown targets', function () {
            var results;
            chart.hide('data1');
            results = chart.data.shown();
            expect(results.length).toBe(1);
            expect(results[0].id).toBe('data2');
        });

    });

});
