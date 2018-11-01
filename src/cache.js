import { ChartInternal } from './core';

ChartInternal.prototype.hasCaches = function (ids) {
    for (var i = 0; i < ids.length; i++) {
        if (! (ids[i] in this.cache)) { return false; }
    }
    return true;
};
ChartInternal.prototype.addCache = function (id, target) {
    this.cache[id] = this.cloneTarget(target);
};
ChartInternal.prototype.getCaches = function (ids) {
    var targets = [], i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] in this.cache) { targets.push(this.cloneTarget(this.cache[ids[i]])); }
    }
    return targets;
};
