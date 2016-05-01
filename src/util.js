var isValue = c3_chart_internal_fn.isValue = function (v) {
    return v || v === 0;
},
    isFunction = c3_chart_internal_fn.isFunction = function (o) {
        return typeof o === 'function';
    },
    isString = c3_chart_internal_fn.isString = function (o) {
        return typeof o === 'string';
    },
    isUndefined = c3_chart_internal_fn.isUndefined = function (v) {
        return typeof v === 'undefined';
    },
    isDefined = c3_chart_internal_fn.isDefined = function (v) {
        return typeof v !== 'undefined';
    },
    ceil10 = c3_chart_internal_fn.ceil10 = function (v) {
        return Math.ceil(v / 10) * 10;
    },
    asHalfPixel = c3_chart_internal_fn.asHalfPixel = function (n) {
        return Math.ceil(n) + 0.5;
    },
    diffDomain = c3_chart_internal_fn.diffDomain = function (d) {
        return d[1] - d[0];
    },
    isEmpty = c3_chart_internal_fn.isEmpty = function (o) {
        return typeof o === 'undefined' || o === null || (isString(o) && o.length === 0) || (typeof o === 'object' && Object.keys(o).length === 0);
    },
    notEmpty = c3_chart_internal_fn.notEmpty = function (o) {
        return !c3_chart_internal_fn.isEmpty(o);
    },
    getOption = c3_chart_internal_fn.getOption = function (options, key, defaultValue) {
        return isDefined(options[key]) ? options[key] : defaultValue;
    },
    hasValue = c3_chart_internal_fn.hasValue = function (dict, value) {
        var found = false;
        Object.keys(dict).forEach(function (key) {
            if (dict[key] === value) { found = true; }
        });
        return found;
    },
    sanitise = c3_chart_internal_fn.sanitise = function (str) {
        return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
    },
    getPathBox = c3_chart_internal_fn.getPathBox = function (path) {
        var box = path.getBoundingClientRect(),
            items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
            minX = items[0].x, minY = Math.min(items[0].y, items[1].y);
        return {x: minX, y: minY, width: box.width, height: box.height};
    };
