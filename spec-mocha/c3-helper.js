import { jsdom } from 'jsdom';
import * as c3 from '../src/index';

export function initDom() {
    var div = jsdom('<div></div>');
    div.id = 'chart';
    div.style.width = '640px';
    div.style.height = '480px';
    document.body.appendChild(div);
    document.body.style.margin = '0px';
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

export function initChart(chart, args, done) {
    if (typeof chart === 'undefined') {
        initDom();
    }
    if (args) {
        chart = c3.generate(args);
        global.d3 = chart.internal.d3;
        global.d3.select('.jasmine_html-reporter')
            .style('position', 'absolute')
            .style('width', '640px')
            .style('right', 0);
    }

    window.setTimeout(function () {
        done();
    }, 10);

    return chart;
}
