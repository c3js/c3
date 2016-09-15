const hasCaches = function (ids) {
    for (let i = 0; i < ids.length; i++) {
        if (!(ids[i] in this.cache)) { return false; }
    }
    return true;
};

const addCache = function (id, target) {
    this.cache[id] = this.cloneTarget(target);
};

const getCaches = function (ids) {
    let targets = [], i;
    for (i = 0; i < ids.length; i++) {
        if (ids[i] in this.cache) { targets.push(this.cloneTarget(this.cache[ids[i]])); }
    }
    return targets;
};

export {
    hasCaches,
    addCache,
    getCaches,
};
