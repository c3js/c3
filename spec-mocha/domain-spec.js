var expect = require('chai').expect;

describe('c3 chart domain', function () {


    var chart;

    var args = {
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25]
            ]
        },
        axis: {
            y: {},
            y2: {}
        }
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('axis.y.min', function () {

        it('should change axis.y.min to -100', function () {
            args.axis.y.min = -100;
            expect(true).to.be.ok;
        });

        it('should be set properly when smaller than max of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).to.equal(-150);
            expect(domain[1]).to.equal(450);
        });

        it('should change axis.y.min to 500', function () {
            args.axis.y.min = 500;
            expect(true).to.be.ok;
        });

        it('should be set properly when bigger than max of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).to.equal(499);
            expect(domain[1]).to.equal(511);
        });

        it('should change axis.y.min to undefined', function () {
            args.axis.y.min = undefined;
            expect(true).to.be.ok;
        });

    });

    describe('axis.y.max', function () {

        it('should change axis.y.max to 1000', function () {
            args.axis.y.max = 1000;
            expect(true).to.be.ok;
        });

        it('should be set properly when bigger than min of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).to.equal(-89);
            expect(domain[1]).to.equal(1099);
        });

        it('should change axis.y.max to 0', function () {
            args.axis.y.max = 0;
            expect(true).to.be.ok;
        });

        it('should be set properly when smaller than min of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).to.equal(-11);
            expect(domain[1]).to.equal(1);
        });

    });

    describe('axis.y.padding', function () {

        it('should change axis.y.max to 1000', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 10, 20, 10, 40, 15, 25],
                        ['data2', 50, 40, 30, 45, 25, 45]
                    ]
                },
                axis: {
                    y: {
                        padding: 200,
                    }
                }
            };
            expect(true).to.be.ok;
        });

        it('should be set properly when bigger than min of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).to.be.closeTo(-9, -1);
            expect(domain[1]).to.be.closeTo(69, -1);
        });

        it('should change axis.y.max to 1000 with top/bottom padding', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 10, 20, 10, 40, 15, 25],
                        ['data2', 50, 40, 30, 45, 25, 45]
                    ]
                },
                axis: {
                    y: {
                        padding: {
                            top: 200,
                            bottom: 200
                        }
                    }
                }
            };
            expect(true).to.be.ok;
        });

        it('should be set properly when bigger than min of data', function () {
            var domain = chart.internal.y.domain();
            expect(domain[0]).to.be.closeTo(-9, -1);
            expect(domain[1]).to.be.closeTo(69, -1);
        });

    });

});
