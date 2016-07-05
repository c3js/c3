c3_chart_fn.resize = function (size) {
    var $$ = this.internal, config = $$.config;
    config.size_width = size ? size.width : null;
    config.size_height = size ? size.height : null;
    this.flush();
};

c3_chart_fn.width = function(width){
    var $$ = this.internal, config = $$.config;

    if(width === undefined){
        return config.size_width;
    }

    config.size_width = width;
    this.flush();
}

c3_chart_fn.height = function(height){
    var $$ = this.internal, config = $$.config;

    if(height === undefined){
        return config.size_height;
    }

    config.size_height = height;
    this.flush();
}


c3_chart_fn.flush = function () {
    var $$ = this.internal;
    $$.updateAndRedraw({withLegend: true, withTransition: false, withTransitionForTransform: false});
};

c3_chart_fn.destroy = function () {
    var $$ = this.internal;

    window.clearInterval($$.intervalForObserveInserted);

    if ($$.resizeTimeout !== undefined) {
        window.clearTimeout($$.resizeTimeout);
    }

    if (window.detachEvent) {
        window.detachEvent('onresize', $$.resizeFunction);
    } else if (window.removeEventListener) {
        window.removeEventListener('resize', $$.resizeFunction);
    } else {
        var wrapper = window.onresize;
        // check if no one else removed our wrapper and remove our resizeFunction from it
        if (wrapper && wrapper.add && wrapper.remove) {
            wrapper.remove($$.resizeFunction);
        }
    }

    $$.selectChart.classed('c3', false).html("");

    // MEMO: this is needed because the reference of some elements will not be released, then memory leak will happen.
    Object.keys($$).forEach(function (key) {
        $$[key] = null;
    });

    return null;
};
