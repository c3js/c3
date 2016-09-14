c3_chart_fn.resize = function (size) {
    let $$ = this.internal, config = $$.config;
    config.size_width = size ? size.width : null;
    config.size_height = size ? size.height : null;
    this.flush();
};

c3_chart_fn.flush = function () {
    const $$ = this.internal;
    $$.updateAndRedraw({ withLegend: true, withTransition: false, withTransitionForTransform: false });
};

c3_chart_fn.destroy = function () {
    const $$ = this.internal;

    window.clearInterval($$.intervalForObserveInserted);

    if ($$.resizeTimeout !== undefined) {
        window.clearTimeout($$.resizeTimeout);
    }

    if (window.detachEvent) {
        window.detachEvent('onresize', $$.resizeFunction);
    } else if (window.removeEventListener) {
        window.removeEventListener('resize', $$.resizeFunction);
    } else {
        const wrapper = window.onresize;
        // check if no one else removed our wrapper and remove our resizeFunction from it
        if (wrapper && wrapper.add && wrapper.remove) {
            wrapper.remove($$.resizeFunction);
        }
    }

    $$.selectChart.classed('c3', false).html('');

    // MEMO: this is needed because the reference of some elements will not be released, then memory leak will happen.
    Object.keys($$).forEach((key) => {
        $$[key] = null;
    });

    return null;
};
