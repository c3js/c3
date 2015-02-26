describe('c3 chart header', function () {
    'use strict';
    var chart, config;

    describe('when given a header config with only show', function() {
        beforeEach(function(done) {
            config = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250]
                    ]
                },
                header: {
                    show: true
                }
            };
            chart = window.initChart(chart, config, done);
        });

        it('renders the header with default values', function () {
            var headerEl = d3.select(".c3-chart-header");
            expect(headerEl.attr("height")).toEqual('15');
            expect(headerEl.attr("style")).toEqual('fill: #FFF');
        });
    });

    describe('when given a border config with only show', function() {
        beforeEach(function(done) {
            config = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250]
                    ]
                },
                header: {
                    show: true,
                    border: {
                      show: true
                    }
                }
            };
            chart = window.initChart(chart, config, done);
        });

        it('renders the border with default values', function () {
            var borderEl = d3.select(".c3-chart-header-border");
            expect(borderEl.attr("style")).toEqual('stroke-width: 1; stroke: #000');
        });
    });

    describe('when given a header config option with options', function () {
        beforeEach(function(done) {
            config = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, 150, 250]
                    ]
                },
                header: {
                    show: true,
                    color: '#444',
                    height: 20,
                    border: {
                        show: true,
                        color: '#333',
                        width: 2
                    }
                }
            };
            chart = window.initChart(chart, config, done);
        });

        it('renders the header element with the correct color and height', function () {
            var headerEl = d3.select(".c3-chart-header");
            expect(headerEl.attr("style")).toEqual('fill: #444');
            expect(headerEl.attr("height")).toEqual('20');
        });

        it('renders the border element with the correct color', function () {
            var borderEl = d3.select(".c3-chart-header-border");
            expect(borderEl.attr("style")).toEqual('stroke-width: 2; stroke: #333');
        });
    });
});
