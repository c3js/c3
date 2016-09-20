var expect = require('chai').expect;

describe('c3 chart types', function () {


    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('internal.hasArcType', function () {

        describe('with data', function () {

            it('should update args', function () {
                args = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25],
                            ['data3', 150, 120, 110, 140, 115, 125]
                        ],
                        type: 'pie'
                    }
                };
                
            });

            it('should return true', function () {
                expect(chart.internal.hasArcType()).to.be.ok;
            });

            it('should change chart type to "bar"', function () {
                args.data.type = 'bar';
                
            });

            it('should return false', function () {
                expect(chart.internal.hasArcType()).to.not.be.ok;
            });

        });

        describe('with empty data', function () {

            it('should update args to have empty data', function () {
                args = {
                    data: {
                        columns: [],
                        type: 'pie'
                    }
                };
                
            });

            it('should return true', function () {
                expect(chart.internal.hasArcType()).to.be.ok;
            });

            it('should change chart type to "bar"', function () {
                args.data.type = 'bar';
                
            });

            it('should return false', function () {
                expect(chart.internal.hasArcType()).to.not.be.ok;
            });

        });

    });

    describe('internal.hasType', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', 150, 120, 110, 140, 115, 125]
                    ],
                    type: 'pie'
                }
            };
            
        });

        it('should return true for "pie" type', function () {
            expect(chart.internal.hasType('pie')).to.be.ok;
        });

        it('should return false for "line" type', function () {
            expect(chart.internal.hasType('line')).to.not.be.ok;
        });

        it('should return false for "bar" type', function () {
            expect(chart.internal.hasType('bar')).to.not.be.ok;
        });

        it('should unload successfully', function () {
            chart.unload([]);
            
        });

        it('should return true for "pie" type even if no data', function () {
            expect(chart.internal.hasType('pie')).to.be.ok;
        });

        it('should return false for "line" type even if no data', function () {
            expect(chart.internal.hasType('line')).to.not.be.ok;
        });

        it('should return false for "bar" type even if no data', function () {
            expect(chart.internal.hasType('bar')).to.not.be.ok;
        });

        it('should change chart type to "bar" successfully', function () {
            args.data.type = 'bar';
            
        });

        it('should return false for "pie" type even if no data', function () {
            expect(chart.internal.hasType('pie')).to.not.be.ok;
        });

        it('should return false for "line" type even if no data', function () {
            expect(chart.internal.hasType('line')).to.not.be.ok;
        });

        it('should return true for "bar" type even if no data', function () {
            expect(chart.internal.hasType('bar')).to.be.ok;
        });


    });

});
