var expect = require('chai').expect;

describe('c3 api focus', function () {


    var chart;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400],
                ['data2', 1000, 800, 500, 2000],
                ['data3', 5000, 2000, 1000, 4000]
            ]
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('focus', function () {

        it('should focus all targets', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                var targets = main.select('.c3-chart-line.c3-target'),
                    legendItems = legend.select('.c3-legend-item');
                targets.each(function () {
                    var line = d3.select(this);
                    expect(line.classed('c3-focused')).to.be.ok;
                });
                legendItems.each(function () {
                    var item = d3.select(this);
                    expect(item.classed('c3-legend-item-focused')).to.be.ok;
                });
                done();
            }, 1000);
        });

        it('should focus one target', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus('data2');
            setTimeout(function () {
                var targets = {
                    data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                    data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                    data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                },
                legendItems = {
                    data1: legend.select('.c3-legend-item-data1'),
                    data2: legend.select('.c3-legend-item-data2'),
                    data3: legend.select('.c3-legend-item-data3')
                };
                expect(targets.data1.classed('c3-focused')).to.not.be.ok;
                expect(targets.data2.classed('c3-focused')).to.be.ok;
                expect(targets.data3.classed('c3-focused')).to.not.be.ok;
                expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(legendItems.data2.classed('c3-legend-item-focused')).to.be.ok;
                expect(legendItems.data3.classed('c3-legend-item-focused')).to.not.be.ok;
                done();
            }, 1000);
        });

        it('should focus multiple targets', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus(['data1', 'data2']);
            setTimeout(function () {
                var targets = {
                    data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                    data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                    data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                },
                legendItems = {
                    data1: legend.select('.c3-legend-item-data1'),
                    data2: legend.select('.c3-legend-item-data2'),
                    data3: legend.select('.c3-legend-item-data3')
                };
                expect(targets.data1.classed('c3-focused')).to.be.ok;
                expect(targets.data2.classed('c3-focused')).to.be.ok;
                expect(targets.data3.classed('c3-focused')).to.not.be.ok;
                expect(legendItems.data1.classed('c3-legend-item-focused')).to.be.ok;
                expect(legendItems.data2.classed('c3-legend-item-focused')).to.be.ok;
                expect(legendItems.data3.classed('c3-legend-item-focused')).to.not.be.ok;
                done();
            }, 1000);
        });

    });

    describe('defocus', function () {

        it('should defocus all targets', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus();
            setTimeout(function () {
                var targets = main.select('.c3-chart-line.c3-target'),
                    legendItems = legend.select('.c3-legend-item');
                targets.each(function () {
                    var line = d3.select(this);
                    expect(line.classed('c3-focused')).to.not.be.ok;
                    expect(line.classed('c3-defocused')).to.be.ok;
                });
                legendItems.each(function () {
                    var item = d3.select(this);
                    expect(item.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(+item.style('opacity')).to.be.closeTo(0.3);
                });
                done();
            }, 1000);
        });

        it('should defocus one target', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus('data2');
            setTimeout(function () {
                var targets = {
                    data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                    data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                    data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                },
                legendItems = {
                    data1: legend.select('.c3-legend-item-data1'),
                    data2: legend.select('.c3-legend-item-data2'),
                    data3: legend.select('.c3-legend-item-data3')
                };
                expect(targets.data1.classed('c3-defocused')).to.not.be.ok;
                expect(targets.data2.classed('c3-defocused')).to.be.ok;
                expect(targets.data3.classed('c3-defocused')).to.not.be.ok;
                expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(legendItems.data3.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(+legendItems.data1.style('opacity')).to.be.closeTo(1);
                expect(+legendItems.data2.style('opacity')).to.be.closeTo(0.3);
                expect(+legendItems.data3.style('opacity')).to.be.closeTo(1);
                done();
            }, 1000);
        });

        it('should defocus multiple targets', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus(['data1', 'data2']);
            setTimeout(function () {
                var targets = {
                    data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                    data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                    data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                },
                legendItems = {
                    data1: legend.select('.c3-legend-item-data1'),
                    data2: legend.select('.c3-legend-item-data2'),
                    data3: legend.select('.c3-legend-item-data3')
                };
                expect(targets.data1.classed('c3-defocused')).to.be.ok;
                expect(targets.data2.classed('c3-defocused')).to.be.ok;
                expect(targets.data3.classed('c3-defocused')).to.not.be.ok;
                expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(legendItems.data3.classed('c3-legend-item-focused')).to.not.be.ok;
                expect(+legendItems.data1.style('opacity')).to.be.closeTo(0.3);
                expect(+legendItems.data2.style('opacity')).to.be.closeTo(0.3);
                expect(+legendItems.data3.style('opacity')).to.be.closeTo(1);
                done();
            }, 1000);
        });

        it('should defocus multiple targets after focused', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                chart.defocus(['data1', 'data2']);
                setTimeout(function () {
                    var targets = {
                        data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                        data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                        data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                    },
                    legendItems = {
                        data1: legend.select('.c3-legend-item-data1'),
                        data2: legend.select('.c3-legend-item-data2'),
                        data3: legend.select('.c3-legend-item-data3')
                    };
                    expect(targets.data1.classed('c3-defocused')).to.be.ok;
                    expect(targets.data2.classed('c3-defocused')).to.be.ok;
                    expect(targets.data3.classed('c3-defocused')).to.not.be.ok;
                    expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data3.classed('c3-legend-item-focused')).to.be.ok;
                    expect(+legendItems.data1.style('opacity')).to.be.closeTo(0.3);
                    expect(+legendItems.data2.style('opacity')).to.be.closeTo(0.3);
                    expect(+legendItems.data3.style('opacity')).to.be.closeTo(1);
                    done();
                }, 1000);
            }, 1000);
        });

    });

    describe('revert', function () {

        it('should revert all targets after focus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                chart.revert();
                setTimeout(function () {
                    var targets = main.select('.c3-chart-line.c3-target'),
                        legendItems = legend.select('.c3-legend-item');
                    targets.each(function () {
                        var line = d3.select(this);
                        expect(line.classed('c3-focused')).to.not.be.ok;
                    });
                    legendItems.each(function () {
                        var item = d3.select(this);
                        expect(item.classed('c3-legend-item-focused')).to.not.be.ok;
                        expect(+item.style('opacity')).to.be.closeTo(1);
                    });
                    done();
                }, 1000);
            }, 1000);
        });

        it('should revert all targets after defocus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus();
            setTimeout(function () {
                chart.revert();
                setTimeout(function () {
                    var targets = main.select('.c3-chart-line.c3-target'),
                        legendItems = legend.select('.c3-legend-item');
                    targets.each(function () {
                        var line = d3.select(this);
                        expect(line.classed('c3-defocused')).to.not.be.ok;
                    });
                    legendItems.each(function () {
                        var item = d3.select(this);
                        expect(item.classed('c3-legend-item-focused')).to.not.be.ok;
                        expect(+item.style('opacity')).to.be.closeTo(1);
                    });
                    done();
                }, 1000);
            }, 1000);
        });

        it('should revert one target after focus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                chart.revert('data2');
                setTimeout(function () {
                    var targets = {
                        data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                        data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                        data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                    },
                    legendItems = {
                        data1: legend.select('.c3-legend-item-data1'),
                        data2: legend.select('.c3-legend-item-data2'),
                        data3: legend.select('.c3-legend-item-data3')
                    };
                    expect(targets.data1.classed('c3-focused')).to.be.ok;
                    expect(targets.data2.classed('c3-focused')).to.not.be.ok;
                    expect(targets.data3.classed('c3-focused')).to.be.ok;
                    expect(+legendItems.data1.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data2.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data3.style('opacity')).to.be.closeTo(1);
                    expect(legendItems.data1.classed('c3-legend-item-focused')).to.be.ok;
                    expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data3.classed('c3-legend-item-focused')).to.be.ok;
                    done();
                }, 1000);
            }, 1000);
        });

        it('should revert one target after defocus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus();
            setTimeout(function () {
                chart.revert('data2');
                setTimeout(function () {
                    var targets = {
                        data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                        data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                        data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                    },
                    legendItems = {
                        data1: legend.select('.c3-legend-item-data1'),
                        data2: legend.select('.c3-legend-item-data2'),
                        data3: legend.select('.c3-legend-item-data3')
                    };
                    expect(targets.data1.classed('c3-defocused')).to.be.ok;
                    expect(targets.data2.classed('c3-defocused')).to.not.be.ok;
                    expect(targets.data3.classed('c3-defocused')).to.be.ok;
                    expect(+legendItems.data1.style('opacity')).to.be.closeTo(0.3);
                    expect(+legendItems.data2.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data3.style('opacity')).to.be.closeTo(0.3);
                    expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data3.classed('c3-legend-item-focused')).to.not.be.ok;
                    done();
                }, 1000);
            }, 1000);
        });

        it('should focus multiple targets after focus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                chart.revert(['data1', 'data2']);
                setTimeout(function () {
                    var targets = {
                        data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                        data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                        data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                    },
                    legendItems = {
                        data1: legend.select('.c3-legend-item-data1'),
                        data2: legend.select('.c3-legend-item-data2'),
                        data3: legend.select('.c3-legend-item-data3')
                    };
                    expect(targets.data1.classed('c3-focused')).to.not.be.ok;
                    expect(targets.data2.classed('c3-focused')).to.not.be.ok;
                    expect(targets.data3.classed('c3-focused')).to.be.ok;
                    expect(+legendItems.data1.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data2.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data3.style('opacity')).to.be.closeTo(1);
                    expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data3.classed('c3-legend-item-focused')).to.be.ok;
                    done();
                }, 1000);
            }, 1000);
        });

        it('should focus multiple targets after defocus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus();
            setTimeout(function () {
                chart.revert(['data1', 'data2']);
                setTimeout(function () {
                    var targets = {
                        data1: main.select('.c3-chart-line.c3-target.c3-target-data1'),
                        data2: main.select('.c3-chart-line.c3-target.c3-target-data2'),
                        data3: main.select('.c3-chart-line.c3-target.c3-target-data3')
                    },
                    legendItems = {
                        data1: legend.select('.c3-legend-item-data1'),
                        data2: legend.select('.c3-legend-item-data2'),
                        data3: legend.select('.c3-legend-item-data3')
                    };
                    expect(targets.data1.classed('c3-defocused')).to.not.be.ok;
                    expect(targets.data2.classed('c3-defocused')).to.not.be.ok;
                    expect(targets.data3.classed('c3-defocused')).to.be.ok;
                    expect(+legendItems.data1.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data2.style('opacity')).to.be.closeTo(1);
                    expect(+legendItems.data3.style('opacity')).to.be.closeTo(0.3);
                    expect(legendItems.data1.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data2.classed('c3-legend-item-focused')).to.not.be.ok;
                    expect(legendItems.data3.classed('c3-legend-item-focused')).to.not.be.ok;
                    done();
                }, 1000);
            }, 1000);
        });

    });

    describe('when legend.show = false', function () {

        it('should update args to hide legend', function () {
            args.legend = {
                show: false
            };
            
        });

        it('should focus all targets without showing legend', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                var targets = main.select('.c3-chart-line.c3-target'),
                    legendItems = legend.select('.c3-legend-item');
                targets.each(function () {
                    var line = d3.select(this);
                    expect(line.classed('c3-focused')).to.be.ok;
                });
                expect(legendItems.size()).to.be.closeTo(0);
                done();
            }, 1000);
        });

        it('should defocus all targets without showing legend', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.defocus();
            setTimeout(function () {
                var targets = main.select('.c3-chart-line.c3-target'),
                    legendItems = legend.select('.c3-legend-item');
                targets.each(function () {
                    var line = d3.select(this);
                    expect(line.classed('c3-defocused')).to.be.ok;
                });
                expect(legendItems.size()).to.be.closeTo(0);
                done();
            }, 1000);
        });

        it('should revert all targets after focus', function (done) {
            var main = chart.internal.main,
                legend = chart.internal.legend;
            chart.focus();
            setTimeout(function () {
                chart.revert();
                setTimeout(function () {
                    var targets = main.select('.c3-chart-line.c3-target'),
                        legendItems = legend.select('.c3-legend-item');
                    targets.each(function () {
                        var line = d3.select(this);
                        expect(line.classed('c3-focused')).to.not.be.ok;
                    });
                    expect(legendItems.size()).to.be.closeTo(0);
                    done();
                }, 1000);
            }, 1000);
        });

    });

});
