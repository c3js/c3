import { d3, initChart } from './c3-helper'

describe('c3 chart title', function() {
  'use strict'

  var chart, config

  describe('when given a title too long', function() {
    beforeEach(function(done) {
      config = {
        data: {
          columns: [['data1', 30, 200, 100, 400, 150, 250]]
        },
        title: {
          text: 'this is a very long title'.repeat(10),
          position: 'top-center'
        }
      }

      chart = initChart(chart, config, done)
    })

    it('should not use negative x offset', function() {
      const titleEl = d3.select('.c3-title')
      expect(+titleEl.attr('x')).toBe(0)
    })
  })

  describe('when given a title config option', function() {
    describe('with no padding and no position', function() {
      beforeEach(function(done) {
        config = {
          data: {
            columns: [['data1', 30, 200, 100, 400, 150, 250]]
          },
          title: {
            text: 'new title'
          }
        }
        chart = initChart(chart, config, done)
      })

      it('renders the title at the default config position', function() {
        var titleEl = d3.select('.c3-title')
        expect(+titleEl.attr('x')).toBeCloseTo(294, -2)
        expect(+titleEl.attr('y')).toEqual(
          (titleEl.node() as any).getBBox().height
        )
      })

      it('renders the title text', function() {
        var titleEl = d3.select('.c3-title')
        expect((titleEl.node() as any).textContent).toEqual('new title')
      })
    })

    describe('with padding', function() {
      var config,
        getConfig = function(titlePosition) {
          return {
            data: {
              columns: [['data1', 30, 200, 100, 400, 150, 250]]
            },
            title: {
              text: 'positioned title',
              padding: {
                top: 20,
                right: 30,
                bottom: 40,
                left: 50
              },
              position: titlePosition
            }
          }
        }

      describe('and position center', function() {
        beforeEach(function(done) {
          config = getConfig('top-center')
          chart = initChart(chart, config, done)
        })
        it('renders the title at the default config position', function() {
          var titleEl = d3.select('.c3-title')
          expect(+titleEl.attr('x')).toBeCloseTo(275, -2)
          expect(+titleEl.attr('y')).toBeCloseTo(34, -1)
        })
        it('adds the correct amount of padding to fit the title', function() {
          expect(chart.internal.getCurrentPaddingTop()).toEqual(
            config.title.padding.top +
              (d3.select('.c3-title').node() as any).getBBox().height +
              config.title.padding.bottom
          )
        })
      })

      describe('and position left', function() {
        beforeEach(function(done) {
          config = getConfig('top-left')
          chart = initChart(chart, config, done)
        })
        it('renders the title at the default config position', function() {
          var titleEl = d3.select('.c3-title')
          expect(+titleEl.attr('x')).toBeCloseTo(50, -1)
          expect(+titleEl.attr('y')).toBeCloseTo(34, -1)
        })
      })

      describe('and position right', function() {
        beforeEach(function(done) {
          config = getConfig('top-right')
          chart = initChart(chart, config, done)
        })
        it('renders the title at the default config position', function() {
          var titleEl = d3.select('.c3-title')
          expect(+titleEl.attr('x')).toBeCloseTo(520, -2)
          expect(+titleEl.attr('y')).toBeCloseTo(34, -1)
        })
      })
    })
  })
})
