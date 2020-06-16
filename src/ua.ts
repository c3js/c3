import { ChartInternal } from './core'

ChartInternal.prototype.isSafari = function() {
  const ua = window.navigator.userAgent
  return ua.indexOf('Safari') >= 0 && ua.indexOf('Chrome') < 0
}
ChartInternal.prototype.isChrome = function() {
  const ua = window.navigator.userAgent
  return ua.indexOf('Chrome') >= 0
}
