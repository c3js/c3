function API(owner) {
    this.owner = owner;
}

function inherit(base, derived) {
    if (Object.create) {
        derived.prototype = Object.create(base.prototype);
    } else {
        const f = function f() {};
        f.prototype = base.prototype;
        derived.prototype = new f();
    }

    derived.prototype.constructor = derived;

    return derived;
}
