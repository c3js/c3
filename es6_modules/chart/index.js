import { ChartInternal } from '../internals/index';

import { axis } from './api.axis';
import { category, categories } from './api.category';
import { resize, flush, destroy } from './api.chart';
import { color } from './api.color';
import { data } from './api.data';
import { flow } from './api.flow';
import { focus, defocus, revert } from './api.focus';
import { xgrids, ygrids } from './api.grid';
import { groups } from './api.group';
import { legend } from './api.legend';
import { load, unload } from './api.load';
import { regions } from './api.region';
import { selected, select, unselect } from './api.selection';
import { show, hide, toggle } from './api.show';
import { tooltip } from './api.tooltip';
import { transform } from './api.transform';
import { x, xs } from './api.x';
import { zoom, unzoom } from './api.zoom';


let c3_chart_fn;

function Chart(config) {
    const $$ = this.internal = new ChartInternal(this);
    $$.loadConfig(config);

    $$.beforeInit(config);
    $$.init();
    $$.afterInit(config);

    // bind "this" to nested API
    (function bindThis(fn, target, argThis) {
        Object.keys(fn).forEach((key) => {
            target[key] = fn[key].bind(argThis);
            if (Object.keys(fn[key]).length > 0) {
                bindThis(fn[key], target[key], argThis);
            }
        });
    })(c3_chart_fn, this, this);
}

c3_chart_fn = Chart.prototype;

c3_chart_fn.axis = axis;
c3_chart_fn.category = category;
c3_chart_fn.categories = categories;
c3_chart_fn.resize = resize;
c3_chart_fn.flush = flush;
c3_chart_fn.destroy = destroy;
c3_chart_fn.color = color;
c3_chart_fn.data = data;
c3_chart_fn.flow = flow;
c3_chart_fn.focus = focus;
c3_chart_fn.defocus = defocus;
c3_chart_fn.revert = revert;
c3_chart_fn.xgrids = xgrids;
c3_chart_fn.ygrids = ygrids;
c3_chart_fn.groups = groups;
c3_chart_fn.legend = legend;
c3_chart_fn.load = load;
c3_chart_fn.unload = unload;
c3_chart_fn.regions = regions;
c3_chart_fn.selected = selected;
c3_chart_fn.select = select;
c3_chart_fn.unselect = unselect;
c3_chart_fn.show = show;
c3_chart_fn.hide = hide;
c3_chart_fn.toggle = toggle;
c3_chart_fn.tooltip = tooltip;
c3_chart_fn.transform = transform;
c3_chart_fn.x = x;
c3_chart_fn.xs = xs;
c3_chart_fn.zoom = zoom;
c3_chart_fn.unzoom = unzoom;

export { Chart };
