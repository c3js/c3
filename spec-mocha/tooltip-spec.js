var expect = require('chai').expect;

describe('c3 chart tooltip', function () {


    var chart;
    var tooltipConfiguration;

    var args = function () {
        return {
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25],
                    ['data3', 150, 120, 110, 140, 115, 125]
                ],
            },
            tooltip: tooltipConfiguration
        };
    };

    beforeEach(function (done) {
        chart = window.initChart(chart, args(), done);
    });

    describe('tooltip position', function () {
        beforeAll(function () {
            tooltipConfiguration = {};
        });

        describe('without left margin', function () {

            it('should show tooltip on proper position', function () {
                var eventRect = d3.select('.c3-event-rect-2').node();
                window.setMouseEvent(chart, 'mousemove', 100, 100, eventRect);

                var tooltipContainer = d3.select('.c3-tooltip-container'),
                    top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
                    left = Math.floor(+tooltipContainer.style('left').replace(/px/, '')),
                    topExpected = 115,
                    leftExpected = 280;
                expect(top).to.equal(topExpected);
                expect(left).to.be.above(leftExpected);
            });

        });

        describe('with left margin', function () {

            it('should set left margin', function () {
                d3.select('#chart').style('margin-left', '300px');
                expect(true).to.be.ok;
            });

            it('should show tooltip on proper position', function () {
                var eventRect = d3.select('.c3-event-rect-2').node();
                window.setMouseEvent(chart, 'mousemove', 100, 100, eventRect);

                var tooltipContainer = d3.select('.c3-tooltip-container'),
                    top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
                    left = Math.floor(+tooltipContainer.style('left').replace(/px/, '')),
                    topExpected = 115,
                    leftExpected = 280;
                expect(top).to.equal(topExpected);
                expect(left).to.be.above(leftExpected);
            });

        });

    });

    describe('tooltip positionFunction', function () {
        var topExpected = 37, leftExpected = 79;

        beforeAll(function () {
            tooltipConfiguration = {
                position: function (data, width, height, element) {
                    expect(data.length).to.equal(args().data.columns.length);
                    expect(data[0]).toEqual(jasmine.objectContaining({
                        index: 2,
                        value: 100,
                        id: 'data1'
                    }));
                    expect(width).to.be.above(0);
                    expect(height).to.be.above(0);
                    expect(element).to.equal(d3.select('.c3-event-rect-2').node());
                    return {top: topExpected, left: leftExpected};
                }
            };
        });

        it('should be set to the coordinate where the function returned', function () {
            var eventRect = d3.select('.c3-event-rect-2').node();
            window.setMouseEvent(chart, 'mousemove', 100, 100, eventRect);

            var tooltipContainer = d3.select('.c3-tooltip-container'),
                top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
                left = Math.floor(+tooltipContainer.style('left').replace(/px/, ''));
            expect(top).to.equal(topExpected);
            expect(left).to.equal(leftExpected);
        });
    });

    describe('tooltip getTooltipContent', function () {
    beforeAll(function () {
            tooltipConfiguration = {
        data_order: 'desc'
        };
        });

    it('should sort values desc', function () {
      var eventRect = d3.select('.c3-event-rect-2').node();
      window.setMouseEvent(chart, 'mousemove', 100, 100, eventRect);

      var tooltipTable = d3.select('.c3-tooltip')[0];
      var expected = ["", "c3-tooltip-name--data3",
                        "c3-tooltip-name--data1", "c3-tooltip-name--data2"];
      var i;
      for (i = 0; i < tooltipTable[0].rows.length; i++) {
       expect(tooltipTable[0].rows[i].className).to.equal(expected[i]);
      }
    });
  });
});
