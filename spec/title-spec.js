describe('c3 chart title', function () {
    'use strict';

    var chart, config;

    describe('when given a title config option', function () {
        describe('with no padding and no position', function () {
            beforeEach(function(done) {
                config = {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250]
                        ]
                    },
                    title: {
                        text: 'new title',
                        author: 'masayuki0812',
                        source: 'GitHub'
                    }
                };
                chart = window.initChart(chart, config, done);
            });

            it('renders the title at the default config position', function () {
                var titleEl = d3.select(".c3-title");
                expect(+titleEl.attr("x")).toBeCloseTo(221, -2);
                expect(+titleEl.attr("y")).toEqual(titleEl.node().getBBox().height);
            });

            it('renders the title text', function () {
                var titleTextEl = d3.select(".c3-title-text");
                expect(titleTextEl.node().textContent).toEqual('new title');
                
                var titleAuthorEl = d3.select(".c3-title-author");
                expect(titleAuthorEl.node().textContent).toEqual('masayuki0812');
                
                var titleSourceEl = d3.select(".c3-title-source");
                expect(titleSourceEl.node().textContent).toEqual('GitHub');
            });
        });

        describe('with padding', function () {
            var config, getConfig = function (titlePosition) {
                return {
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250]
                        ]
                    },
                    title: {
                        text: 'positioned title',
                        author: 'masayuki0812',
                        source: 'GitHub',
                        padding: {
                            top: 20,
                            right: 30,
                            bottom: 40,
                            left: 50
                        },
                        position: titlePosition
                    }
                };
            };

            describe('and position center', function () {
                beforeEach(function(done) {
                    config = getConfig('top-center');
                    chart = window.initChart(chart, config, done);
                });
                it('renders the title at the default config position', function () {
                    var titleEl = d3.select(".c3-title");
                    expect(+titleEl.attr("x")).toBeCloseTo(201.5, -2);
                    expect(+titleEl.attr("y")).toBeCloseTo(34, -1);
                });
                it('adds the correct amount of padding to fit the title', function() {
                    expect(chart.internal.getCurrentPaddingTop()).toEqual(
                        config.title.padding.top + d3.select('.c3-title').node().getBBox().height + config.title.padding.bottom
                    );
                });
            });

            describe('and position left', function () {
                beforeEach(function(done) {
                    config = getConfig('top-left');
                    chart = window.initChart(chart, config, done);
                });
                it('renders the title at the default config position', function () {
                    var titleEl = d3.select(".c3-title");
                    expect(+titleEl.attr("x")).toBeCloseTo(50, -1);
                    expect(+titleEl.attr("y")).toBeCloseTo(34, -1);
                });
            });

            describe('and position right', function () {
                beforeEach(function(done) {
                    config = getConfig('top-right');
                    chart = window.initChart(chart, config, done);
                });
                it('renders the title at the default config position', function () {
                    var titleEl = d3.select(".c3-title");
                    expect(+titleEl.attr("x")).toBeCloseTo(373, -2);
                    expect(+titleEl.attr("y")).toBeCloseTo(34, -1);
                });
            });

        });
    });
});
