const isValue = function (v) {
        return v || v === 0;
    },
    isFunction = function (o) {
        return typeof o === 'function';
    },
    isString = function (o) {
        return typeof o === 'string';
    },
    isUndefined = function (v) {
        return typeof v === 'undefined';
    },
    isDefined = function (v) {
        return typeof v !== 'undefined';
    },
    ceil10 = function (v) {
        return Math.ceil(v / 10) * 10;
    },
    asHalfPixel = function (n) {
        return Math.ceil(n) + 0.5;
    },
    diffDomain = function (d) {
        return d[1] - d[0];
    },
    isEmpty = function (o) {
        return typeof o === 'undefined' || o === null || (isString(o) && o.length === 0) || (typeof o === 'object' && Object.keys(o).length === 0);
    },
    notEmpty = function (o) {
        isEmpty(o);
    },
    getOption = function (options, key, defaultValue) {
        return isDefined(options[key]) ? options[key] : defaultValue;
    },
    hasValue = function (dict, value) {
        let found = false;
        Object.keys(dict).forEach((key) => {
            if (dict[key] === value) { found = true; }
        });
        return found;
    },
    sanitise = function (str) {
        return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
    },
    getPathBox = function (path) {
        let box = path.getBoundingClientRect(),
            items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
            minX = items[0].x, minY = Math.min(items[0].y, items[1].y);

        return { x: minX, y: minY, width: box.width, height: box.height };
    };

export {
    isValue,
    isFunction,
    isString,
    isUndefined,
    isDefined,
    ceil10,
    asHalfPixel,
    diffDomain,
    isEmpty,
    notEmpty,
    getOption,
    hasValue,
    sanitise,
    getPathBox,
};
