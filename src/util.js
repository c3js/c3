// PathData object is based upon `Source`, here https://github.com/jarek-foksa/path-data-polyfill.js/blob/master/path-data-polyfill.js
var PathData = function(string) {
    this._string = string;
    this._currentIndex = 0;
    this._endIndex = this._string.length;
    this._prevCommand = null;
    this._skipOptionalSpaces();
};

PathData.prototype = {
    commandsMap: {
        "Z":"Z", "M":"M", "L":"L", "C":"C", "Q":"Q", "A":"A", "H":"H", "V":"V", "S":"S", "T":"T",
        "z":"Z", "m":"m", "l":"l", "c":"c", "q":"q", "a":"a", "h":"h", "v":"v", "s":"s", "t":"t"
    },

    parseSegment: function() {
        var char = this._string[this._currentIndex];
        var command = this.commandsMap[char] ? this.commandsMap[char] : null;

        if (command === null) {
            // Possibly an implicit command. Not allowed if this is the first command.
            if (this._prevCommand === null) {
                return null;
            }

            // Check for remaining coordinates in the current command.
            if (
                (char === "+" || char === "-" || char === "." || (char >= "0" && char <= "9")) && this._prevCommand !== "Z"
            ) {
                if (this._prevCommand === "M") {
                    command = "L";
                }
                else if (this._prevCommand === "m") {
                    command = "l";
                }
                else {
                    command = this._prevCommand;
                }
            }
            else {
                command = null;
            }

            if (command === null) {
                return null;
            }
        }
        else {
            this._currentIndex += 1;
        }

        this._prevCommand = command;

        var values = null;
        var cmd = command.toUpperCase();

        if (cmd === "H" || cmd === "V") {
            values = [this._parseNumber()];
        }
        else if (cmd === "M" || cmd === "L" || cmd === "T") {
            values = [this._parseNumber(), this._parseNumber()];
        }
        else if (cmd === "S" || cmd === "Q") {
            values = [this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber()];
        }
        else if (cmd === "C") {
            values = [
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber()
            ];
        }
        else if (cmd === "A") {
            values = [
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseArcFlag(),
                this._parseArcFlag(),
                this._parseNumber(),
                this._parseNumber()
            ];
        }
        else if (cmd === "Z") {
            this._skipOptionalSpaces();
            values = [];
        }

        if (values === null || values.indexOf(null) >= 0) {
            // Unknown command or known command with invalid values
            return null;
        }
        else {
            return {type: command, values: values};
        }
    },

    hasMoreData: function() {
        return this._currentIndex < this._endIndex;
    },

    peekSegmentType: function() {
        var char = this._string[this._currentIndex];
        return this.commandsMap[char] ? this.commandsMap[char] : null;
    },

    initialCommandIsMoveTo: function() {
        // If the path is empty it is still valid, so return true.
        if (!this.hasMoreData()) {
            return true;
        }

        var command = this.peekSegmentType();
        // Path must start with moveTo.
        return command === "M" || command === "m";
    },

    _isCurrentSpace: function() {
        var char = this._string[this._currentIndex];
        return char <= " " && (char === " " || char === "\n" || char === "\t" || char === "\r" || char === "\f");
    },

    _skipOptionalSpaces: function() {
        while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
            this._currentIndex += 1;
        }

        return this._currentIndex < this._endIndex;
    },

    _skipOptionalSpacesOrDelimiter: function() {
        if (
            this._currentIndex < this._endIndex &&
            !this._isCurrentSpace() &&
            this._string[this._currentIndex] !== ","
        ) {
            return false;
        }

        if (this._skipOptionalSpaces()) {
            if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ",") {
                this._currentIndex += 1;
                this._skipOptionalSpaces();
            }
        }
        return this._currentIndex < this._endIndex;
    },

    // Parse a number from an SVG path. This very closely follows genericParseNumber(...) from
    // Source/core/svg/SVGParserUtilities.cpp.
    // Spec: http://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF
    _parseNumber: function() {
        var exponent = 0;
        var integer = 0;
        var frac = 1;
        var decimal = 0;
        var sign = 1;
        var expsign = 1;
        var startIndex = this._currentIndex;

        this._skipOptionalSpaces();

        // Read the sign.
        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "+") {
            this._currentIndex += 1;
        }
        else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "-") {
            this._currentIndex += 1;
            sign = -1;
        }

        if (
            this._currentIndex === this._endIndex ||
            (
                (this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") &&
                this._string[this._currentIndex] !== "."
            )
        ) {
            // The first character of a number must be one of [0-9+-.].
            return null;
        }

        // Read the integer part, build right-to-left.
        var startIntPartIndex = this._currentIndex;

        while (
        this._currentIndex < this._endIndex &&
        this._string[this._currentIndex] >= "0" &&
        this._string[this._currentIndex] <= "9"
            ) {
            this._currentIndex += 1; // Advance to first non-digit.
        }

        if (this._currentIndex !== startIntPartIndex) {
            var scanIntPartIndex = this._currentIndex - 1;
            var multiplier = 1;

            while (scanIntPartIndex >= startIntPartIndex) {
                integer += multiplier * (this._string[scanIntPartIndex] - "0");
                scanIntPartIndex -= 1;
                multiplier *= 10;
            }
        }

        // Read the decimals.
        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ".") {
            this._currentIndex += 1;

            // There must be a least one digit following the .
            if (
                this._currentIndex >= this._endIndex ||
                this._string[this._currentIndex] < "0" ||
                this._string[this._currentIndex] > "9"
            ) {
                return null;
            }

            while (
            this._currentIndex < this._endIndex &&
            this._string[this._currentIndex] >= "0" &&
            this._string[this._currentIndex] <= "9"
                ) {
                decimal += (this._string[this._currentIndex] - "0") * (frac *= 0.1);
                this._currentIndex += 1;
            }
        }

        // Read the exponent part.
        if (
            this._currentIndex !== startIndex &&
            this._currentIndex + 1 < this._endIndex &&
            (this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") &&
            (this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m")
        ) {
            this._currentIndex += 1;

            // Read the sign of the exponent.
            if (this._string[this._currentIndex] === "+") {
                this._currentIndex += 1;
            }
            else if (this._string[this._currentIndex] === "-") {
                this._currentIndex += 1;
                expsign = -1;
            }

            // There must be an exponent.
            if (
                this._currentIndex >= this._endIndex ||
                this._string[this._currentIndex] < "0" ||
                this._string[this._currentIndex] > "9"
            ) {
                return null;
            }

            while (
            this._currentIndex < this._endIndex &&
            this._string[this._currentIndex] >= "0" &&
            this._string[this._currentIndex] <= "9"
                ) {
                exponent *= 10;
                exponent += (this._string[this._currentIndex] - "0");
                this._currentIndex += 1;
            }
        }

        var number = integer + decimal;
        number *= sign;

        if (exponent) {
            number *= Math.pow(10, expsign * exponent);
        }

        if (startIndex === this._currentIndex) {
            return null;
        }

        this._skipOptionalSpacesOrDelimiter();

        return number;
    },

    _parseArcFlag: function() {
        if (this._currentIndex >= this._endIndex) {
            return null;
        }

        var flag = false;
        var flagChar = this._string[this._currentIndex];

        this._currentIndex += 1;

        if (flagChar === "0") {
            flag = false;
        }
        else if (flagChar === "1") {
            flag = true;
        }
        else {
            return null;
        }

        this._skipOptionalSpacesOrDelimiter();
        return flag;
    }
};

var isValue = c3_chart_internal_fn.isValue = function (v) {
    return v || v === 0;
},
    isFunction = c3_chart_internal_fn.isFunction = function (o) {
        return typeof o === 'function';
    },
    isString = c3_chart_internal_fn.isString = function (o) {
        return typeof o === 'string';
    },
    isUndefined = c3_chart_internal_fn.isUndefined = function (v) {
        return typeof v === 'undefined';
    },
    isDefined = c3_chart_internal_fn.isDefined = function (v) {
        return typeof v !== 'undefined';
    },
    ceil10 = c3_chart_internal_fn.ceil10 = function (v) {
        return Math.ceil(v / 10) * 10;
    },
    asHalfPixel = c3_chart_internal_fn.asHalfPixel = function (n) {
        return Math.ceil(n) + 0.5;
    },
    diffDomain = c3_chart_internal_fn.diffDomain = function (d) {
        return d[1] - d[0];
    },
    isEmpty = c3_chart_internal_fn.isEmpty = function (o) {
        return typeof o === 'undefined' || o === null || (isString(o) && o.length === 0) || (typeof o === 'object' && Object.keys(o).length === 0);
    },
    notEmpty = c3_chart_internal_fn.notEmpty = function (o) {
        return !c3_chart_internal_fn.isEmpty(o);
    },
    getOption = c3_chart_internal_fn.getOption = function (options, key, defaultValue) {
        return isDefined(options[key]) ? options[key] : defaultValue;
    },
    hasValue = c3_chart_internal_fn.hasValue = function (dict, value) {
        var found = false;
        Object.keys(dict).forEach(function (key) {
            if (dict[key] === value) { found = true; }
        });
        return found;
    },
    getPathBox = c3_chart_internal_fn.getPathBox = function (path) {
        var box = path.getBoundingClientRect(),
            pathData = new PathData(path.getAttribute('d')),
            seg0 = pathData.parseSegment(),
            seg1 = pathData.parseSegment(),
            minX = Math.min(seg0.values[0], seg1.values[0]),
            minY = Math.min(seg0.values[1], seg1.values[1]);
        return {
            x: minX,
            y: minY,
            width: box.width,
            height: box.height
        };
    };
