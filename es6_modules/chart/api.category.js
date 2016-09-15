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
    ChartInternal,
} from '../internals/index';

const category = function (i, category) {
    let $$ = this.internal, config = $$.config;
    if (arguments.length > 1) {
        config.axis_x_categories[i] = category;
        $$.redraw();
    }
    return config.axis_x_categories[i];
};
const categories = function (categories) {
    let $$ = this.internal, config = $$.config;
    if (!arguments.length) { return config.axis_x_categories; }
    config.axis_x_categories = categories;
    $$.redraw();
    return config.axis_x_categories;
};

export { category, categories };
