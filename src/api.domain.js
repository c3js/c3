c3_chart_fn.domain = function () {};

c3_chart_fn.domain.max = function (max) {
    var $$ = this.internal, config = $$.config, d3 = $$.d3;
    if (max === 0 || max) {
        config.axis_x_domain_max = d3.max([$$.orgXDomain[1], max]);
    }
    else {
        return config.axis_x_domain_max;
    }
};

c3_chart_fn.domain.min = function (min) {
    var $$ = this.internal, config = $$.config, d3 = $$.d3;
    if (min === 0 || min) {
        config.axis_x_domain_min = d3.min([$$.orgXDomain[0], min]);
    }
    else {
        return config.axis_x_domain_min;
    }
};

c3_chart_fn.domain.range = function (range) {
    if (arguments.length) {
        if (isDefined(range.max)) { this.domain.max(range.max); }
        if (isDefined(range.min)) { this.domain.min(range.min); }
    } else {
        return {
            max: this.domain.max(),
            min: this.domain.min()
        };
    }
};