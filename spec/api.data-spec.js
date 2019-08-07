describe('c3 api data', function () {
    'use strict';

    var chart;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 5000, 2000, 1000, 4000, 1500, 2500]
            ],
            names: {
                data1: 'Data Name 1',
                data2: 'Data Name 2'
            },
            colors: {
                data1: '#FF0000',
                data2: '#00FF00'
            },
            axes: {
                data1: 'y',
                data2: 'y2'
            }
        },
        axis: {
            y2: {
                show: true
            }
        }
    };

    beforeEach(function (done) {
        jasmine.addMatchers(customMatchers);
        chart = window.initChart(chart, args, done);
    });

    describe('data()', function () {

        it('should return all of data if no argument given', function () {
            var results = chart.data(),
                expected = ['data1', 'data2'];
            results.forEach(function (result, i) {
                expect(result.id).toBe(expected[i]);
            });
        });

        it('should return specified data if string argument given', function () {
            var results = chart.data('data1');
            expect(results.length).toBe(1);
            expect(results[0].id).toBe('data1');
        });

        it('should return specified data if array argument given', function () {
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

    describe('data.values()', function () {

        it('should return values for specified target', function () {
            var values = chart.data.values('data1'),
                expectedValues = [30, 200, 100, 400, 150, 250];
            expect(values.length).toBe(6);
            values.forEach(function (v, i) {
                expect(v).toBe(expectedValues[i]);
            });
        });

        it('should return null when no args', function () {
            var values = chart.data.values();
            expect(values).toBeNull();
        });

    });

    describe('data.names()', function () {

        it('should return data.names specified as argument', function () {
            var results = chart.data.names();
            expect(results.data1).toBe('Data Name 1');
            expect(results.data2).toBe('Data Name 2');
        });

        it('should return data.names specified as api', function () {
            var results = chart.data.names({
                data1: 'New Data Name 1',
                data2: 'New Data Name 2'
            });
            expect(results.data1).toBe('New Data Name 1');
            expect(results.data2).toBe('New Data Name 2');
        });

        it('should set data.names specified as api', function () {
            expect(d3.select('.c3-legend-item-data1 text').text()).toBe("New Data Name 1");
            expect(d3.select('.c3-legend-item-data2 text').text()).toBe("New Data Name 2");
        });

    });

    describe('data.colors()', function () {

        it('should return data.colors specified as argument', function () {
            var results = chart.data.colors();
            expect(results.data1).toBeHexOrRGB('#FF0000');
            expect(results.data2).toBeHexOrRGB('#00FF00');
        });

        it('should return data.colors specified as api', function () {
            var results = chart.data.colors({
                data1: '#00FF00',
                data2: '#FF0000'
            });
            expect(results.data1).toBeHexOrRGB('#00FF00');
            expect(results.data2).toBeHexOrRGB('#FF0000');
        });

        it('should set data.colors specified as api', function () {
            expect(d3.select('.c3-line-data1').style('stroke')).toBeHexOrRGB("#00ff00");
            expect(d3.select('.c3-line-data2').style('stroke')).toBeHexOrRGB("#ff0000");
            expect(d3.select('.c3-legend-item-data1 .c3-legend-item-tile').style('stroke')).toBeHexOrRGB("#00ff00");
            expect(d3.select('.c3-legend-item-data2 .c3-legend-item-tile').style('stroke')).toBeHexOrRGB("#ff0000");
        });

    });

    describe('data.axes()', function () {

        it('should return data.axes specified as argument', function () {
            var results = chart.data.axes();
            expect(results.data1).toBe('y');
            expect(results.data2).toBe('y2');
            expect(d3.select('.c3-axis-y g.tick text').text()).toBe('0');
            expect(d3.select('.c3-axis-y2 g.tick text').text()).toBe('1000');
        });

        it('should return data.axes specified as api', function () {
            var results = chart.data.axes({
                data1: 'y2',
                data2: 'y'
            });
            expect(results.data1).toBe('y2');
            expect(results.data2).toBe('y');
            expect(d3.select('.c3-axis-y g.tick text').text()).toBe('1000');
            expect(d3.select('.c3-axis-y2 g.tick text').text()).toBe('0');
        });

    });

    describe('data.stackNormalized()', function() {

        beforeEach(function(done) {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 500, 850, 1000, 200, 350, 100]
                    ],
                    groups: [
                        [ 'data1', 'data2' ]
                    ],
                    stack: {
                        normalize: true
                    }
                }
            };

            chart = window.initChart(chart, args, done);
        });

        it('can toggle option', function(done) {
            expect(chart.data.stackNormalized()).toBe(true);
            expect(chart.internal.y.domain()).toEqual([0, 100]);

            chart.data.stackNormalized(false);

            setTimeout(function() {
                expect(chart.data.stackNormalized()).toBe(false);
                expect(chart.internal.y.domain()).toEqual([0, 1200]);
                done();
            }, 100);

        });


    });
});

describe('c3 api data.x', function () {
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

    it('should return values for target data1', function () {
        var values = chart.data.values('data1'),
            expectedValues =   [30, 200, 100, 400, 150, 250];
        expect(values.length).toBe(6);
        values.forEach(function (v, i) {
            expect(v).toBe(expectedValues[i]);
        });
    });

    it('should return null when no args', function () {
        var values = chart.data.values();
        expect(values).toBeNull();
    });

    it('should return data values for  data if string argument given', function () {
        var results = chart.data('data1');
        expect(results.length).toBe(1);
        expect(results[0].id).toBe('data1');
    });

    it('should return specified data if array argument given', function () {
        var results = chart.data(['data1', 'data2']);
        expect(results.length).toBe(2);
        expect(results[0].id).toBe('data1');
        expect(results[1].id).toBe('data2');
    });

});

describe('c3 api data.xs', function () {
    'use strict';

    var chart;

    var args = {
        data: {
            xs: {
                'data1': 'x1',
                'data2': 'x2',
            },
            columns: [
                ['x1', 10, 30, 45, 50, 70, 100],
                ['x2', 30, 50, 75, 100, 120],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 20, 180, 240, 100, 190]
            ]
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    it('should return values for target data1', function () {
        var values = chart.data.values('data1'),
            expectedValues =   [30, 200, 100, 400, 150, 250];
        expect(values.length).toBe(6);
        values.forEach(function (v, i) {
            expect(v).toBe(expectedValues[i]);
        });
    });

    it('should return null when no args', function () {
        var values = chart.data.values();
        expect(values).toBeNull();
    });

    it('should return data values for  data if string argument given', function () {
        var results = chart.data('data1');
        expect(results.length).toBe(1);
        expect(results[0].id).toBe('data1');
    });

    it('should return specified data if array argument given', function () {
        var results = chart.data(['data1', 'data2']);
        expect(results.length).toBe(2);
        expect(results[0].id).toBe('data1');
        expect(results[1].id).toBe('data2');
    });

});

var customMatchers = {
    toBeHexOrRGB: function (util, customEqualityTesters) {
        'use strict';

        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
                ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
        }

        return {
            compare: function (actual, expected) {
                if (expected === undefined) {
                    expected = '';
                }

                var result = {};
                actual = actual.match('rgb') ? rgb2hex(actual) : actual;
                expected = expected.match('rgb') ? rgb2hex(expected) : expected;

                result.pass = util.equals(actual, expected, customEqualityTesters);
                if (result.pass) {
                    result.message = "Expected " + actual + " not to be quite so goofy";
                } else {
                    result.message = "Expected " + actual + " to be goofy, but it was not very goofy";

                }

                return result;
            }
        };
    }
};
