import { d3, initChart } from './c3-helper'

describe('c3 chart shape bar', function() {
  'use strict'

  var chart, args

  beforeEach(function(done) {
    chart = initChart(chart, args, done)
  })

  describe('Path boxes', function() {
    beforeAll(function() {
      args = {
        data: {
          columns: [['data1', 30]],
          type: 'bar'
        },
        bar: {
          width: {
            max: 40
          }
        }
      }
    })

    it('bars should have expected Path Box', function() {
      var expected = {
        x: 279,
        y: 40,
        width: 40,
        height: 387
      }

      var shapes = chart.internal.main
        .selectAll('.' + chart.internal.CLASS.shapes)
        .selectAll('.' + chart.internal.CLASS.shape)
      shapes.each(function() {
        var pathBox = chart.internal.getPathBox(this)
        expect(pathBox.x).toBeCloseTo(expected.x, -1)
        expect(pathBox.y).toBeCloseTo(expected.y, -1)
        expect(pathBox.width).toBeCloseTo(expected.width, -1)
        expect(pathBox.height).toBeCloseTo(expected.height, -1)
      })
    })
  })

  describe('with groups', function() {
    describe('with indexed data', function() {
      beforeAll(function() {
        args = {
          data: {
            columns: [
              ['data1', 30, 200, -100, 400, -150, 250],
              ['data2', 50, 20, 10, 40, 15, 25]
            ],
            groups: [['data1', 'data2']],
            type: 'bar'
          }
        }
      })
      it('should be stacked', function() {
        var expectedBottom = [275, 293, 365, 281, 395, 290]
        chart.internal.main
          .selectAll('.c3-bars-data1 .c3-bar')
          .each(function(d, i) {
            var rect = d3
              .select(this)
              .node()
              .getBoundingClientRect()
            expect(rect.bottom).toBeCloseTo(expectedBottom[i], -1)
          })
      })
    })

    describe('with timeseries data', function() {
      beforeAll(function() {
        args = {
          data: {
            x: 'date',
            columns: [
              [
                'date',
                '2012-12-24',
                '2012-12-25',
                '2012-12-26',
                '2012-12-27',
                '2012-12-28',
                '2012-12-29'
              ],
              ['data1', 30, 200, -100, 400, -150, 250],
              ['data2', 50, 20, 10, 40, 15, 25]
            ],
            groups: [['data1', 'data2']],
            type: 'bar'
          },
          axis: {
            x: {
              type: 'timeseries'
            }
          }
        }
      })
      it('should be stacked', function() {
        var expectedBottom = [275, 293, 365, 281, 395, 290]
        chart.internal.main
          .selectAll('.c3-bars-data1 .c3-bar')
          .each(function(d, i) {
            var rect = d3
              .select(this)
              .node()
              .getBoundingClientRect()
            expect(rect.bottom).toBeCloseTo(expectedBottom[i], -1)
          })
      })
    })

    describe('with category data', function() {
      beforeAll(function() {
        args = {
          data: {
            x: 'date',
            columns: [
              [
                'date',
                '2012-12-24',
                '2012-12-25',
                '2012-12-26',
                '2012-12-27',
                '2012-12-28',
                '2012-12-29'
              ],
              ['data1', 30, 200, -100, 400, -150, 250],
              ['data2', 50, 20, 10, 40, 15, 25]
            ],
            groups: [['data1', 'data2']],
            type: 'bar'
          },
          axis: {
            x: {
              type: 'category'
            }
          }
        }
      })

      it('should be stacked', function() {
        var expectedBottom = [275, 293, 365, 281, 395, 290]
        chart.internal.main
          .selectAll('.c3-bars-data1 .c3-bar')
          .each(function(d, i) {
            var rect = d3
              .select(this)
              .node()
              .getBoundingClientRect()
            expect(rect.bottom).toBeCloseTo(expectedBottom[i], -1)
          })
      })
    })
  })

  describe('internal.isWithinBar', function() {
    describe('with normal axis', function() {
      beforeAll(function() {
        args = {
          data: {
            columns: [
              ['data1', 30, 200, 100, 400, -150, 250],
              ['data2', 50, 20, 10, 40, 15, 25],
              ['data3', -150, 120, 110, 140, 115, 125]
            ],
            type: 'bar'
          },
          axis: {
            rotated: false
          }
        }
      })

      it('should not be within bar', function() {
        var bar = d3.select('.c3-target-data1 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([0, 0], bar)).toBeFalsy()
      })

      it('should be within bar', function() {
        var bar = d3.select('.c3-target-data1 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([31, 280], bar)).toBeTruthy()
      })

      it('should not be within bar of negative value', function() {
        var bar = d3.select('.c3-target-data3 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([68, 280], bar)).toBeFalsy()
      })

      it('should be within bar of negative value', function() {
        var bar = d3.select('.c3-target-data3 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([68, 350], bar)).toBeTruthy()
      })
    })

    describe('with rotated axis', function() {
      beforeAll(function() {
        args.axis.rotated = true
      })

      it('should not be within bar', function() {
        var bar = d3.select('.c3-target-data1 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([0, 0], bar)).toBeFalsy()
      })

      it('should be within bar', function() {
        var bar = d3.select('.c3-target-data1 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([190, 20], bar)).toBeTruthy()
      })

      it('should be within bar of negative value', function() {
        var bar = d3.select('.c3-target-data3 .c3-bar-0').node()
        expect(chart.internal.isWithinBar([68, 50], bar)).toBeTruthy()
      })
    })
  })

  describe('bar spacing', function() {
    var createArgs = function(spacing) {
      return {
        size: {
          width: 500
        },
        data: {
          columns: [
            ['data1', 30, 200, 100],
            ['data2', 50, 20, 10],
            ['data3', 150, 120, 110],
            ['data4', 12, 24, 20]
          ],
          type: 'bar',
          groups: [['data1', 'data4']]
        },
        bar: {
          space: spacing
        }
      }
    }

    var getBBox = function(selector) {
      return d3
        .select(selector)
        .node()
        .getBBox()
    }

    var getBarContainerWidth = function() {
      return parseInt(getBBox('.c3-chart-bars').width)
    }

    var getBarContainerOffset = function() {
      return parseInt(getBBox('.c3-chart-bars').x)
    }

    var getBarBBox = function(name, idx) {
      return getBBox('.c3-target-' + name + ' .c3-bar-' + (idx || 0))
    }

    var getBarWidth = function(name, idx) {
      return parseInt(getBarBBox(name, idx).width)
    }

    var getBarOffset = function(name1, name2, idx) {
      var bbox1 = getBarBBox(name1, idx)
      var bbox2 = getBarBBox(name2, idx)
      return Math.floor(bbox2.x - (bbox1.x + bbox1.width))
    }

    it('should set bar spacing to 0', function() {
      args = createArgs(0)
      expect(true).toBeTruthy()
    })

    it('should display the bars without any spacing', function() {
      // all bars should have the same width
      expect(getBarWidth('data1', 0)).toEqual(30)
      expect(getBarWidth('data2', 0)).toEqual(30)
      expect(getBarWidth('data3', 0)).toEqual(30)
      expect(getBarWidth('data1', 1)).toEqual(30)
      expect(getBarWidth('data2', 1)).toEqual(30)
      expect(getBarWidth('data3', 1)).toEqual(30)
      expect(getBarWidth('data1', 2)).toEqual(30)
      expect(getBarWidth('data2', 2)).toEqual(30)
      expect(getBarWidth('data3', 2)).toEqual(30)

      // all offsets should be the same
      expect(getBarOffset('data1', 'data2', 0)).toEqual(0)
      expect(getBarOffset('data2', 'data3', 0)).toEqual(0)
      expect(getBarOffset('data1', 'data2', 1)).toEqual(0)
      expect(getBarOffset('data2', 'data3', 1)).toEqual(0)
      expect(getBarOffset('data1', 'data2', 2)).toEqual(0)
      expect(getBarOffset('data2', 'data3', 2)).toEqual(0)

      // default width/offset of the container for this chart
      expect(getBarContainerWidth()).toEqual(396)
      expect(getBarContainerOffset()).toEqual(31)
    })

    it('should set bar spacing to 0.25', function() {
      args = createArgs(0.25)
      expect(true).toBeTruthy()
    })

    it('should display the bars with a spacing ratio of 0.25', function() {
      // with bar_space of 0.25, the space between bars is
      // expected to be 25% of the original bar's width
      // which is ~7

      // expect all bars to be the same width
      expect(getBarWidth('data1', 0)).toEqual(22)
      expect(getBarWidth('data2', 0)).toEqual(22)
      expect(getBarWidth('data3', 0)).toEqual(22)
      expect(getBarWidth('data1', 1)).toEqual(22)
      expect(getBarWidth('data2', 1)).toEqual(22)
      expect(getBarWidth('data3', 1)).toEqual(22)
      expect(getBarWidth('data1', 2)).toEqual(22)
      expect(getBarWidth('data2', 2)).toEqual(22)
      expect(getBarWidth('data3', 2)).toEqual(22)

      // all offsets should be the same
      expect(getBarOffset('data1', 'data2', 0)).toEqual(7)
      expect(getBarOffset('data2', 'data3', 0)).toEqual(7)
      expect(getBarOffset('data1', 'data2', 1)).toEqual(7)
      expect(getBarOffset('data2', 'data3', 1)).toEqual(7)
      expect(getBarOffset('data1', 'data2', 2)).toEqual(7)
      expect(getBarOffset('data2', 'data3', 2)).toEqual(7)

      // expect the container to shrink a little because of
      // the offsets from the first/last chart
      // we add/subtract 1 because of approximation due to rounded values
      expect(getBarContainerWidth()).toEqual(396 - 7 - 1)
      expect(getBarContainerOffset()).toEqual(31 + (Math.floor(7 / 2) + 1))
    })

    it('should set bar spacing to 0.5', function() {
      args = createArgs(0.5)
      expect(true).toBeTruthy()
    })

    it('should display the bars with a spacing ratio of 0.5', function() {
      // with bar_space of 0.5, the space between bars is
      // expected to be 50% of the original bar's width
      // which is ~15

      // expect all bars to be the same width
      expect(getBarWidth('data1', 0)).toEqual(15)
      expect(getBarWidth('data2', 0)).toEqual(15)
      expect(getBarWidth('data3', 0)).toEqual(15)
      expect(getBarWidth('data1', 1)).toEqual(15)
      expect(getBarWidth('data2', 1)).toEqual(15)
      expect(getBarWidth('data3', 1)).toEqual(15)
      expect(getBarWidth('data1', 2)).toEqual(15)
      expect(getBarWidth('data2', 2)).toEqual(15)
      expect(getBarWidth('data3', 2)).toEqual(15)

      // all offsets should be the same
      expect(getBarOffset('data1', 'data2', 0)).toEqual(15)
      expect(getBarOffset('data2', 'data3', 0)).toEqual(15)
      expect(getBarOffset('data1', 'data2', 1)).toEqual(15)
      expect(getBarOffset('data2', 'data3', 1)).toEqual(15)
      expect(getBarOffset('data1', 'data2', 2)).toEqual(15)
      expect(getBarOffset('data2', 'data3', 2)).toEqual(15)

      // expect the container to shrink a little because of
      // the offsets from the first/last chart
      expect(getBarContainerWidth()).toEqual(396 - 15)
      expect(getBarContainerOffset()).toEqual(31 + Math.floor(15 / 2))
    })
  })
})
