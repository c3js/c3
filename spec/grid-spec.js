
describe('c3 chart grid', function () {
    'use strict';

    var chart, d3;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250]
            ]
        },
        axis: {
            y: {
                tick: {
                }
            }
        },
        grid: {
            y: {
                show: false
            }
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
        d3 = chart.internal.d3;
    });

    describe('y grid', function () {

        it('should not show y grids', function () {
            expect(chart.internal.main.select('.c3-ygrids').size()).toBe(0);
        });

        it('should update args to show y grids', function () {
            args.grid.y.show = true;
            expect(true).toBeTruthy();
        });

        it('should show y grids', function () {
            var ygrids = chart.internal.main.select('.c3-ygrids');
            expect(ygrids.size()).toBe(1);
            expect(ygrids.selectAll('.c3-ygrid').size()).toBe(9);
        });

        it('should update args to show only 3 y grids', function () {
            args.grid.y.ticks = 3;
            expect(true).toBeTruthy();
        });

        it('should show only 3 y grids', function () {
            var ygrids = chart.internal.main.select('.c3-ygrids');
            expect(ygrids.size()).toBe(1);
            expect(ygrids.selectAll('.c3-ygrid').size()).toBe(3);
        });

        it('should update args to show y grids depending on y axis ticks', function () {
            args.axis.y.tick.count = 5;
            expect(true).toBeTruthy();
        });

        it('should show grids depending on y axis ticks', function () {
            var ygrids = chart.internal.main.select('.c3-ygrids'),
                expectedYs = [];
            ygrids.selectAll('.c3-ygrid').each(function (d, i) {
                expectedYs[i] = +d3.select(this).attr('y1');
            });
            expect(ygrids.size()).toBe(1);
            expect(ygrids.selectAll('.c3-ygrid').size()).toBe(5);
            chart.internal.main.select('.c3-axis-y').selectAll('.tick').each(function (d, i) {
                var t = d3.transform(d3.select(this).attr('transform'));
                expect(t.translate[1]).toBe(expectedYs[i]);
            });
        });

    });

    describe('x grid lines', function () {

        describe('with padding.top', function () {

            it('should have correct height', function () {
                args = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400],
                        ]
                    },
                    grid: {
                        x: {
                            lines: [
                                {value: 3, text: 'Label 3'}
                            ]
                        }
                    },
                    padding: {
                        top: 50
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should show x grid lines', function () {
                var lines = chart.internal.main.select('.c3-xgrid-lines .c3-xgrid-line'),
                    expectedX1 = 593,
                    expectedText = ['Label 3'];
                lines.each(function (id, i) {
                    var line = d3.select(this),
                        l = line.select('line'),
                        t = line.select('text');
                    expect(+l.attr('x1')).toBeCloseTo(expectedX1, -2);
                    expect(t.text()).toBe(expectedText[i]);
                });
            });

        });

        describe('on category axis', function () {

            it('should update args', function () {
                args = {
                    data: {
                        x: 'x',
                        columns: [
                            ['x', 'a', 'b', 'c', 'd'],
                            ['data1', 30, 200, 100, 400],
                        ]
                    },
                    axis: {
                        x: {
                            type: 'category'
                        }
                    },
                    grid: {
                        x: {
                            lines: [
                                {value: 3, text: 'Label 3'},
                                {value: 'a', text: 'Label a'}
                            ]
                        }
                    }
                };
                expect(true).toBeTruthy();
            });

            it('should show x grid lines', function () {
                var lines = chart.internal.main.selectAll('.c3-xgrid-lines .c3-xgrid-line'),
                    expectedX1 = [515, 74],
                    expectedText = ['Label 3', 'Label a'];
                lines.each(function (id, i) {
                    var line = d3.select(this),
                        l = line.select('line'),
                        t = line.select('text');
                    expect(+l.attr('x1')).toBeCloseTo(expectedX1[i], -2);
                    expect(t.text()).toBe(expectedText[i]);
                });
            });

        });

    });

});
