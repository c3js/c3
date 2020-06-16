import { d3, setMouseEvent, initChart } from './c3-helper'

describe('c3 chart tooltip', function() {
  'use strict'

  var chart
  var tooltipConfiguration = {}
  var dataOrder: any = 'desc'
  var dataGroups

  var args = function() {
    return {
      data: {
        columns: [
          ['data1', 30, 200, 100, 400, 150, 250], // 1130
          ['data2', 50, 20, 10, 40, 15, 25], // 160
          ['data3', 150, 120, 110, 140, 115, 125] // 760
        ],
        order: dataOrder,
        groups: dataGroups
      },
      tooltip: tooltipConfiguration
    }
  }

  beforeEach(function(done) {
    chart = initChart(chart, args(), done)
    dataOrder = 'desc'
    dataGroups = undefined
  })

  describe('tooltip position', function() {
    beforeAll(function() {
      tooltipConfiguration = {}
    })

    describe('without left margin', function() {
      it('should show tooltip on proper position', function() {
        var eventRect = d3.select('.c3-event-rect').node(),
          x = chart.internal.x(1),
          y = chart.internal.y(200)
        setMouseEvent(chart, 'mousemove', x, y, eventRect)

        var tooltipContainer = d3.select('.c3-tooltip-container'),
          top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
          left = Math.floor(+tooltipContainer.style('left').replace(/px/, ''))
        expect(top).toBeGreaterThan(0)
        expect(left).toBeGreaterThan(0)
      })
    })

    describe('with left margin', function() {
      beforeAll(function() {
        d3.select('#chart').style('margin-left', '300px')
      })

      it('should show tooltip on proper position', function() {
        var eventRect = d3.select('.c3-event-rect').node(),
          x = chart.internal.x(1) + 300, // add margin-left
          y = chart.internal.y(200)
        setMouseEvent(chart, 'mousemove', x, y, eventRect)

        var tooltipContainer = d3.select('.c3-tooltip-container'),
          top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
          left = Math.floor(+tooltipContainer.style('left').replace(/px/, ''))
        expect(top).toBeGreaterThan(0)
        expect(left).toBeGreaterThan(0)
      })

      afterAll(function() {
        d3.select('#chart').style('margin-left', null)
      })
    })
  })

  describe('tooltip positionFunction', function() {
    var topExpected = 37,
      leftExpected = 79

    beforeAll(function() {
      tooltipConfiguration = {
        position: function(data, width, height, element) {
          expect(data.length).toBe(args().data.columns.length)
          expect(data[0]).toEqual(
            jasmine.objectContaining({
              index: 2,
              value: 100,
              id: 'data1'
            })
          )
          expect(width).toBeGreaterThan(0)
          expect(height).toBeGreaterThan(0)
          expect(element).toBe(d3.select('.c3-event-rect').node())
          return { top: topExpected, left: leftExpected }
        }
      }
    })

    it('should be set to the coordinate where the function returned', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var tooltipContainer = d3.select('.c3-tooltip-container'),
        top = Math.floor(+tooltipContainer.style('top').replace(/px/, '')),
        left = Math.floor(+tooltipContainer.style('left').replace(/px/, ''))
      expect(top).toBeGreaterThan(0)
      expect(left).toBeGreaterThan(0)
    })
  })

  describe('tooltip getTooltipContent', function() {
    beforeAll(function() {
      tooltipConfiguration = {
        data_order: 'desc'
      }
    })

    it('should sort values desc', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data3')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data2')
    })
  })

  describe('tooltip with data_order as desc with grouped data', function() {
    beforeAll(function() {
      dataOrder = 'desc'
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each data in descending order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(220)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data1') // 1130
      expect(classes[2]).toBe('c3-tooltip-name--data3') // 760
      expect(classes[3]).toBe('c3-tooltip-name--data2') // 160
    })
  })

  describe('tooltip with data_order as asc with grouped data', function() {
    beforeAll(function() {
      dataOrder = 'asc'
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each data in ascending order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(220)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2') // 160
      expect(classes[2]).toBe('c3-tooltip-name--data3') // 760
      expect(classes[3]).toBe('c3-tooltip-name--data1') // 1130
    })
  })

  describe('tooltip with data_order as NULL with grouped data', function() {
    beforeAll(function() {
      dataOrder = null
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each data in given order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(220)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data1')
      expect(classes[2]).toBe('c3-tooltip-name--data2')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with data_order as Function with grouped data', function() {
    beforeAll(function() {
      var order = ['data2', 'data1', 'data3']
      dataOrder = function(data1, data2) {
        return order.indexOf(data1.id) - order.indexOf(data2.id)
      }
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each data in order given by function', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(220)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with data_order as Array with grouped data', function() {
    beforeAll(function() {
      dataOrder = ['data2', 'data1', 'data3']
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each data in order given by array', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(220)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with data_order as desc with un-grouped data', function() {
    beforeAll(function() {
      dataOrder = 'desc'
    })

    it('should display each tooltip value descending order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data3') // 110
      expect(classes[2]).toBe('c3-tooltip-name--data1') // 100
      expect(classes[3]).toBe('c3-tooltip-name--data2') // 10
    })
  })

  describe('tooltip with data_order as asc with un-grouped data', function() {
    beforeAll(function() {
      dataOrder = 'asc'
    })

    it('should display each tooltip value in ascending order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2') // 10
      expect(classes[2]).toBe('c3-tooltip-name--data1') // 100
      expect(classes[3]).toBe('c3-tooltip-name--data3') // 110
    })
  })

  describe('tooltip with data_order as NULL with un-grouped data', function() {
    beforeAll(function() {
      dataOrder = null
    })

    it('should display each tooltip value in given data order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data1')
      expect(classes[2]).toBe('c3-tooltip-name--data2')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with data_order as Function with un-grouped data', function() {
    beforeAll(function() {
      var order = ['data2', 'data1', 'data3']
      dataOrder = function(data1, data2) {
        return order.indexOf(data1.id) - order.indexOf(data2.id)
      }
    })

    it('should display each tooltip value in data order given by function', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with data_order as Array with un-grouped data', function() {
    beforeAll(function() {
      dataOrder = ['data2', 'data1', 'data3']
    })

    it('should display each tooltip value in data order given by array', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with tooltip_order as desc', function() {
    beforeAll(function() {
      tooltipConfiguration = {
        order: 'desc'
      }

      // this should be ignored
      dataOrder = 'asc'
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each tooltip value descending order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data3') // 110
      expect(classes[2]).toBe('c3-tooltip-name--data1') // 100
      expect(classes[3]).toBe('c3-tooltip-name--data2') // 10
    })
  })

  describe('tooltip with tooltip_order as asc', function() {
    beforeAll(function() {
      tooltipConfiguration = {
        order: 'asc'
      }

      // this should be ignored
      dataOrder = 'desc'
      dataGroups = [['data1', 'data2', 'data3']]
    })

    it('should display each tooltip value in ascending order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(220)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2') // 10
      expect(classes[2]).toBe('c3-tooltip-name--data1') // 100
      expect(classes[3]).toBe('c3-tooltip-name--data3') // 110
    })
  })

  describe('tooltip with tooltip_order as NULL', function() {
    beforeAll(function() {
      tooltipConfiguration = {
        order: null
      }
    })

    it('should display each tooltip value in given order', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data1')
      expect(classes[2]).toBe('c3-tooltip-name--data2')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with tooltip_order as Function', function() {
    beforeAll(function() {
      var order = ['data2', 'data1', 'data3']
      tooltipConfiguration = {
        order: function(data1, data2) {
          return order.indexOf(data1.id) - order.indexOf(data2.id)
        }
      }
    })

    it('should display each tooltip value in data order given by function', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })

  describe('tooltip with tooltip_order as Array', function() {
    beforeAll(function() {
      tooltipConfiguration = {
        order: ['data2', 'data1', 'data3']
      }
    })

    it('should display each tooltip value in data order given by array', function() {
      var eventRect = d3.select('.c3-event-rect').node(),
        x = chart.internal.x(2),
        y = chart.internal.y(100)
      setMouseEvent(chart, 'mousemove', x, y, eventRect)

      var classes = d3
        .selectAll('.c3-tooltip tr')
        .nodes()
        .map(function(node) {
          return (node as any).className
        })

      expect(classes[0]).toBe('') // header
      expect(classes[1]).toBe('c3-tooltip-name--data2')
      expect(classes[2]).toBe('c3-tooltip-name--data1')
      expect(classes[3]).toBe('c3-tooltip-name--data3')
    })
  })
})
