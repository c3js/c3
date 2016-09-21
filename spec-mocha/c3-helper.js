import { jsdom } from 'jsdom';
import * as c3 from '../c3';

export function initDom() {
    var document = jsdom('<div id="chart"></div>');
    var div = document.getElementById('chart');
    div.style.width = '640px';
    div.style.height = '480px';
    document.body.style.margin = '0px';
    return div;
}

// export function setMouseEvent(chart, name, x, y, element) {
//     var paddingLeft = chart.internal.main.node().transform.baseVal.getItem(0).matrix.e,
//         event = document.createEvent("MouseEvents");
//     event.initMouseEvent(name, true, true, window,
//                        0, 0, 0, x + paddingLeft, y + 5,
//                        false, false, false, false, 0, null);
//     chart.internal.d3.event = event;
//     if (element) { element.dispatchEvent(event); }
// }

export function initChart(chart, args = {}, done) {
    if (typeof chart === 'undefined') {
        args.bindto = initDom();
    }

    chart = c3.generate(args);

    setTimeout(function () {
        done();
    }, 10);

    return chart;
}
