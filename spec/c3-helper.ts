import c3 from '../src/index'
;(window as any).c3 = c3
const d3 = (window.d3 = require('d3'))

const initDom = ((window as any).initDom = function() {
  var div = document.createElement('div')
  div.id = 'chart'
  div.style.width = '640px'
  div.style.height = '480px'
  document.body.appendChild(div)
  document.body.style.margin = '0px'
})

const setMouseEvent = ((window as any).setMouseEvent = function(
  chart,
  name,
  x,
  y,
  element
) {
  var paddingLeft = chart.internal.main.node().transform.baseVal.getItem(0)
      .matrix.e,
    event = document.createEvent('MouseEvents')
  event.initMouseEvent(
    name,
    true,
    true,
    window,
    0,
    0,
    0,
    x + paddingLeft,
    y + 5,
    false,
    false,
    false,
    false,
    0,
    null
  )
  if (element) {
    element.dispatchEvent(event)
  }
})

const initChart = ((window as any).initChart = function(chart, args, done) {
  if (typeof chart === 'undefined') {
    initDom()
  }
  if (args) {
    chart = c3.generate(args)
    window.d3 = chart.internal.d3
    window.d3
      .select('.jasmine_html-reporter')
      .style('position', 'absolute')
      .style('width', '640px')
      .style('right', 0)

    // when using Karma debug in browser the `window.chart` reference the DOM element
    // instead of the actual chart instance here so let's keep it here
    ;(window as any).chartInstance = chart
  }

  window.setTimeout(function() {
    done()
  }, 10)

  return chart
})

export { d3, c3, initDom, setMouseEvent, initChart }
