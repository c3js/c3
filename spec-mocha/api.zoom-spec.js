var expect = require('chai').expect;

describe('c3 api zoom', function () {
    

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    describe('zoom', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', 150, 120, 110, 140, 115, 125]
                    ]
                },
                zoom: {
                    enabled: true
                }
            };
            
        });

        it('should be zoomed properly', function () {
            var target = [3, 5], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(domain[0]).to.equal(target[0]);
            expect(domain[1]).to.equal(target[1]);
        });

        it('should be zoomed properly again', function () {
            var target = [1, 4], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(domain[0]).to.equal(target[0]);
            expect(domain[1]).to.equal(target[1]);
        });

        it('should load timeseries data', function () {
            args = {
                data: {
                    x: 'date',
                    columns: [
                        ['date', '2014-01-01', '2014-01-02', '2014-08-01', '2014-10-19'],
                        ['data1', 30, 200, 100, 400]
                    ]
                },
                axis: {
                    x: {
                        type: 'timeseries'
                    }
                },
                zoom: {
                    enabled: true
                }
            };
            
        });

        it('should be zoomed properly', function () {
            var target = [new Date(2014, 7, 1), new Date(2014, 8, 1)], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(+domain[0]).to.equal(+target[0]);
            expect(+domain[1]).to.equal(+target[1]);
        });

        it('should be zoomed properly', function () {
            var target = ['2014-08-01', '2014-09-01'], domain;
            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(+domain[0]).to.equal(+chart.internal.parseDate(target[0]));
            expect(+domain[1]).to.equal(+chart.internal.parseDate(target[1]));
        });

    });

    describe('unzoom', function () {

        it('should load indexed data', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250]
                    ]
                },
                zoom: {
                    enabled: true
                }
            };
            
        });

        it('should be unzoomed properly', function () {
            var target = [1, 4], orginal = chart.internal.x.domain(), domain;

            chart.zoom(target);
            domain = chart.internal.x.domain();
            expect(domain[0]).to.equal(target[0]);
            expect(domain[1]).to.equal(target[1]);

            chart.unzoom();
            domain = chart.internal.x.domain();
            expect(domain[0]).to.equal(orginal[0]);
            expect(domain[1]).to.equal(orginal[1]);
        });

    });

});
