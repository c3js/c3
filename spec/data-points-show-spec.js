describe('c3 points show', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('when use a column name and points indexes', function () {

        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ],
                },
                point: {
                    show: ["data1", 0, 2, 4],
                }
            };
        });

        it('should be able to show only those point in that column', function () {
            var serie = 'data1';
            var expectedValue = ['1', '0', '1', '0', '1', '0'];
            d3.selectAll('.c3-circles-' + serie).each(function (d, i) {
                var circle = d3.select(this);
                expect(d.id).toEqual(serie);
                expect(circle.style('opacity')).toEqual(expectedValue[i]);
            });
        });

    });

    describe('when no column name is specified and only indexes are used', function () {

        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ],
                },
                point: {
                    show: [0, 2, 4],
                }
            };
        });

        it('should be able to show those points', function () {
            var values = ['1', '0', '1', '0', '1', '0'];
            d3.selectAll('.c3-circle-data1').each(function (d, i) {
                var circle = d3.select(this);
                expect(circle.style('opacity')).toEqual(values[i]);
            });
            d3.selectAll('.c3-circle-data2').each(function (d, i) {
                var circle = d3.select(this);
                expect(circle.style('opacity')).toEqual(values[i]);
            });
        });

    });

    describe('when a function is used', function () {

        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ],
                },
                point: {
                    show: function(d){
                        return d.index % 2 !== 0 ? '1' : '0';
                    },
                }
            };
        });

        it('should be able to show points based on the returned value', function () {
            var values = ['0', '1', '0', '1', '0', '1'];
            d3.selectAll('.c3-circle-data1').each(function (d, i) {
                var circle = d3.select(this);
                expect(circle.style('opacity')).toEqual(values[i]);
            });
            d3.selectAll('.c3-circle-data2').each(function (d, i) {
                var circle = d3.select(this);
                expect(circle.style('opacity')).toEqual(values[i]);
            });
        });

    });

    describe('when a function is used with aditional parameters', function () {

        beforeAll(function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ],
                },
                point: {
                    show: function(d, indexes = [0, 1, 2]){
                        return indexes.indexOf(d.index) >= 0 ? '1' : '0';
                    },
                }
            };
        });

        it('should be able to show points based on the returned value', function () {
            var expectedValue = ['1', '1', '1', '0', '0', '0', '1', '1', '1', '0', '0', '0'];
            d3.selectAll('.c3-circles').each(function (d, i) {
                var circle = d3.select(this);
                expect(circle.style('opacity')).toEqual(expectedValue[i]);
            });
        });

    });
});