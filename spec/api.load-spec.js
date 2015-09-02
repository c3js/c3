describe('c3 api load', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('indexed data', function () {

        describe('as column', function () {

            it('should update args', function () {
                args = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250],
                            ['data2', 5000, 2000, 1000, 4000, 1500, 2500]
                        ]
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should load additional data', function (done) {
                var main = chart.internal.main,
                    legend = chart.internal.legend;
                chart.load({
                    columns: [
                        ['data3', 800, 500, 900, 500, 1000, 700]
                    ]
                });
                setTimeout(function () {
                    var target = main.select('.c3-chart-line.c3-target.c3-target-data3'),
                        legendItem = legend.select('.c3-legend-item.c3-legend-item-data3');
                    expect(target.size()).toBe(1);
                    expect(legendItem.size()).toBe(1);
                    done();
                }, 500);
            });

        });

    });

    describe('category data', function () {

        it('should update arg to category data', function () {
            args = {
                data: {
                    x: 'x',
                    columns: [
                        ['x', 'cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'],
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 5000, 2000, 1000, 4000, 1500, 2500]
                    ]
                },
                axis: {
                    x: {
                        type: 'category'
                    }
                }
            };
            expect(true).toBeTruthy();
        });

        describe('as column', function () {

            it('should load additional data', function (done) {
                var main = chart.internal.main,
                    legend = chart.internal.legend;
                chart.load({
                    columns: [
                        ['data3', 800, 500, 900, 500, 1000, 700]
                    ]
                });
                setTimeout(function () {
                    var target = main.select('.c3-chart-line.c3-target.c3-target-data3'),
                        legendItem = legend.select('.c3-legend-item.c3-legend-item-data3'),
                        tickTexts = main.selectAll('.c3-axis-x g.tick text'),
                        expected = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'];
                    expect(target.size()).toBe(1);
                    expect(legendItem.size()).toBe(1);
                    tickTexts.each(function (d, i) {
                        var text = d3.select(this).select('tspan').text();
                        expect(text).toBe(expected[i]);
                    });
                    done();
                }, 500);
            });

            it('should load additional data', function (done) {
                var main = chart.internal.main,
                    legend = chart.internal.legend;
                chart.load({
                    columns: [
                        ['x', 'new1', 'new2', 'new3', 'new4', 'new5', 'new6'],
                        ['data3', 800, 500, 900, 500, 1000, 700]
                    ]
                });
                setTimeout(function () {
                    var target = main.select('.c3-chart-line.c3-target.c3-target-data3'),
                        legendItem = legend.select('.c3-legend-item.c3-legend-item-data3'),
                        tickTexts = main.selectAll('.c3-axis-x g.tick text'),
                        expected = ['new1', 'new2', 'new3', 'new4', 'new5', 'new6'];
                    expect(target.size()).toBe(1);
                    expect(legendItem.size()).toBe(1);
                    tickTexts.each(function (d, i) {
                        var text = d3.select(this).select('tspan').text();
                        expect(text).toBe(expected[i]);
                    });
                    done();
                }, 500);
            });

        });

    });

    describe('timeseries data', function(){

        describe('as column', function(){

            it('should update args', function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
                            ['data1', 30, 200, 100, 400, 150, 250]
                        ]
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%Y-%m-%d'
                            }
                        }
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should update x axis format', function (done) {
                var main = chart.internal.main;
                setTimeout(function () {
                    var target = main.select('.c3-axis.c3-axis-x').select('tspan');
                    expect(target.text()).toBe('2013-01-01');

                    chart.load({
                        xtickformat: '%Y'
                    });
                    setTimeout(function () {
                        var target = main.select('.c3-axis.c3-axis-x').select('tspan');
                        expect(target.text()).toBe('2013');
                        done();
                    }, 500);
                }, 500);

            });
        });
    });

});
