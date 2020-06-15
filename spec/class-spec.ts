import { initChart } from './c3-helper'

describe('c3 chart class', function() {
  'use strict'

  var chart

  var args = {
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 150, 250],
        ['data2 prefix', 50, 20, 10, 40, 15, 25],
        ['data3 мужчины', 150, 120, 110, 140, 115, 125],
        ['my\u007fapp', 10, 20, 40, 20, 65, 55]
      ]
    }
  }

  beforeEach(function(done) {
    chart = initChart(chart, args, done)
  })

  describe('internal.generateTargetClass', function() {
    it('should not replace any characters', function() {
      var input = 'data1',
        expected = '-' + input,
        suffix = chart.internal.generateTargetClass(input)
      expect(suffix).toBe(expected)
    })

    it('should replace space to "-"', function() {
      var input = 'data1 suffix',
        expected = '-data1-suffix',
        suffix = chart.internal.generateTargetClass(input)
      expect(suffix).toBe(expected)
    })

    it('should replace space to "-" with multibyte characters', function() {
      var input = 'data1 suffix 日本語',
        expected = '-data1-suffix-日本語',
        suffix = chart.internal.generateTargetClass(input)
      expect(suffix).toBe(expected)
    })

    it('should not replace special characters', function() {
      var input = 'data1 !@#$%^&*()_=+,.<>"\':;[]/|?~`{}\\',
        expected = '-data1-!@#$%^&*()_=+,.<>"\':;[]/|?~`{}\\',
        suffix = chart.internal.generateTargetClass(input)
      expect(suffix).toBe(expected)
    })
  })

  describe('internal.getTargetSelectorSuffix', function() {
    it('should escape special characters', function() {
      var input = 'data1 !@#$%^&*()_=+,.<>"\':;[]/|?~`{}\\',
        expected =
          '-data1-\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)_\\=\\+\\,\\.\\<\\>\\"\\\'\\:\\;\\[\\]\\/\\|\\?\\~\\`\\{\\}\\\\',
        suffix = chart.internal.getTargetSelectorSuffix(input)
      expect(suffix).toBe(expected)
    })
  })

  describe('select target in chart', function() {
    it('should replace space to "-" with multibyte characters', function() {
      var selector = '.c3-target-data3-мужчины'
      expect(chart.internal.main.select(selector).size()).toBe(1)
    })

    it('should be able to select class with unicode characters', () => {
      const selector = `.c3-target${chart.internal.getTargetSelectorSuffix(
        args.data.columns[3][0]
      )}`

      expect(chart.internal.main.select(selector).size()).toBe(1)
    })
  })
})
