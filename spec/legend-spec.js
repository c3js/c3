var describe = window.describe,
    expect = window.expect,
    it = window.it,
    beforeEach = window.beforeEach;

describe('c3 chart legend', function () {
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

    describe('legend position', function () {

        it('should be located on the center of chart', function () {
            var box = chart.internal.legend.node().getBoundingClientRect();
            expect(box.left + box.right).toBe(640);
        });

    });

    describe('legend as inset', function () {

        it('should change the legend to "inset" successfully', function () {
            args.legend = {
                position: 'inset',
                inset: {
                    step: null
                }
            };
            expect(true).toBeTruthy();
        });

        it('should be positioned properly', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.top).toBe(5.5);
            expect(box.left).toBe(60.5);
        });

        it('should have automatically calculated height', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).toBe(48);
        });

        it('should change the legend step to 1 successfully', function () {
            args.legend.inset.step = 1;
            expect(true).toBeTruthy();
        });

        it('should have automatically calculated height', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).toBe(28);
        });

        it('should change the legend step to 2 successfully', function () {
            args.legend.inset.step = 2;
            expect(true).toBeTruthy();
        });

        it('should have automatically calculated height', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).toBe(48);
        });

        it('should update args to have only one series', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                    ]
                },
                legend: {
                    position: 'inset'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should locate legend properly', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).toBe(28);
            expect(box.width).toBeGreaterThan(64);
        });

    });

    describe('legend.hide', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 130, 100, 200, 100, 250, 150]
                    ]
                },
                legend: {
                    hide: true
                }
            };
            expect(true).toBeTruthy();
        });

        it('should not show legends', function () {
            d3.selectAll('.c3-legend-item').each(function () {
                expect(d3.select(this).style('visibility')).toBe('hidden');
            });
        });

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 130, 100, 200, 100, 250, 150]
                    ]
                },
                legend: {
                    hide: 'data2'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should not show legends', function () {
            expect(d3.select('.c3-legend-item-data1').style('visibility')).toBe('visible');
            expect(d3.select('.c3-legend-item-data2').style('visibility')).toBe('hidden');
        });

    });

    describe('legend.show', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 130, 100, 200, 100, 250, 150]
                    ]
                },
                legend: {
                    show: false
                }
            };
            expect(true).toBeTruthy();
        });

        it('should not initially have rendered any legend items', function () {
            expect(d3.selectAll('.c3-legend-item').empty()).toBe(true);
        });

        it('allows us to show the legend on showLegend call', function () {
            chart.legend.show();
            d3.selectAll('.c3-legend-item').each(function () {
                expect(d3.select(this).style('visibility')).toBe('visible');
                // This selects all the children, but we expect it to be empty
                expect(d3.select(this).selectAll("*").length).not.toEqual(0);
            });
        });

    });

});
