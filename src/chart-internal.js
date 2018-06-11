import  * as d3 from 'd3';

export function ChartInternal(api) {
    var $$ = this;
    $$.d3 = d3;
    $$.api = api;
    $$.config = $$.getDefaultConfig();
    $$.data = {};
    $$.cache = {};
    $$.axes = {};
}
