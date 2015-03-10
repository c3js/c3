c3_chart_internal_fn.convertUrlToData = function (url, mimeType, keys, done) {
    var $$ = this, type = mimeType ? mimeType : 'csv';
    $$.d3.xhr(url, function (error, data) {
        var d;
        if (!data) {
            throw new Error(error.responseURL + ' ' + error.status + ' (' + error.statusText + ')');
        }
        if (type === 'json') {
            d = $$.convertJsonToData(JSON.parse(data.response), keys);
        } else if (type === 'tsv') {
            d = $$.convertTsvToData(data.response);
        } else {
            d = $$.convertCsvToData(data.response);
        }
        done.call($$, d);
    });
};
c3_chart_internal_fn.convertXsvToData = function (xsv, parser) {
    var rows = parser.parseRows(xsv), d;
    if (rows.length === 1) {
        d = [{}];
        rows[0].forEach(function (id) {
            d[0][id] = null;
        });
    } else {
        d = parser.parse(xsv);
    }
    return d;
};
c3_chart_internal_fn.convertCsvToData = function (csv) {
    return this.convertXsvToData(csv, this.d3.csv);
};
c3_chart_internal_fn.convertTsvToData = function (tsv) {
    return this.convertXsvToData(tsv, this.d3.tsv);
};
c3_chart_internal_fn.convertJsonToData = function (json, keys) {
    var $$ = this,
        new_rows = [], targetKeys, data;
    if (keys) { // when keys specified, json would be an array that includes objects
        if (keys.x) {
            targetKeys = keys.value.concat(keys.x);
            $$.config.data_x = keys.x;
        } else {
            targetKeys = keys.value;
        }
        new_rows.push(targetKeys);
        json.forEach(function (o) {
            var new_row = [];
            targetKeys.forEach(function (key) {
                // convert undefined to null because undefined data will be removed in convertDataToTargets()
                var v = isUndefined(o[key]) ? null : o[key];
                new_row.push(v);
            });
            new_rows.push(new_row);
        });
        data = $$.convertRowsToData(new_rows);
    } else {
        Object.keys(json).forEach(function (key) {
            new_rows.push([key].concat(json[key]));
        });
        data = $$.convertColumnsToData(new_rows);
    }
    return data;
};
c3_chart_internal_fn.convertRowsToData = function (rows) {
    var keys = rows[0], new_row = {}, new_rows = [], i, j;
    for (i = 1; i < rows.length; i++) {
        new_row = {};
        for (j = 0; j < rows[i].length; j++) {
            if (isUndefined(rows[i][j])) {
                throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
            }
            new_row[keys[j]] = rows[i][j];
        }
        new_rows.push(new_row);
    }
    return new_rows;
};
c3_chart_internal_fn.convertColumnsToData = function (columns) {
    var new_rows = [], i, j, key;
    for (i = 0; i < columns.length; i++) {
        key = columns[i][0];
        for (j = 1; j < columns[i].length; j++) {
            if (isUndefined(new_rows[j - 1])) {
                new_rows[j - 1] = {};
            }
            if (isUndefined(columns[i][j])) {
                throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
            }
            new_rows[j - 1][key] = columns[i][j];
        }
    }
    return new_rows;
};
c3_chart_internal_fn.convertDataToTargets = function (data, appendXs) {
    var $$ = this, config = $$.config,
        ids = $$.d3.keys(data[0]).filter($$.isNotX, $$),
        xs = $$.d3.keys(data[0]).filter($$.isX, $$),
        targets;

    // save x for update data by load when custom x and c3.x API
    ids.forEach(function (id) {
        var xKey = $$.getXKey(id);

        if ($$.isCustomX() || $$.isTimeSeries()) {
            // if included in input data
            if (xs.indexOf(xKey) >= 0) {
                $$.data.xs[id] = (appendXs && $$.data.xs[id] ? $$.data.xs[id] : []).concat(
                    data.map(function (d) { return d[xKey]; })
                        .filter(isValue)
                        .map(function (rawX, i) { return $$.generateTargetX(rawX, id, i); })
                );
            }
            // if not included in input data, find from preloaded data of other id's x
            else if (config.data_x) {
                $$.data.xs[id] = $$.getOtherTargetXs();
            }
            // if not included in input data, find from preloaded data
            else if (notEmpty(config.data_xs)) {
                $$.data.xs[id] = $$.getXValuesOfXKey(xKey, $$.data.targets);
            }
            // MEMO: if no x included, use same x of current will be used
        } else {
            $$.data.xs[id] = data.map(function (d, i) { return i; });
        }
    });


    // check x is defined
    ids.forEach(function (id) {
        if (!$$.data.xs[id]) {
            throw new Error('x is not defined for id = "' + id + '".');
        }
    });

    // convert to target
    targets = ids.map(function (id, index) {
        var convertedId = config.data_idConverter(id);
        return {
            id: convertedId,
            id_org: id,
            values: data.map(function (d, i) {
                var xKey = $$.getXKey(id), rawX = d[xKey], x = $$.generateTargetX(rawX, id, i);
                // use x as categories if custom x and categorized
                if ($$.isCustomX() && $$.isCategorized() && index === 0 && rawX) {
                    if (i === 0) { config.axis_x_categories = []; }
                    config.axis_x_categories.push(rawX);
                }
                // mark as x = undefined if value is undefined and filter to remove after mapped
                if (isUndefined(d[id]) || $$.data.xs[id].length <= i) {
                    x = undefined;
                }
                return {x: x, value: d[id] !== null && !isNaN(d[id]) ? +d[id] : null, id: convertedId};
            }).filter(function (v) { return isDefined(v.x); })
        };
    });

    // finish targets
    targets.forEach(function (t) {
        var i;
        // sort values by its x
        if (config.data_xSort) {
            t.values = t.values.sort(function (v1, v2) {
                var x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
                    x2 = v2.x || v2.x === 0 ? v2.x : Infinity;
                return x1 - x2;
            });
        }
        // indexing each value
        i = 0;
        t.values.forEach(function (v) {
            v.index = i++;
        });
        // this needs to be sorted because its index and value.index is identical
        $$.data.xs[t.id].sort(function (v1, v2) {
            return v1 - v2;
        });
    });

    // set target types
    if (config.data_type) {
        $$.setTargetType($$.mapToIds(targets).filter(function (id) { return ! (id in config.data_types); }), config.data_type);
    }

    // cache as original id keyed
    targets.forEach(function (d) {
        $$.addCache(d.id_org, d);
    });

    return targets;
};
