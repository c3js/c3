// import {
//     CLASS,
//     isValue,
//     isFunction,
//     isString,
//     isUndefined,
//     isDefined,
//     ceil10,
//     asHalfPixel,
//     diffDomain,
//     isEmpty,
//     notEmpty,
//     getOption,
//     hasValue,
//     sanitise,
//     getPathBox,
//     ChartInternal } from '../chartinternal';

import Axis from './axis';

function API(owner) {
    this.owner = owner;
}

/* eslint-disable */
function inherit(base, derived) {
    if (Object.create) {
        derived.prototype = Object.create(base.prototype);
    } else {
        const f = function f() {};
        f.prototype = base.prototype;
        derived.prototype = new f();
    }

    derived.prototype.constructor = derived;

    return derived;
}
/* eslint-enable */

export { API, inherit, Axis };
