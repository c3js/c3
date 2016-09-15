import {
    CLASS,
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
    ChartInternal
} from '../internals/index';

// TODO: fix
const color = function (id) {
    const $$ = this.internal;
    return $$.color(id); // more patterns
};

export { color };
