var Q = function () {
};

Q.copy = function (src, target, options, depth) {
    if(depth==null)
        depth = 0;
    if(depth==100){
        console.warn("Q.copy is in depth of 100 - possible circular reference")
    }
    ///<summary>Copies an object into a target object, recursively cloning any object or array in the way, overwrite=true will overwrite a primitive field value even if exists</summary>
    ///<param name="src" />
    ///<param name="target" />
    ///<param name="options" type="Object">{ overwrite:false }</param>
    ///<returns type="Object">The copied object</returns>
    options = options || { overwrite: false };
    if (src == target || src == null)
        return target;
    if (typeof (src) != "object") {
        if (options.overwrite || target == null)
            return src;
        return target;
    }
    if (typeof(src.clone)=="function") {
        if (options.overwrite || target == null)
            return src.clone();
        return target;
    }
    if (target == null) {
        if (src instanceof Array)
            target = [];
        else
            target = {};
    }

    if (src instanceof Array) {
        for (var i = 0; i < src.length; i++) {
            var item = src[i];
            var item2 = target[i];
            item2 = Q.copy(item, item2, options, depth+1);
            target[i] = item2;
        }
        target.splice(src.length, target.length - src.length);
        return target;
    }
    for (var p in src) {
        var value = src[p];
        var value2 = target[p];
        value2 = Q.copy(value, value2, options, depth+1);
        target[p] = value2;
    }
    return target;
}

Object.reversePairs = function (obj) {
    var list = [];
    for (var i = 0; i < obj.length; i++) {
        list.push([obj[i][1],obj[i][0]]);
    }
    return list;
}
Q.objectToNameValueArray = function () {
    var list = [];
    for (var p in this.obj) {
        list.push({ name: p, value: this.obj[p] });
    }
    return list;
}


Array.prototype.forEachJoin = function (action, actionBetweenItems) {
    var first = true;
    for (var i = 0; i < this.length; i++) {
        if (first)
            first = false;
        else
            actionBetweenItems();
        action(this[i]);
    }
}
Array.prototype.first = function (predicate) {
    if (predicate == null)
        return this[0];
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i]))
            return this[i];
    }
    return null;
}
Array.prototype.toArray = function () {
    return this.slice(0, this.length);
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
}
Array.prototype.last = function (predicate) {
    if (this.length == 0)
        return null;
    if (predicate == null)
        return this[this.length - 1];
    for (var i = this.length; i >= 0; i--) {
        if (predicate(this[i]))
            return this[i];
    }
    return null;
}
Q.objectValuesToArray = function (obj) {
    var list = [];
    for (var p in obj) {
        list.push(obj[p]);
    }
    return list;
}
Object.values = Q.objectValuesToArray;
Object.toArray = function (obj) {
    var list = [];
    for (var p in obj) {
        list.push(p, obj[p]);
    }
    return list;
}
Object.allKeys = function (obj) {
    var list = [];
    for (var p in obj) {
        list.push(p);
    }
    return list;
}
Object.keysValues = function (obj) {
    var list = [];
    for (var p in obj) {
        list.push({ key: p, value: obj[p] });
    }
    return list;
}

Object.pairs = function (obj) {
    var list = [];
    list.isArrayOfPairs = true;
    for (var p in obj) {
        list.push([p, obj[p]]);
    }
    return list;
}
Object.fromPairs = function (keysValues) {
    var obj = {};
    keysValues.forEach(function (pair) {
        obj[pair[0]] = pair[1];
    });
    return obj;
}
Q.cloneJson = function (obj) {
    if (obj == null)
        return null;
    return JSON.parse(JSON.stringify(obj));
};
Q.forEachValueInObject = function (obj, func, thisArg) {
    for (var p in obj) {
        func.call(thisArg, obj[p]);
    }
};
Array.prototype.toObject = function (selector) {
    if (selector == null) {
        return this.copyPairsToObject();
    }
    var obj = {};
    for (var i = 0; i < this.length; i++) {
        var obj2 = selector(this[i]);
        if (obj2 instanceof Array)
            obj2.copyPairsToObject(obj);
        else {
            for (var p in obj2)
                obj[p] = obj2[p];
        }
    }
    return obj;
};
Array.prototype.copyPairsToObject = function (obj) {
    if (obj == null)
        obj = {};
    for (var i = 0; i < this.length; i += 2) {
        obj[this[i]] = this[i + 1];
    }
    return obj;
};
//Object.keys = Q.keys;
Object.toSortedByKey = function (obj) {
    var sortedKeys = Object.keys(obj).sort();
    return sortedKeys.toObject(function (key) { return [key, obj[key]]; })
}
Q.mapKeyValueInArrayOrObject = function (objOrList, func, thisArg) {
    var list = [];
    if (objOrList instanceof Array) {
        for (var i = 0; i < objOrList.length; i++) {
            list.push(func.call(thisArg, i, objOrList[i]));
        }
    }
    else {
        for (var p in objOrList) {
            list.push(func.call(thisArg, p, objOrList[p]));
        }
    }
    return list;
};
//Alternative to $.map of jquery - which has array reducers overhead, and sometimes causes stackOverflow
Q.jMap = function (objOrList, func, thisArg) {
    var list = [];
    if (objOrList instanceof Array) {
        for (var i = 0; i < objOrList.length; i++) {
            list.push(func.call(thisArg, objOrList[i], i));
        }
    }
    else {
        for (var p in objOrList) {
            list.push(func.call(thisArg, objOrList[p], p));
        }
    }
    return list;
};
///Returns if the parameter is null, or an empty json object
Q.isEmptyObject = function (obj) {
    if (obj == null)
        return true;
    if (typeof (obj) != "object")
        return false;
    for (var p in obj)
        return false;
    return true;
};

Q.min = function (list) {
    return Math.min.apply(null, list);
};
Q.max = function (list) {
    return Math.max.apply(null, list);
};

function toStringOrEmpty(val) {
    return val == null ? "" : val.toString();
}

Object.getCreateArray = function (obj, p) {
    var value = obj[p];
    if (value == null) {
        value = [];
        obj[p] = value;
    }
    return value;
}

Array.prototype.removeLast = Array.prototype.pop;
Array.prototype.removeFirst = function () {
    return this.splice(0, 1)[0];
}

Array.prototype.remove = function (item) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === item) {
            this.removeAt(i);
            return true;
        }
    }
    return false;
}
Array.prototype.removeRange = function (items) {
    items.forEach(function (t) { this.remove(t); });
}
String.prototype.contains = function (s) {
    return this.indexOf(s) >= 0;
}
Array.prototype.contains = function (s) {
    return this.indexOf(s) >= 0;
}
Array.prototype.containsAny = function (items) {
    return items.any(function (t) { return this.contains(t); }.bind(this));
}
Array.prototype.any = function (predicate) {
    return this.some(Q.createSelectorFunction(predicate));
}
Array.prototype.distinct = function (keyGen) {
    if (keyGen == null)
        keyGen = Object.getHashKey;
    var list = [];
    var set = {};
    this.forEach(function (t) {
        var key = keyGen(t);
        if (set[key])
            return;
        set[key] = true;
        list.push(t);
    });
    return list;
}


Array.prototype.removeAll = function (predicate) {
    var toRemove = [];
    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i])) {
            toRemove.push(i);
        }
    }
    while (toRemove.length > 0) {
        var index = toRemove.pop();
        this.removeAt(index);
    }
}


Array.prototype.removeAt = function (index) {
    this.splice(index, 1);
}

Q.stringifyFormatted = function (obj) {
    var sb = [];
    sb.indent = "";
    sb.indentSize = "    ";
    sb.startBlock = function (s) {
        this.indent += sb.indentSize;
        this.push(s);
        this.newLine();
    };
    sb.endBlock = function (s) {
        this.indent = this.indent.substr(0, this.indent.length - this.indentSize.length);
        this.newLine();
        this.push(s);
    };
    sb.newLine = function (s) {
        this.push("\n");
        this.push(this.indent);
    };
    Q.stringifyFormatted2(obj, sb);
    return sb.join("");
}
Q.stringifyFormatted2 = function (obj, sb) {
    var type = typeof (obj);
    if (type == "object") {
        if (obj instanceof Array) {
            var list = obj;
            if (list.length == 0 || ["string", "number"].contains(typeof (list[0]))) {
                sb.push("[");
                list.forEach(function (t, i) {
                    Q.stringifyFormatted2(t, sb);
                    if (i < list.length - 1)
                        sb.push(",");
                });
                sb.push("]");
            }
            else {
                sb.startBlock("[");
                for (var i = 0; i < list.length; i++) {
                    Q.stringifyFormatted2(list[i], sb);
                    if (i < list.length - 1) {
                        sb.push(",");
                        sb.newLine();
                    }
                }
                sb.endBlock("]");
            }
        }
        else {
            sb.startBlock("{");
            var first = true;
            for (var p in obj) {
                if (first)
                    first = false;
                else {
                    sb.push(",");
                    sb.newLine();
                }
                sb.push(p + ": ");
                Q.stringifyFormatted2(obj[p], sb);
            }
            sb.endBlock("}");
        }
    }
    else {
        sb.push(JSON.stringify(obj));
    }
}

///<summary>Iterates over the array, performing an async function for each item, going to the next one only when the previous one has finished (called his callback)</summary>
Array.prototype.forEachAsyncProgressive = function (actionWithCallback, finalCallback) {
    this._forEachAsyncProgressive(actionWithCallback, finalCallback, 0);
}

Array.prototype.where = function (predicate) {
    return this.filter(Q.createSelectorFunction(predicate));
}
Array.prototype.addRange = function (items) {
    this.push.apply(this, items);
}

Array.prototype.add = Array.prototype.push;
Array.prototype.diff = function (target) {
    var source = this;
    var res = {
        added: source.where(function (t) { return !target.contains(t); }),
        removed: target.where(function (t) { return !source.contains(t); }),
    };
    return res;
}
Array.prototype.hasDiff = function (target) {
    var diff = this.diff(target);
    return diff.added.length > 0 || diff.removed.length > 0;
}

Array.prototype._forEachAsyncProgressive = function (actionWithCallback, finalCallback, index) {
    if (index == null)
        index = 0;
    if (index >= this.length) {
        if (finalCallback != null)
            finalCallback();
        return;
    }
    var item = this[index];
    actionWithCallback(item, function () { this._forEachAsyncProgressive(actionWithCallback, finalCallback, index + 1); }.bind(this));
}


/// Iterates over the array, performing an async function for each item, going to the next one only when the previous one has finished (called his callback)
Array.prototype.mapAsyncProgressive = function (actionWithCallback, finalCallback) {
    this._mapAsyncProgressive(actionWithCallback, finalCallback, 0, []);
}

Array.prototype._mapAsyncProgressive = function (actionWithCallbackWithResult, finalCallback, index, results) {
    if (index == null)
        index = 0;
    if (index >= this.length) {
        if (finalCallback != null)
            finalCallback(results);
        return;
    }
    var item = this[index];
    actionWithCallbackWithResult(item, function (res) {
        results.push(res);
        this._mapAsyncProgressive(actionWithCallbackWithResult, finalCallback, index + 1, results);
    }.bind(this));
}

Array.prototype.mapWith = function (anotherList, funcForTwoItems) {
    if (funcForTwoItems == null)
        funcForTwoItems = function (x, y) { return [x, y]; };
    var list = [];
    var maxLength = Math.max(this.length, anotherList.length);
    for (var i = 0; i < maxLength; i++)
        list.push(funcForTwoItems(this[i], anotherList[i]));
    return list;
}

Array.prototype.min = function () {
    var min = null;
    for (var i = 0; i < this.length; i++) {
        var value = this[i];
        if (min==null || value < min)
            min = value;
    }
    return min;
}

Array.prototype.max = function () {
    var max = null;
    for (var i = 0; i < this.length; i++) {
        var value = this[i];
        if (max == null || value > max)
            max = value;
    }
    return max;
}

Array.prototype.getEnumerator = function () {
    return new ArrayEnumerator(this);
}

var ArrayEnumerator = function (list) {
    this.index = -1;
    this.list = list;
}

ArrayEnumerator.prototype.moveNext = function () {
    if (this.index == -2)
        throw new Error("End of array");
    this.index++;
    if (this.index >= this.list.length) {
        this.index = -2;
        return false;
    }
    return true;
}
ArrayEnumerator.prototype.getCurrent = function () {
    if (this.index < 0)
        throw new Error("Invalid array position");
    return this.list[this.index];
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var Comparer = function () {

}
Comparer.prototype.compare = function (x, y) {
    if (x > y)
        return 1;
    if (x < y)
        return -1;
    return 0;
}
Comparer.default = new Comparer();

function combineCompareFuncs(compareFuncs) {
    return function (a, b) {
        var count = compareFuncs.length;
        for (var i = 0; i < count; i++) {
            var compare = compareFuncs[i];
            var x = compare(a, b);
            if (x != 0)
                return x;
        }
        return 0;
    };
}

function createCompareFuncFromSelector(selector, desc) {
    desc = desc ? -1 : 1;
    var compare = Comparer.default.compare;
    var type = typeof (selector);
    if (type == "string" || type == "number") {
        return function (x, y) {
            return compare(x[selector], y[selector]) * desc;
        };
    }
    return function (x, y) {
        return compare(selector(x), selector(y)) * desc;
    };
}
Array.prototype.sortBy = function (selector, desc) {
    var compareFunc;
    if (selector instanceof Array) {
        var pairs = selector;
        var funcs = pairs.map(function (pair) {
            if (pair instanceof Array)
                return createSortFuncFromCompareFunc(pair[0], pair[1]);
            return createCompareFuncFromSelector(pair);
        });
        compareFunc = combineCompareFuncs(funcs);
    }
    else {
        compareFunc = createCompareFuncFromSelector(selector, desc);
    }
    this.sort(compareFunc);
    return this;
}

Array.prototype.sortByDescending = function (selector) {
    return this.sortBy(selector, true);
}
String.prototype.startsWith = function (s) {
    return this.indexOf(s) == 0;
}

//Performs an async function on each item in the array, invoking a finalCallback when all are completed
//asyncFunc -> function(item, callback -> function(result))
//finalCallback -> function(results);
Array.prototype.mapAsyncParallel = function (asyncFunc, finalCallback) {
    var results = [];
    var length = this.length;
    if (length == 0) {
        finalCallback(results);
        return;
    }
    var cb = function (res) {
        results.push(res);
        if (results.length == length)
            finalCallback(results);
    };
    for (var i = 0; i < length; i++) {
        var item = this[i];
        asyncFunc(item, cb);
    }
}


Array.prototype.clear = function () {
    this.splice(0, this.length);
}


var Timer = function (action, ms) {
    this.action = action;
    if(ms!=null)
        this.set(ms);
}

Timer.prototype.set = function (ms) {
    if(ms==null)
        ms = this._ms;
    else
        this._ms = ms;
    this.clear();
    if(ms==null)
        return;
    this.timeout = window.setTimeout(this.onTick.bind(this), ms);
}

Timer.prototype.onTick = function () {
    this.clear();
    this.action();
}

Timer.prototype.clear = function (ms) {
    if (this.timeout == null)
        return;
    window.clearTimeout(this.timeout);
    this.timeout = null;
}

Array.prototype.itemsEqual = function (list) {
    if (list == this)
        return true;
    if (list.length != this.length)
        return false;
    for (var i = 0; i < this.length; i++)
        if (this[i] != list[i])
            return false;
    return true;

}

Number.prototype.format = function (format) {
    var s = this.toString();
    for (var i = 0; i < format.length; i++) {
        var ch = format.charAt(i);
        if (ch == "0") {
            if (s.length < i + 1)
                s = "0" + s;
        }
        else
            throw new Error("not implemented");
    }
    return s;
}


/**
 * ReplaceAll by Fagner Brack (MIT Licensed)
 * Replaces all occurrences of a substring in a string
 */
String.prototype.replaceAll = function (token, newToken, ignoreCase) {
    var _token;
    var str = this + "";
    var i = -1;

    if (typeof token === "string") {

        if (ignoreCase) {

            _token = token.toLowerCase();

            while ((
                i = str.toLowerCase().indexOf(
                    token, i >= 0 ? i + newToken.length : 0
                )) !== -1
            ) {
                str = str.substring(0, i) +
                    newToken +
                    str.substring(i + token.length);
            }

        } else {
            return this.split(token).join(newToken);
        }

    }
    return str;
};







/* Date extensions, taken from jsclr framework */
Date.new = function (y, m, d, h, mm, s, ms) {
    if (ms != null)
        return new Date(y, m - 1, d, h, mm, s, ms);
    if (s != null)
        return new Date(y, m - 1, d, h, mm, s);
    if (mm != null)
        return new Date(y, m - 1, d, h, mm);
    if (h != null)
        return new Date(y, m - 1, d, h);
    if (d != null)
        return new Date(y, m - 1, d);
    if (m != null)
        return new Date(y, m - 1);
    if (y != null)
        return new Date(y);
    var x = new Date(0);
    x.setHours(0, 0, 0, 0);
    return x;
}
Date.prototype.compareTo = function (value) {
    return this.valueOf() - value.valueOf();
};
Date.prototype.year = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCFullYear();
        return this.getFullYear();
    }
    if (this._Kind == 1)
        this.setUTCFullYear(value);
    else
        this.setFullYear(value);
    return this;
};
Date.prototype.totalDays = function () {
    return this.valueOf() / (24 * 60 * 60 * 1000);
};
Date.prototype.totalHours = function () {
    return this.valueOf() / (60 * 60 * 1000);
};

Date.prototype.month = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCMonth() + 1;
        return this.getMonth() + 1;
    }
    if (this._Kind == 1)
        this.setUTCMonth(value - 1);
    else
        this.setMonth(value - 1);
    return this;
};
Date.prototype.day = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCDate();
        return this.getDate();
    }
    if (this._Kind == 1)
        this.setUTCDate(value);
    else
        this.setDate(value);
    return this;
};
Date.prototype.hour = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCHours();
        return this.getHours();
    }
    if (this._Kind == 1)
        this.setUTCHours(value);
    else
        this.setHours(value);
    return this;
};
Date.prototype.minute = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCMinutes();
        return this.getMinutes();
    }
    if (this._Kind == 1)
        this.setUTCMinutes(value);
    else
        this.setMinutes(value);
    return this;
};
Date.prototype.second = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCSeconds();
        return this.getSeconds();
    }
    if (this._Kind == 1)
        this.setUTCSeconds(value);
    else
        this.setSeconds(value);
    return this;
};
Date.prototype.ms = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCMilliseconds();
        return this.getMilliseconds();
    }
    if (this._Kind == 1)
        this.setUTCMilliseconds(value);
    else
        this.setMilliseconds(value);
    return this;
};
Date.prototype.toUnix = function () {
    if (this._Kind == 1)
        throw new Error();
    return Math.round(this.getTime() / 1000);
};
Date.fromUnix = function (value) {
    return new Date(value * 1000);
};

Date.prototype.dayOfWeek = function () {
    return this.getDay()+1;
};
Date.prototype.toLocalTime = function () {
    if (this._Kind != 1)
        return this;
    var x = this.clone();
    x._Kind = 2;
    return x;
};
Date.prototype.toUniversalTime = function () {
    if (this._Kind == 1)
        return this;
    var x = this.clone();
    x._Kind = 1;
    return x;
};
Date.today = function () {
    return new Date().removeTime();
};
//Date.now = function () {
//    return new Date();
//};
Date.prototype.subtract = function (date) {
    var diff = this.valueOf() - date.valueOf();
    return new Date(diff);
};
Date.prototype.Subtract$$DateTime = function (value) {
    var diff = this.valueOf() - value.valueOf();
    return new System.TimeSpan.ctor$$Int64(diff * 10000);
};
Date.prototype.Subtract$$TimeSpan = function (value) {
    var newDate = this.clone();
    newDate.setMilliseconds(this.getMilliseconds() + value.getTotalMilliseconds());
    return newDate;
};
Date.prototype.format = function (format) {
    if (typeof (format) == "object") {
        var options = format;
        if (options.noTime!=null && !this.hasTime())
            return this.format(options.noTime);
        else if (options.noDate!=null && !this.hasDate())
            return this.format(options.noDate);
        else if (options.fallback!=null)
            return this.format(options.fallback);
        return this.toString();
    }
    var s = format;
    s = s.replaceAll("yyyy", this.year().format("0000"));
    s = s.replaceAll("yy", this.year().format("00").truncateStart(2));
    s = s.replaceAll("y", this.year().toString());
    s = s.replaceAll("MM", this.month().format("00"));
    s = s.replaceAll("M", this.month().toString());
    s = s.replaceAll("dd", this.day().format("00"));
    s = s.replaceAll("d", this.day().toString());
    s = s.replaceAll("HH", this.hour().format("00"));
    s = s.replaceAll("H", this.hour().toString());
    s = s.replaceAll("mm", this.minute().format("00"));
    s = s.replaceAll("m", this.minute().toString());
    s = s.replaceAll("ss", this.second().format("00"));
    s = s.replaceAll("s", this.second().toString());
    return s.toString();
};
String.prototype.truncateEnd = function (finalLength) {
    if (this.length > finalLength)
        return this.substr(0, finalLength);
    return this;
}
String.prototype.truncateStart = function (finalLength) {
    if (this.length > finalLength)
        return this.substr(this.length-finalLength);
    return this;
}
String.prototype.remove = function (index, length) {
    var s = this.substr(0, index);
    s += this.substr(index + length);
    return s;
}
String.prototype.insert = function (index, text) {
    var s = this.substr(0, index);
    s += text;
    s += this.substr(index);
    return s;
}
String.prototype.replaceAt = function (index, length, text) {
    return this.remove(index, length).insert(index, text);
}
String.prototype.padRight = function (totalWidth, paddingChar) {
    if (paddingChar == null || paddingChar == "")
        paddingChar = " ";
    var s = this;
    while (s.length < totalWidth)
        s += paddingChar;
    return s;
}
String.prototype.padLeft = function (totalWidth, paddingChar) {
    if (paddingChar == null || paddingChar == "")
        paddingChar = " ";
    var s = this;
    while (s.length < totalWidth)
        s = paddingChar + s;
    return s;
}

Date._parsePart = function (ctx, part, setter) {
    if (ctx.failed)
        return;
    var index = ctx.format.indexOf(part);
    if (index < 0)
        return;
    var token = ctx.s.substr(index, part.length);
    if (token.length == 0) {
        ctx.failed = true;
        return;
    }
    var value = Q.parseInt(token);
    if (value == null) {
        ctx.failed = true;
        return;
    }
    setter.call(ctx.date, value);
    ctx.format = ctx.format.replaceAt(index, part.length, "".padRight(part.length));
    ctx.s = ctx.s.replaceAt(index, part.length, "".padRight(part.length));
}
Date.tryParseExact = function (s, formats) {
    if (typeof (formats) == "string")
        formats = [formats];
    for (var i = 0; i < formats.length; i++) {
        var x = Date._tryParseExact(s, formats[i]);
        if (x != null)
            return x;
    }
    return null;
};
Date._tryParseExact = function (s, format) {
    if (s.length != format.length)
        return null;
    var date = Date.new();
    var ctx = { date: date, s: s, format: format };
    Date._parsePart(ctx, "yyyy", date.year);
    Date._parsePart(ctx, "yy", date.year);
    Date._parsePart(ctx, "MM", date.month);
    Date._parsePart(ctx, "dd", date.day);
    Date._parsePart(ctx, "HH", date.hour);
    Date._parsePart(ctx, "mm", date.minute);
    Date._parsePart(ctx, "ss", date.second);
    if (ctx.failed)
        return null;
    if (ctx.s != ctx.format)
        return null;
    return ctx.date;
};
Date.prototype.clone = function () {
    var x = new Date(this.valueOf());
    x._Kind = this._Kind;
    return x;
};
Date.prototype.addMs = function (miliseconds) {
    var date2 = this.clone();
    date2.setMilliseconds(date2.getMilliseconds() + miliseconds);
    return date2;
};
Date.prototype.addSeconds = function (seconds) {
    var date2 = this.clone();
    date2.setSeconds(date2.getSeconds() + seconds);
    return date2;
};
Date.prototype.addMinutes = function (minutes) {
    var date2 = this.clone();
    date2.setMinutes(date2.getMinutes() + minutes);
    return date2;
};
Date.prototype.addHours = function (hours) {
    var date2 = this.clone();
    date2.setHours(date2.getHours() + hours);
    return date2;
};
Date.prototype.addDays = function (days) {
    var date2 = this.clone();
    date2.setDate(date2.getDate() + days);
    return date2;
};
Date.prototype.addMonths = function (months) {
    var date2 = this.clone();
    date2.setMonth(date2.getMonth() + months);
    return date2;
};
Date.prototype.addYears = function (years) {
    var date2 = this.clone();
    date2.setMonth(date2.getFullYear() + years);
    return date2;
};
Date.prototype.removeTime = function () {
    var date2 = this.clone();
    date2.setHours(0, 0, 0, 0);
    return date2;
};
Date.prototype.hasTime = function () {
    return this.hour() != 0 && this.second() != 0 && this.ms() != 0;
};
Date.prototype.hasDate = function () {
    var date2 = new Date(0);
    return this.year() != date2.year() && this.month() != date2.month() && this.day() != date2.day();
};
Date.prototype.removeDate = function () {
    var time = this.clone();
    time.setHours(this.hour(), this.minute(), this.second(), this.ms());
    return time;
};
Date.prototype.extractTime = function () {
    return this.removeDate();
};
Date.prototype.extractDate = function () {
    return this.removeTime();
};
Date.prototype.equals = function (obj) {
    if (obj == null)
        return false;
    return obj.valueOf() == this.valueOf();
};
Date.prototype.GetHashCode = function () {
    return this.valueOf();
};
Date.prototype.getKind = function () {
    if (this._Kind == null)
        return 2;
    return this._Kind;
};



/* Binds all function on an object to the object, so the 'this' context will be reserved even if referencing the function alone */
Q.bindFunctions = function (obj) {
    for (var p in obj) {
        var func = obj[p];
        if (typeof (func) != "function")
            continue;
        if (func.boundTo == obj)
            continue;
        func = func.bind(obj);
        func.boundTo = obj;
        if (func.name == null)
            func.name = p;
        obj[p] = func;
    }
}

// Similar to func.apply(thisContext, args), but creates a new object instead of just calling the function - new func(args[0], args[1], args[2]...)
Function.prototype.applyNew = function (args) {
    var args2 = args.toArray();
    args2.insert(0, null);
    var ctor2 = this.bind.apply(this, args2);
    var obj = new ctor2();
    return obj;
}
// Similar to func.call(thisContext, args), but creates a new object instead of just calling the function - new func(arguments[0], arguments[1], arguments[2]...)
Function.prototype.callNew = function (varargs) {
    var args2 = Array.prototype.slice.call(arguments);
    args2.insert(0, null);
    var ctor2 = this.bind.apply(this, args2);
    var obj = new ctor2();
    return obj;
}

Error.prototype.wrap = function (e) {
    e.innerError = this;
    return e;
}

Error.prototype.causedBy = function (e) {
    this.innerError = e;
}

Q.parseInt = function(s){
    var intRegex = /^[+-]?[0-9]+$/;
    if (!intRegex.test(s))
        return null;
    var x = parseInt(s);
    if (isNaN(x))
        return null;
    return x;
}

Q.parseFloat = function (s) {
    var floatRegex = /^[+-]?[0-9]*[\.]?[0-9]*$/;
    if (!floatRegex.test(s))
        return null;
    var x = parseFloat(s);
    if (isNaN(x))
        return null;
    return x;
}

Number.prototype.round = function (decimals) {
    if (decimals) {
        var x = Math.pow(10, decimals);
        return Math.round(this * x) / x;
    }
    return Math.round(this);
}
Q.createSelectorFunction = function(selector){
    if (selector == null)
        return function (t) { return t; };
    if (typeof (selector) == "function")
        return selector;
    return function (t) { return t[selector]; };
}
Array.prototype.select = function (selector) {
    var func = Q.createSelectorFunction(selector);
    return this.map(func);
}

Array.prototype.selectInvoke = function (name) {
    return this.map(function (t) { return t[name](); });
}

Array.prototype.joinWith = function (list2, keySelector1, keySelector2, resultSelector) {
    keySelector1 = Q.createSelectorFunction(keySelector1);
    keySelector2 = Q.createSelectorFunction(keySelector2);
    resultSelector = Q.createSelectorFunction(resultSelector);

    var list1 = this;

    var groups1 = list1.groupByToObject(keySelector1);
    var groups2 = list2.groupByToObject(keySelector2);

    var list = [];
    var group = {};
    for (var p in groups1) {
        if(groups2[p]!=null)
            list.push(resultSelector(groups1[p], groups2[p]));
    }

    return list;
}
Array.prototype.all = function (predicate) {
    return this.every(Q.createSelectorFunction(predicate));
}

String.prototype.all = Array.prototype.all;
String.prototype.every = Array.prototype.every;
Array.prototype.flatten = function () {
    var list = [];
    this.forEach(function (t) {
        list.addRange(t);
    });
    return list;
}

Array.joinAll = function (lists, keySelector, resultSelector) {
    keySelector = Q.createSelectorFunction(keySelector);
    resultSelector = Q.createSelectorFunction(resultSelector);

    var groupMaps = lists.map(function (list) {
        return list.groupByToObject(keySelector);
    });

    var groupMap1 = groupMaps[0];

    var list = [];
    for (var p in groupMap1) {
        if (groupMaps.all(p))
            list.push(resultSelector(groupMaps.select(p)));
    }

    return list;
}

Q.isNullOrEmpty = function (stringOrArray) {
    return stringOrArray == null || stringOrArray.length == 0;
}
Q.isNotNullOrEmpty = function (stringOrArray) {
    return stringOrArray != null && stringOrArray.length > 0;
}



Array.prototype.selectToObject = function (keySelector, valueSelector) {
    var obj = {};
    if (valueSelector == null) {
        var list = this.select(keySelector);
        for (var i = 0; i < list.length; i++) {
            var obj2 = this[i];
            if (obj2 != null) {
                if (obj2 instanceof Array) {
                    for (var i = 0; i < obj2.length; i++) {
                        obj[obj2[0]] = obj2[1];
                    }
                }
                else {
                    Q.copy(obj2, obj, { overwrite: true });
                }
            }
        }
    }
    else {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            obj[keySelector(item)] = valueSelector(item);
        }
    }
    return obj;
}
Array.prototype.groupByToObject = function (keySelector, itemSelector) {
    keySelector = Q.createSelectorFunction(keySelector);
    itemSelector = Q.createSelectorFunction(itemSelector);
    var obj = {};
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var key = keySelector(item);
        if (obj[key] == null) {
            obj[key] = [];
            obj[key].key = key;
        }
        var value = itemSelector(item);
        obj[key].push(value);
    }
    return obj;
}
Array.prototype.groupBy = function (keySelector, itemSelector) {
    var groupsMap = this.groupByToObject(keySelector, itemSelector);
    return Object.values(groupsMap);
}

Array.prototype.splitIntoChunksOf = function (countInEachChunk) {
    var chunks = Math.ceil(this.length / countInEachChunk);
    var list = [];
    for(var i=0;i<this.length;i+=countInEachChunk){
        list.push(this.slice(i, i+countInEachChunk));
    }
    return list;
}

Array.prototype.avg = function () {
    return this.sum() / this.length;
}
Array.prototype.selectMany = function (selector) {
    var list = [];
    this.select(selector).forEach(function (t) { t.forEach(function (x) { list.push(x); }); });
    return list;
}
Array.prototype.sum = function () {
    var sum = this[0];
    for (var i = 1; i < this.length; i++)
        sum += this[i];
    return sum;
}
Array.prototype.skip = function (count) {
    return this.slice(count);
}
Array.prototype.take = function (count) {
    return this.slice(0, count);
}

Date.tryParseJsonDate = function (s) {
    if (s.length == 26 && s[0] == "\"" && s[value.length - 1] == "\"") {
        s = s.substr(1, 24);
    }
    if (s.length == 24 && /[0-9]+-[0-9]+-[0-9]+T[0-9]+:[0-9]+:[0-9]+\.[0-9]+Z/.test(s)) {
        var d = new Date(s);
        if (!isNaN(d.valueOf()))
            return d;
    }
    return null;

}


var QueryString = function () {

}

QueryString.parse = function (url, obj, defaults) {
    if(url==null)
        url = window.location.href;
    if (obj == null)
        obj = {};
    if (defaults == null)
        defaults = {};
    var index = url.indexOf("?");
    if (index < 0)
        return obj;
    var parts = url.slice(url.indexOf('?') + 1).split('&');
    $.map(parts, function (part) {
        var keyval = part.split('=');
        var key = keyval[0];
        var eValue = keyval[1];
        var value;
        var currentValue = obj[key];
        if (currentValue == null || currentValue == defaults[key]) {
            value = decodeURIComponent(eValue);
            obj[key] = value;
        }
        else if (currentValue instanceof Array || defaults[key] instanceof Array) {
            if (currentValue == null) {
                currentValue = [];
                obj[key] = currentValue;
            }
            if (eValue != "") {
                var items = eValue.split(",").select(function (item) { return decodeURIComponent(item); });
                items.forEach(function (item) {
                    if (!currentValue.contains(item))
                        currentValue.add(item);
                });
            }
        }
        else if (currentValue != null) {
            value = decodeURIComponent(eValue);
            obj[key] = value;
            //value = decodeURIComponent(eValue);
            //obj[key] = [currentValue, value];
        }
    });
    return obj;
}

QueryString.stringify = function (obj) {
    var sb = [];
    QueryString.write(obj, sb);
    return sb.join("&");
}

QueryString.write = function (obj, sb) {
    for (var p in obj) {
        var value = obj[p];
        if (value instanceof Array) {
            sb.push(p + "=" + value.select(function (item) { return encodeURIComponent(item); }).join(","));
        }
        else {
            sb.push(p + "=" + encodeURIComponent(value));
        }
    }
}

var __hashKeyIndex = 0;
Object.getHashKey = function (obj) {
    if (obj == null)
        return null;
    var x = obj.valueOf();
    var type = typeof (x);
    if (type == "number")
        return x.toString();
    if (type == "string")
        return x;
    if (x.__hashKey == null) {
        x.__hashKey = "\0" + "_"+x.constructor.name+"_"+__hashKeyIndex++;
    }
    return x.__hashKey
}
var ValueOfEqualityComparer = function () {

}

ValueOfEqualityComparer.prototype.equals = function (x, y) {
    if (x == y)
        return true;
    if (x == null || y == null)
        return false;
    return x.valueOf() == y.valueOf();
}

ValueOfEqualityComparer.prototype.getHashKey = function (x) {
    return Object.getHashKey(x);
}

Number.prototype.isInt = function () {
    return this | 0 === this;
}
Number.prototype.isFloat = function () {
    return this | 0 !== this;
}
Number.generate = function (min, max, step) {
    var list = [];
    if(step==null)
        step = 1;
    for (var i = min; i <= max; i += step) {
        list.push(i);
    }
    return list;
}

Object.jsonStringifyEquals = function (x, y) {
    return JSON.stringify(x) == JSON.stringify(y);
}

Object.tryGet = function (obj, indexers) {
    if (typeof (indexers) == "string")
        indexers = indexers.split(".");
    var value = obj;
    for (var i = 0; i < indexers.length; i++) {
        if (value == null)
            return null;
        value = value[indexers[i]];
    }
    return value;
}

JSON.iterateRecursively = function (obj, action) {
    if (obj == null || typeof(obj)!="object" || obj instanceof Date)
        return;

    if (obj instanceof Array) {
        var list = obj;
        list.forEach(function (item, index) {
            action(obj, index, item);
            JSON.iterateRecursively(item, action);
        });
    }
    else {
        Object.keys(obj).forEach(function (key) {
            var value = obj[key];
            action(obj, key, value);
            JSON.iterateRecursively(value, action);
        });
    }
}

Function._lambda_cache = {};
Function.lambda = function (exp) {
    var cache = Function._lambda_cache;
    var func = cache[exp];
    if (func == null) {
        func = Function._lambda(exp);
        cache[exp] = func;
    }
    return func;
}
Function._lambda = function (exp) {
    var arrow = exp.indexOf("=>");
    var prms;
    var body;
    if (arrow > 0) {
        var tPrms = exp.substring(0, arrow).replace("(", "").replace(")", "");
        prms = tPrms.split(",").map(function (t) { return t.trim(); });
        body = exp.substring(arrow + 2);
    }
    else {
        prms = [];
        body = exp;
    }
    if (!body.contains("return"))
        body = "return " + body+";";
    prms.push(body);
    return Function.applyNew(prms);
}
String.prototype.toLambda = function () {
    return Function.lambda(this);
}
Array.generateNumbers = function (from, until) {
    if (arguments.length == 1) {
        until = from;
        from = 0;
    }
    var length = until - from;
    var list = new Array(length);
    for (var i = 0; i < length; i++) {
        list[i] = i + from;
    }
    return list;
}

Array.prototype.removeNulls = function () {
    return this.removeAll(function (t) { return t != null; });
}

Array.prototype.exceptNulls = function () {
    return this.where(function (t) { return t != null; });
}

Number.prototype.inRangeInclusive = function (min, max) {
    return this >= min && this <= max;
}
Array.generate = function (length, generator) {
    var list = new Array(length);
    for (var i = 0; i < length; i++) {
        list[i] = generator(i);
    }
    return list;
}
Math.randomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
Array.prototype.random = function(){
    return this[Math.randomInt(0, this.length-1)];
}

String.prototype.substringBetween = function(start, end){
    var s = this;
    var i1 = s.indexOf(start);
    if(i1<0)
        return null;
    var i2 = s.indexOf(end, i1+1);
    if(i2<0)
        return null;
    return s.substring(i1+start.length, i2);
}

