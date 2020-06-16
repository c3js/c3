export const asHalfPixel = function(n: number): number {
  return Math.ceil(n) + 0.5
}
export const ceil10 = function(v) {
  return Math.ceil(v / 10) * 10
}
export const diffDomain = function(d) {
  return d[1] - d[0]
}
export const getOption = function(options, key, defaultValue) {
  return isDefined(options[key]) ? options[key] : defaultValue
}
export const getPathBox = function(path) {
  const box = getBBox(path),
    items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
    minX = items[0].x,
    minY = Math.min(items[0].y, items[1].y)
  return { x: minX, y: minY, width: box.width, height: box.height }
}
export const getBBox = function(element) {
  try {
    return element.getBBox()
  } catch (ignore) {
    // Firefox will throw an exception if getBBox() is called whereas the
    // element is rendered with display:none
    // See https://github.com/c3js/c3/issues/2692

    // The previous code was using `getBoundingClientRect` which was returning
    // everything at 0 in this case so let's reproduce this behavior here.

    return { x: 0, y: 0, width: 0, height: 0 }
  }
}
export const hasValue = function(dict, value): boolean {
  let found = false
  Object.keys(dict).forEach(function(key) {
    if (dict[key] === value) {
      found = true
    }
  })
  return found
}
export const isArray = function(o: unknown): boolean {
  return Array.isArray(o)
}
export const isDefined = function(v) {
  return typeof v !== 'undefined'
}
export const isEmpty = function(o) {
  return (
    typeof o === 'undefined' ||
    o === null ||
    (isString(o) && o.length === 0) ||
    (typeof o === 'object' && Object.keys(o).length === 0)
  )
}
export const isFunction = function(o) {
  return typeof o === 'function'
}
export const isNumber = function(o) {
  return typeof o === 'number'
}
export const isString = function(o) {
  return typeof o === 'string'
}
export const isUndefined = function(v) {
  return typeof v === 'undefined'
}
export const isValue = function(v: unknown): boolean {
  return Boolean(v || v === 0)
}
export const notEmpty = function(o) {
  return !isEmpty(o)
}
export const sanitise = function(str: string): string {
  return typeof str === 'string'
    ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : str
}
export const flattenArray = function(arr: any): any[] {
  return Array.isArray(arr) ? [].concat(...arr) : []
}
/**
 * Returns whether the point is within the given box.
 *
 * @param {Array} point An [x,y] coordinate
 * @param {Object} box An object with {x, y, width, height} keys
 * @param {Number} sensitivity An offset to ease check on very small boxes
 */
export const isWithinBox = function(point, box, sensitivity = 0): boolean {
  const xStart = box.x - sensitivity
  const xEnd = box.x + box.width + sensitivity
  const yStart = box.y + box.height + sensitivity
  const yEnd = box.y - sensitivity

  return (
    xStart < point[0] && point[0] < xEnd && yEnd < point[1] && point[1] < yStart
  )
}

/**
 * Returns Internet Explorer version number (or false if no Internet Explorer used).
 *
 * @param string agent Optional parameter to specify user agent
 */
export const getIEVersion = function(agent?: string): number | undefined {
  // https://stackoverflow.com/questions/19999388/check-if-user-is-using-ie
  if (typeof agent === 'undefined') {
    agent = window.navigator.userAgent
  }

  let pos = agent.indexOf('MSIE ') // up to IE10
  if (pos > 0) {
    return parseInt(agent.substring(pos + 5, agent.indexOf('.', pos)), 10)
  }

  pos = agent.indexOf('Trident/') // IE11
  if (pos > 0) {
    pos = agent.indexOf('rv:')
    return parseInt(agent.substring(pos + 3, agent.indexOf('.', pos)), 10)
  }
}

/**
 * Returns whether the used browser is Internet Explorer.
 *
 * @param version Optional parameter to specify IE version
 */
export const isIE = function(version?: number): boolean {
  const ver = getIEVersion()

  if (typeof version === 'undefined') {
    return !!ver
  }

  return version === ver
}
