import { ChartInternal } from './core'

/**
 * Store value into cache
 *
 * @param key
 * @param value
 */
ChartInternal.prototype.addToCache = function(key, value) {
  this.cache[`$${key}`] = value
}

/**
 * Returns a cached value or undefined
 *
 * @param key
 * @return {*}
 */
ChartInternal.prototype.getFromCache = function(key) {
  return this.cache[`$${key}`]
}

/**
 * Reset cached data
 */
ChartInternal.prototype.resetCache = function() {
  Object.keys(this.cache)
    .filter(key => /^\$/.test(key))
    .forEach(key => {
      delete this.cache[key]
    })
}

// Old API that stores Targets

ChartInternal.prototype.hasCaches = function(ids) {
  for (var i = 0; i < ids.length; i++) {
    if (!(ids[i] in this.cache)) {
      return false
    }
  }
  return true
}
ChartInternal.prototype.addCache = function(id, target) {
  this.cache[id] = this.cloneTarget(target)
}
ChartInternal.prototype.getCaches = function(ids) {
  var targets = [],
    i
  for (i = 0; i < ids.length; i++) {
    if (ids[i] in this.cache) {
      targets.push(this.cloneTarget(this.cache[ids[i]]))
    }
  }
  return targets
}
