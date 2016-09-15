const isSafari = function () {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Safari') >= 0 && ua.indexOf('Chrome') < 0;
};
const isChrome = function () {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Chrome') >= 0;
};

export { isSafari, isChrome };
