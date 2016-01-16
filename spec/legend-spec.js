describe('c3 chart legend', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('legend when multiple charts rendered', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30],
                        ['data2', 50],
                        ['data3', 100]
                    ]
                }
            };
            expect(true).toBeTruthy();
        });

        it('should update args with long data names', function () {
            args = {
                data: {
                    columns: [
                        ['long data name 1', 30],
                        ['long data name 2', 50],
                        ['long data name 3', 50],
                    ]
                }
            };
            expect(true).toBeTruthy();
        });

        it('should have properly computed legend width', function () {
            var expectedLeft = [148, 226, 384],
                expectedWidth = [118, 118, 108];
            d3.selectAll('.c3-legend-item').each(function (d, i) {
                var rect = d3.select(this).node().getBoundingClientRect();
                expect(rect.left).toBeCloseTo(expectedLeft[i], -2);
                expect(rect.width).toBeCloseTo(expectedWidth[i], -2);
            });
        });
    });

    describe('legend position', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ]
                }
            };
            expect(true).toBeTruthy();
        });

        it('should be located on the center of chart', function () {
            var box = chart.internal.legend.node().getBoundingClientRect();
            expect(box.left + box.right).toBe(640);
        });

    });

    describe('legend as inset', function () {

        it('should change the legend to "inset" successfully', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25]
                    ]
                },
                legend: {
                    position: 'inset',
                    inset: {
                        step: null
                    }
                }
            };
            expect(true).toBeTruthy();
        });

        it('should be positioned properly', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.top).toBe(5.5);
            expect(box.left).toBeGreaterThan(30);
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

    describe('custom legend size', function() {
        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 130, 100, 200, 100, 250, 150]
                    ]
                },
                legend: {
                    item: {
                        tile: {
                            width: 15,
                            height: 2
                        }
                    }
                }
            };
            expect(true).toBeTruthy();
        });

        it('renders the legend item with the correct width and height', function () {
            d3.selectAll('.c3-legend-item-tile').each(function () {
                expect(d3.select(this).style('stroke-width')).toBe(args.legend.item.tile.height + 'px');
                var tileWidth = d3.select(this).attr('x2') - d3.select(this).attr('x1'); 
                expect(tileWidth).toBe(args.legend.item.tile.width);
            });
        });
    });

    describe('custom legend padding', function() {
        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['padded1', 30, 200, 100, 400, 150, 250],
                        ['padded2', 130, 100, 200, 100, 250, 150]
                    ]
                },
                legend: {
                    padding: 10
                }
            };
            expect(true).toBeTruthy();
        });

        it('renders the correct amount of padding on the legend element', function () {
            d3.selectAll('.c3-legend-item-padded1 .c3-legend-item-tile, .c3-legend-item-padded2 .c3-legend-item-tile').each(function (el, index) {
                var itemWidth = d3.select(this).node().parentNode.getBBox().width,
                    textBoxWidth = d3.select(d3.select(this).node().parentNode).select('text').node().getBBox().width,
                    tileWidth = 15, // default value is 10, plus 5 more for padding 
                    expectedWidth = textBoxWidth + tileWidth + (index ? 0 : 10) + args.legend.padding;

                expect(itemWidth).toBe(expectedWidth);
            });
        });
    });

});
