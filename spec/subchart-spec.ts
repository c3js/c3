import { initChart } from './c3-helper'
describe('c3 subchart', function() {
  'use strict'

  let chart

  let args = {
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
    },
    subchart: {
      show: true
    }
  }

  beforeEach(done => {
    chart = initChart(chart, args, done)
  })

  const getChartHeight = () =>
    +chart.internal.svg.select('.c3-event-rect').attr('height') - 1

  describe('api', () => {
    it('can toggle subchart visibility', () => {
      const chartHeightWithSubchart = getChartHeight()

      expect(chart.subchart.isShown()).toBeTruthy()
      expect(chart.internal.svg.selectAll('.c3-axis-x').size()).toEqual(2)
      expect(chart.internal.svg.selectAll('.c3-brush').size()).toEqual(1)

      chart.subchart.hide()

      expect(chart.subchart.isShown()).toBeFalsy()
      expect(chart.internal.svg.selectAll('.c3-axis-x').size()).toEqual(1)
      expect(chart.internal.svg.selectAll('.c3-brush').size()).toEqual(0)
      expect(getChartHeight()).toBeGreaterThan(chartHeightWithSubchart)

      chart.subchart.show()

      expect(chart.subchart.isShown()).toBeTruthy()
      expect(chart.internal.svg.selectAll('.c3-axis-x').size()).toEqual(2)
      expect(chart.internal.svg.selectAll('.c3-brush').size()).toEqual(1)
      expect(getChartHeight()).toEqual(chartHeightWithSubchart)
    })
  })
})
