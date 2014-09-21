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
