export var asHalfPixel = function(n) {
  return Math.ceil(n) + 0.5
}
export var ceil10 = function(v) {
  return Math.ceil(v / 10) * 10
}
export var diffDomain = function(d) {
  return d[1] - d[0]
}
export var getOption = function(options, key, defaultValue) {
  return isDefined(options[key]) ? options[key] : defaultValue
}
export var getPathBox = function(path) {
  var box = getBBox(path),
    items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
    minX = items[0].x,
    minY = Math.min(items[0].y, items[1].y)
  return { x: minX, y: minY, width: box.width, height: box.height }
}
export var getBBox = function(element) {
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
export var hasValue = function(dict, value) {
  var found = false
  Object.keys(dict).forEach(function(key) {
    if (dict[key] === value) {
      found = true
    }
  })
  return found
}
export var isArray = function(o) {
  return Array.isArray(o)
}
export var isDefined = function(v) {
  return typeof v !== 'undefined'
}
export var isEmpty = function(o) {
  return (
    typeof o === 'undefined' ||
    o === null ||
    (isString(o) && o.length === 0) ||
    (typeof o === 'object' && Object.keys(o).length === 0)
  )
}
export var isFunction = function(o) {
  return typeof o === 'function'
}
export var isNumber = function(o) {
  return typeof o === 'number'
}
export var isString = function(o) {
  return typeof o === 'string'
}
export var isUndefined = function(v) {
  return typeof v === 'undefined'
}
export var isValue = function(v) {
  return v || v === 0
}
export var notEmpty = function(o) {
  return !isEmpty(o)
}
export var sanitise = function(str) {
  return typeof str === 'string'
    ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : str
}
export var flattenArray = function(arr) {
  return Array.isArray(arr) ? [].concat(...arr) : []
}
/**
 * Returns whether the point is within the given box.
 *
 * @param {Array} point An [x,y] coordinate
 * @param {Object} box An object with {x, y, width, height} keys
 * @param {Number} sensitivity An offset to ease check on very small boxes
 */
export var isWithinBox = function(point, box, sensitivity = 0) {
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
export var getIEVersion = function(agent?: string) {
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

  return false
}

/**
 * Returns whether the used browser is Internet Explorer.
 *
 * @param version Optional parameter to specify IE version
 */
export var isIE = function(version?: number) {
  const ver = getIEVersion()

  if (typeof version === 'undefined') {
    return !!ver
  }

  return version === ver
}
