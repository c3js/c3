export function ChartInternal(api) {
    var $$ = this;
    $$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
    $$.api = api;
    $$.config = $$.getDefaultConfig();
    $$.data = {};
    $$.cache = {};
    $$.axes = {};
}
