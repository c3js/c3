import { ChartInternal } from './core'
import { isValue, isUndefined, isDefined, notEmpty, isArray } from './util'

ChartInternal.prototype.convertUrlToData = function(
  url,
  mimeType,
  headers,
  keys,
  done
) {
  var $$ = this,
    type = mimeType ? mimeType : 'csv',
    f,
    converter

  if (type === 'json') {
    f = $$.d3.json
    converter = $$.convertJsonToData
  } else if (type === 'tsv') {
    f = $$.d3.tsv
    converter = $$.convertXsvToData
  } else {
    f = $$.d3.csv
    converter = $$.convertXsvToData
  }

  f(url, headers)
    .then(function(data) {
      done.call($$, converter.call($$, data, keys))
    })
    .catch(function(error) {
      throw error
    })
}
ChartInternal.prototype.convertXsvToData = function(xsv) {
  var keys = xsv.columns,
    rows = xsv
  if (rows.length === 0) {
    return {
      keys,
      rows: [keys.reduce((row, key) => Object.assign(row, { [key]: null }), {})]
    }
  } else {
    // [].concat() is to convert result into a plain array otherwise
    // test is not happy because rows have properties.
    return { keys, rows: [].concat(xsv) }
  }
}
ChartInternal.prototype.convertJsonToData = function(json, keys) {
  var $$ = this,
    new_rows = [],
    targetKeys,
    data
  if (keys) {
    // when keys specified, json would be an array that includes objects
    if (keys.x) {
      targetKeys = keys.value.concat(keys.x)
      $$.config.data_x = keys.x
    } else {
      targetKeys = keys.value
    }
    new_rows.push(targetKeys)
    json.forEach(function(o) {
      var new_row = []
      targetKeys.forEach(function(key) {
        // convert undefined to null because undefined data will be removed in convertDataToTargets()
        var v = $$.findValueInJson(o, key)
        if (isUndefined(v)) {
          v = null
        }
        new_row.push(v)
      })
      new_rows.push(new_row)
    })
    data = $$.convertRowsToData(new_rows)
  } else {
    Object.keys(json).forEach(function(key) {
      new_rows.push([key].concat(json[key]))
    })
    data = $$.convertColumnsToData(new_rows)
  }
  return data
}
/**
 * Finds value from the given nested object by the given path.
 * If it's not found, then this returns undefined.
 * @param {Object} object the object
 * @param {string} path the path
 */
ChartInternal.prototype.findValueInJson = function(object, path) {
  if (path in object) {
    // If object has a key that contains . or [], return the key's value
    // instead of searching for an inner object.
    // See https://github.com/c3js/c3/issues/1691 for details.
    return object[path]
  }

  path = path.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties (replace [] with .)
  path = path.replace(/^\./, '') // strip a leading dot
  var pathArray = path.split('.')
  for (var i = 0; i < pathArray.length; ++i) {
    var k = pathArray[i]
    if (k in object) {
      object = object[k]
    } else {
      return
    }
  }
  return object
}

/**
 * Converts the rows to normalized data.
 * @param {any[][]} rows The row data
 * @return {Object}
 */
ChartInternal.prototype.convertRowsToData = rows => {
  const newRows = []
  const keys = rows[0]

  for (let i = 1; i < rows.length; i++) {
    const newRow = {}
    for (let j = 0; j < rows[i].length; j++) {
      if (isUndefined(rows[i][j])) {
        throw new Error(
          'Source data is missing a component at (' + i + ',' + j + ')!'
        )
      }
      newRow[keys[j]] = rows[i][j]
    }
    newRows.push(newRow)
  }
  return { keys, rows: newRows }
}

/**
 * Converts the columns to normalized data.
 * @param {any[][]} columns The column data
 * @return {Object}
 */
ChartInternal.prototype.convertColumnsToData = columns => {
  const newRows = []
  const keys = []

  for (let i = 0; i < columns.length; i++) {
    const key = columns[i][0]
    for (let j = 1; j < columns[i].length; j++) {
      if (isUndefined(newRows[j - 1])) {
        newRows[j - 1] = {}
      }
      if (isUndefined(columns[i][j])) {
        throw new Error(
          'Source data is missing a component at (' + i + ',' + j + ')!'
        )
      }
      newRows[j - 1][key] = columns[i][j]
    }
    keys.push(key)
  }

  return { keys, rows: newRows }
}

/**
 * Converts the data format into the target format.
 * @param {!Object} data
 * @param {!Array} data.keys Ordered list of target IDs.
 * @param {!Array} data.rows Rows of data to convert.
 * @param {boolean} appendXs True to append to $$.data.xs, False to replace.
 * @return {!Array}
 */
ChartInternal.prototype.convertDataToTargets = function(data, appendXs) {
  var $$ = this,
    config = $$.config,
    targets,
    ids,
    xs,
    keys,
    epochs

  // handles format where keys are not orderly provided
  if (isArray(data)) {
    keys = Object.keys(data[0])
  } else {
    keys = data.keys
    data = data.rows
  }

  xs = keys.filter($$.isX, $$)

  if (!$$.isStanfordGraphType()) {
    ids = keys.filter($$.isNotX, $$)
  } else {
    epochs = keys.filter($$.isEpochs, $$)
    ids = keys.filter($$.isNotXAndNotEpochs, $$)

    if (xs.length !== 1 || epochs.length !== 1 || ids.length !== 1) {
      throw new Error(
        "You must define the 'x' key name and the 'epochs' for Stanford Diagrams"
      )
    }
  }

  // save x for update data by load when custom x and c3.x API
  ids.forEach(function(id) {
    var xKey = $$.getXKey(id)

    if ($$.isCustomX() || $$.isTimeSeries()) {
      // if included in input data
      if (xs.indexOf(xKey) >= 0) {
        $$.data.xs[id] = (appendXs && $$.data.xs[id]
          ? $$.data.xs[id]
          : []
        ).concat(
          data
            .map(function(d) {
              return d[xKey]
            })
            .filter(isValue)
            .map(function(rawX, i) {
              return $$.generateTargetX(rawX, id, i)
            })
        )
      }
      // if not included in input data, find from preloaded data of other id's x
      else if (config.data_x) {
        $$.data.xs[id] = $$.getOtherTargetXs()
      }
      // if not included in input data, find from preloaded data
      else if (notEmpty(config.data_xs)) {
        $$.data.xs[id] = $$.getXValuesOfXKey(xKey, $$.data.targets)
      }
      // MEMO: if no x included, use same x of current will be used
    } else {
      $$.data.xs[id] = data.map(function(d, i) {
        return i
      })
    }
  })

  // check x is defined
  ids.forEach(function(id) {
    if (!$$.data.xs[id]) {
      throw new Error('x is not defined for id = "' + id + '".')
    }
  })

  // convert to target
  targets = ids.map(function(id, index) {
    var convertedId = config.data_idConverter(id)
    return {
      id: convertedId,
      id_org: id,
      values: data
        .map(function(d, i) {
          var xKey = $$.getXKey(id),
            rawX = d[xKey],
            value = d[id] !== null && !isNaN(d[id]) ? +d[id] : null,
            x,
            returnData
          // use x as categories if custom x and categorized
          if ($$.isCustomX() && $$.isCategorized() && !isUndefined(rawX)) {
            if (index === 0 && i === 0) {
              config.axis_x_categories = []
            }
            x = config.axis_x_categories.indexOf(rawX)
            if (x === -1) {
              x = config.axis_x_categories.length
              config.axis_x_categories.push(rawX)
            }
          } else {
            x = $$.generateTargetX(rawX, id, i)
          }
          // mark as x = undefined if value is undefined and filter to remove after mapped
          if (isUndefined(d[id]) || $$.data.xs[id].length <= i) {
            x = undefined
          }

          returnData = { x: x, value: value, id: convertedId }

          if ($$.isStanfordGraphType()) {
            returnData.epochs = d[epochs]
          }

          return returnData
        })
        .filter(function(v) {
          return isDefined(v.x)
        })
    }
  })

  // finish targets
  targets.forEach(function(t) {
    var i
    // sort values by its x
    if (config.data_xSort) {
      t.values = t.values.sort(function(v1, v2) {
        var x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
          x2 = v2.x || v2.x === 0 ? v2.x : Infinity
        return x1 - x2
      })
    }
    // indexing each value
    i = 0
    t.values.forEach(function(v) {
      v.index = i++
    })
    // this needs to be sorted because its index and value.index is identical
    $$.data.xs[t.id].sort(function(v1, v2) {
      return v1 - v2
    })
  })

  // cache information about values
  $$.hasNegativeValue = $$.hasNegativeValueInTargets(targets)
  $$.hasPositiveValue = $$.hasPositiveValueInTargets(targets)

  // set target types
  if (config.data_type) {
    $$.setTargetType(
      $$.mapToIds(targets).filter(function(id) {
        return !(id in config.data_types)
      }),
      config.data_type
    )
  }

  // cache as original id keyed
  targets.forEach(function(d) {
    $$.addCache(d.id_org, d)
  })

  return targets
}
