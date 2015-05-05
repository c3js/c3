describe('c3 chart title', function () {
    'use strict';
    var chart, config;
    describe('when given a title config option', function () {
        describe('with no x or y value', function () {           
            beforeEach(function(done) {
                config = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250]
                        ]
                    },
                    title: {
                        text: 'new title'
                    }
                };
                chart = window.initChart(chart, config, done);
            });

            it('renders the title at the default config position', function () {
                var titleEl = d3.select(".c3-chart-title");
                expect(titleEl.attr("x")).toEqual('0');
                expect(titleEl.attr("y")).toEqual(titleEl.node().getBBox().height.toString());
            });

            it('renders the title text', function () {
                var titleEl = d3.select(".c3-chart-title");
                expect(titleEl.node().textContent).toEqual('new title');
            });
        });

        describe('with x and y values', function () {           
            beforeEach(function(done) {
                config = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250]
                        ]
                    },
                    title: {
                        text: 'positioned title',
                        x: 50,
                        y: 10
                    }
                };
                chart = window.initChart(chart, config, done);
            });

            it('renders the title at the default config position', function () {
                var titleEl = d3.select(".c3-chart-title");
                expect(titleEl.attr("x")).toEqual('50');
                expect(titleEl.attr("y")).toEqual('10');
            });

            it('renders the title text', function () {
                var titleEl = d3.select(".c3-chart-title");
                expect(titleEl.node().textContent).toEqual('positioned title');
            });

            it('adds the correct amount of padding to fit the title', function() {
                expect(chart.internal.getCurrentPaddingTop()).toEqual(
                    config.title.y + d3.select('.c3-chart-title').node().getBBox().height
                );
            });
        });
    });
});