var expect = require('chai').expect;

describe('c3 chart legend', function () {


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
            expect(true).to.be.ok;
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
            expect(true).to.be.ok;
        });

        it('should have properly computed legend width', function () {
            var expectedLeft = [148, 226, 384],
                expectedWidth = [118, 118, 108];
            d3.selectAll('.c3-legend-item').each(function (d, i) {
                var rect = d3.select(this).node().getBoundingClientRect();
                expect(rect.left).to.be.closeTo(expectedLeft[i], -2);
                expect(rect.width).to.be.closeTo(expectedWidth[i], -2);
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
            expect(true).to.be.ok;
        });

        it('should be located on the center of chart', function () {
            var box = chart.internal.legend.node().getBoundingClientRect();
            expect(box.left + box.right).to.equal(640);
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
            expect(true).to.be.ok;
        });

        it('should be positioned properly', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.top).to.equal(5.5);
            expect(box.left).to.be.above(30);
        });

        it('should have automatically calculated height', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).to.equal(48);
        });

        it('should change the legend step to 1 successfully', function () {
            args.legend.inset.step = 1;
            expect(true).to.be.ok;
        });

        it('should have automatically calculated height', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).to.equal(28);
        });

        it('should change the legend step to 2 successfully', function () {
            args.legend.inset.step = 2;
            expect(true).to.be.ok;
        });

        it('should have automatically calculated height', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).to.equal(48);
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
            expect(true).to.be.ok;
        });

        it('should locate legend properly', function () {
            var box = d3.select('.c3-legend-background').node().getBoundingClientRect();
            expect(box.height).to.equal(28);
            expect(box.width).to.be.above(64);
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
            expect(true).to.be.ok;
        });

        it('should not show legends', function () {
            d3.selectAll('.c3-legend-item').each(function () {
                expect(d3.select(this).style('visibility')).to.equal('hidden');
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
            expect(true).to.be.ok;
        });

        it('should not show legends', function () {
            expect(d3.select('.c3-legend-item-data1').style('visibility')).to.equal('visible');
            expect(d3.select('.c3-legend-item-data2').style('visibility')).to.equal('hidden');
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
            expect(true).to.be.ok;
        });

        it('should not initially have rendered any legend items', function () {
            expect(d3.selectAll('.c3-legend-item').empty()).to.equal(true);
        });

        it('allows us to show the legend on showLegend call', function () {
            chart.legend.show();
            d3.selectAll('.c3-legend-item').each(function () {
                expect(d3.select(this).style('visibility')).to.equal('visible');
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
            expect(true).to.be.ok;
        });

        it('renders the legend item with the correct width and height', function () {
            d3.selectAll('.c3-legend-item-tile').each(function () {
                expect(d3.select(this).style('stroke-width')).to.equal(args.legend.item.tile.height + 'px');
                var tileWidth = d3.select(this).attr('x2') - d3.select(this).attr('x1');
                expect(tileWidth).to.equal(args.legend.item.tile.width);
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
            expect(true).to.be.ok;
        });

        it('renders the correct amount of padding on the legend element', function () {
            d3.selectAll('.c3-legend-item-padded1 .c3-legend-item-tile, .c3-legend-item-padded2 .c3-legend-item-tile').each(function (el, index) {
                var itemWidth = d3.select(this).node().parentNode.getBBox().width,
                    textBoxWidth = d3.select(d3.select(this).node().parentNode).select('text').node().getBBox().width,
                    tileWidth = 15, // default value is 10, plus 5 more for padding
                    expectedWidth = textBoxWidth + tileWidth + (index ? 0 : 10) + args.legend.padding;

                expect(itemWidth).to.equal(expectedWidth);
            });
        });
    });

});
