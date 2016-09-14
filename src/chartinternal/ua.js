c3_chart_internal_fn.isSafari = function () {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Safari') >= 0 && ua.indexOf('Chrome') < 0;
};
c3_chart_internal_fn.isChrome = function () {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Chrome') >= 0;
};
