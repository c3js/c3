function initDom() {
    'use strict';

    var div = document.createElement('div');
    div.id = 'chart';
    div.style.width = '640px';
    div.style.height = '480px';
    document.body.appendChild(div);
    document.body.style.margin = '0px';
}
typeof initDom !== 'undefined';

function setEvent(chart, x, y) {
    'use strict';

    var paddingLeft = chart.internal.main.node().transform.baseVal.getItem(0).matrix.e,
        evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window,
                       0, 0, 0, x + paddingLeft, y + 5,
                       false, false, false, false, 0, null);
    chart.internal.d3.event = evt;
}
typeof setEvent !== 'undefined';
