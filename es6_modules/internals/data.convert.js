import {
    isUndefined,
    isValue,
    notEmpty,
    isDefined,
} from './util';

const convertUrlToData = function (url, mimeType, headers, keys, done) {
    let $$ = this, type = mimeType ? mimeType : 'csv';
    const req = $$.d3.xhr(url);
    if (headers) {
        Object.keys(headers).forEach((header) => {
            req.header(header, headers[header]);
        });
    }
    req.get((error, data) => {
        let d;
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
const convertXsvToData = function (xsv, parser) {
    let rows = parser.parseRows(xsv), d;
    if (rows.length === 1) {
        d = [{}];
        rows[0].forEach((id) => {
            d[0][id] = null;
        });
    } else {
        d = parser.parse(xsv);
    }
    return d;
};
const convertCsvToData = function (csv) {
    return this.convertXsvToData(csv, this.d3.csv);
};
const convertTsvToData = function (tsv) {
    return this.convertXsvToData(tsv, this.d3.tsv);
};
const convertJsonToData = function (json, keys) {
    let $$ = this,
        new_rows = [], targetKeys, data;
    if (keys) { // when keys specified, json would be an array that includes objects
        if (keys.x) {
            targetKeys = keys.value.concat(keys.x);
            $$.config.data_x = keys.x;
        } else {
            targetKeys = keys.value;
        }
        new_rows.push(targetKeys);
        json.forEach((o) => {
            const new_row = [];
            targetKeys.forEach((key) => {
                // convert undefined to null because undefined data will be removed in convertDataToTargets()
                let v = $$.findValueInJson(o, key);
                if (isUndefined(v)) {
                    v = null;
                }
                new_row.push(v);
            });
            new_rows.push(new_row);
        });
        data = $$.convertRowsToData(new_rows);
    } else {
        Object.keys(json).forEach((key) => {
            new_rows.push([key].concat(json[key]));
        });
        data = $$.convertColumnsToData(new_rows);
    }
    return data;
};
const findValueInJson = function (object, path) {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties (replace [] with .)
    path = path.replace(/^\./, '');           // strip a leading dot
    const pathArray = path.split('.');
    for (let i = 0; i < pathArray.length; ++i) {
        const k = pathArray[i];
        if (k in object) {
            object = object[k];
        } else {
            return;
        }
    }
    return object;
};
const convertRowsToData = function (rows) {
    let keys = rows[0], new_row = {}, new_rows = [], i, j;
    for (i = 1; i < rows.length; i++) {
        new_row = {};
        for (j = 0; j < rows[i].length; j++) {
            if (isUndefined(rows[i][j])) {
                throw new Error('Source data is missing a component at (' + i + ',' + j + ')!');
            }
            new_row[keys[j]] = rows[i][j];
        }
        new_rows.push(new_row);
    }
    return new_rows;
};
const convertColumnsToData = function (columns) {
    let new_rows = [], i, j, key;
    for (i = 0; i < columns.length; i++) {
        key = columns[i][0];
        for (j = 1; j < columns[i].length; j++) {
            if (isUndefined(new_rows[j - 1])) {
                new_rows[j - 1] = {};
            }
            if (isUndefined(columns[i][j])) {
                throw new Error('Source data is missing a component at (' + i + ',' + j + ')!');
            }
            new_rows[j - 1][key] = columns[i][j];
        }
    }
    return new_rows;
};
const convertDataToTargets = function (data, appendXs) {
    let $$ = this, config = $$.config,
        ids = $$.d3.keys(data[0]).filter($$.isNotX, $$),
        xs = $$.d3.keys(data[0]).filter($$.isX, $$),
        targets;

    // save x for update data by load when custom x and c3.x API
    ids.forEach((id) => {
        const xKey = $$.getXKey(id);

        if ($$.isCustomX() || $$.isTimeSeries()) {
            // if included in input data
            if (xs.indexOf(xKey) >= 0) {
                $$.data.xs[id] = (appendXs && $$.data.xs[id] ? $$.data.xs[id] : []).concat(
                    data.map((d) => { return d[xKey]; })
                        .filter(isValue)
                        .map((rawX, i) => { return $$.generateTargetX(rawX, id, i); })
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
            $$.data.xs[id] = data.map((d, i) => { return i; });
        }
    });


    // check x is defined
    ids.forEach((id) => {
        if (!$$.data.xs[id]) {
            throw new Error('x is not defined for id = "' + id + '".');
        }
    });

    // convert to target
    targets = ids.map((id, index) => {
        const convertedId = config.data_idConverter(id);
        return {
            id: convertedId,
            id_org: id,
            values: data.map((d, i) => {
                let xKey = $$.getXKey(id), rawX = d[xKey],
                    value = d[id] !== null && !isNaN(d[id]) ? +d[id] : null, x;
                // use x as categories if custom x and categorized
                if ($$.isCustomX() && $$.isCategorized() && index === 0 && !isUndefined(rawX)) {
                    if (index === 0 && i === 0) {
                        config.axis_x_categories = [];
                    }
                    x = config.axis_x_categories.indexOf(rawX);
                    if (x === -1) {
                        x = config.axis_x_categories.length;
                        config.axis_x_categories.push(rawX);
                    }
                } else {
                    x = $$.generateTargetX(rawX, id, i);
                }
                // mark as x = undefined if value is undefined and filter to remove after mapped
                if (isUndefined(d[id]) || $$.data.xs[id].length <= i) {
                    x = undefined;
                }
                return { x, value, id: convertedId };
            }).filter((v) => { return isDefined(v.x); }),
        };
    });

    // finish targets
    targets.forEach((t) => {
        let i;
        // sort values by its x
        if (config.data_xSort) {
            t.values = t.values.sort((v1, v2) => {
                let x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
                    x2 = v2.x || v2.x === 0 ? v2.x : Infinity;
                return x1 - x2;
            });
        }
        // indexing each value
        i = 0;
        t.values.forEach((v) => {
            v.index = i++;
        });
        // this needs to be sorted because its index and value.index is identical
        $$.data.xs[t.id].sort((v1, v2) => {
            return v1 - v2;
        });
    });

    // cache information about values
    $$.hasNegativeValue = $$.hasNegativeValueInTargets(targets);
    $$.hasPositiveValue = $$.hasPositiveValueInTargets(targets);

    // set target types
    if (config.data_type) {
        $$.setTargetType($$.mapToIds(targets).filter((id) => { return !(id in config.data_types); }), config.data_type);
    }

    // cache as original id keyed
    targets.forEach((d) => {
        $$.addCache(d.id_org, d);
    });

    return targets;
};

export {
    convertUrlToData,
    convertXsvToData,
    convertCsvToData,
    convertTsvToData,
    convertJsonToData,
    findValueInJson,
    convertRowsToData,
    convertColumnsToData,
    convertDataToTargets,
};
