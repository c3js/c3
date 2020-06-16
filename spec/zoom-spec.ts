import { initChart } from './c3-helper'

describe('c3 chart zoom', function() {
  'use strict'

  var chart

  var args = {
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 3150, 250],
        ['data2', 50, 20, 10, 40, 15, 6025]
      ]
    },
    zoom: {
      enabled: true,
      initialRange: [1, 2]
    },
    subchart: {
      show: true
    }
  }

  beforeEach(function(done) {
    chart = initChart(chart, args, done)
  })

  describe('default extent', function() {
    describe('main chart domain', function() {
      it('should have original y domain', function() {
        var yDomain = chart.internal.y.domain(),
          expectedYDomain = [-591.5, 6626.5]
        expect(yDomain[0]).toBe(expectedYDomain[0])
        expect(yDomain[1]).toBe(expectedYDomain[1])
      })
    })

    describe('main chart domain', function() {
      it('should have original y domain in subchart', function() {
        var yDomain = chart.internal.y.domain(),
          subYDomain = chart.internal.subY.domain()
        expect(subYDomain[0]).toBe(yDomain[0])
        expect(subYDomain[1]).toBe(yDomain[1])
      })
    })

    describe('main chart domain', function() {
      it('should have specified brush extent', function() {
        var brushSelection = chart.internal.brush.selectionAsValue(),
          expectedBrushSelection = [1, 2]
        expect(brushSelection[0]).toBeCloseTo(expectedBrushSelection[0], 1)
        expect(brushSelection[1]).toBeCloseTo(expectedBrushSelection[1], 1)
      })
    })
  })
})
