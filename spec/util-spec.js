import {
    asHalfPixel,
    ceil10,
    diffDomain,
    getOption,
    hasValue,
    isArray,
    isDefined,
    isEmpty,
    isFunction,
    isString,
    isUndefined,
    isValue,
    notEmpty,
    sanitise
} from '../src/util';

describe('util.js tests', function () {
    'use strict';

    var undefined_var;
    var html_str = '<div>Hello there</div>';
    var html_entities_str = '&lt;div&gt;Hello there&lt;/div&gt;';
    var empty_string = '';
    var nonempty_string = 'hello there';
    var nonempty_number = 1234.2;
    var null_var = null;
    var empty_object = {};
    var nonempty_object = {
        a: 1
    };
    var empty_array = [];
    var nonempty_array = [1, 3];
    var nonempty_function = function (a) {
        return a;
    };

    describe('asHalfPixel, ceil10 and diffDomain functions', function () {

        it('asHalfPixel should return correct value', function () {
            expect(asHalfPixel(nonempty_number)).toBe(1235.5);
        });
        it('ceil10 should return correct value', function () {
            expect(ceil10(nonempty_number)).toBe(1240);
        });
        it('diffDomain should return correct value', function () {
            expect(diffDomain(nonempty_array)).toBe(2);
        });

    });

    describe('getOption and hasValue functions', function () {

        it('getOption should return value if options dict has specified key', function () {
            expect(getOption(nonempty_object, 'a', 'b')).toBe(1);
        });
        it('getOption should return default value if options dict lacks specified key', function () {
            expect(getOption(empty_object, 'a', 'b')).toBe('b');
        });

        it('hasValue should return true if dict has requested value', function () {
            expect(hasValue(nonempty_object, 1)).toBe(true);
        });
        it('hasValue should return false if dict lacks requested value', function () {
            expect(hasValue(nonempty_object, 2)).toBe(false);
        });

    });

    describe('sanitise function', function () {

        it('should replace < and > tags', function () {
            expect(sanitise(html_str)).toBe(html_entities_str);
        });

        it('should not modify a string not containing  < and > tags', function () {
            expect(sanitise(html_entities_str)).toBe(html_entities_str);
        });

        it('should not modify an imput whose type is not string', function () {
            expect(sanitise(nonempty_number)).toBe(nonempty_number);
        });
    });

    describe('isArray, isDefined, isEmpty, isFunction, isString, isUndefined, isValue and notEmpty functions', function () {

        it('isArray should return true for array var', function () {
            expect(isArray(nonempty_array)).toBe(true);
        });
        it('isDefined should return true for defined var', function () {
            expect(isDefined(nonempty_string)).toBe(true);
        });
        it('isFunction should return true for function var', function () {
            expect(isFunction(nonempty_function)).toBe(true);
        });
        it('isString should return true for string var', function () {
            expect(isString(nonempty_string)).toBe(true);
        });
        it('isUndefined should return true for undefined var', function () {
            expect(isUndefined(undefined_var)).toBe(true);
        });
        it('isValue should return true for value var', function () {
            expect(isValue(nonempty_number)).toBe(1234.2);
        });

        it('isArray should return false for non array var', function () {
            expect(isArray(nonempty_string)).toBe(false);
        });
        it('isDefined should return false for non defined var', function () {
            expect(isDefined(undefined_var)).toBe(false);
        });
        it('isFunction should return false for non function var', function () {
            expect(isFunction(nonempty_string)).toBe(false);
        });
        it('isString should return false for non string var', function () {
            expect(isString(undefined_var)).toBe(false);
        });
        it('isUndefined should return false for non undefined var', function () {
            expect(isUndefined(nonempty_string)).toBe(false);
        });
        it('isValue should return false for null var', function () {
            expect(isValue(null_var)).toBe(false);
        });

        it('isEmpty should return false for nonempty_array', function () {
            expect(isEmpty(nonempty_array)).toBe(false);
        });
        it('isEmpty should return false for nonempty_number', function () {
            expect(isEmpty(nonempty_number)).toBe(false);
        });
        it('isEmpty should return false for nonempty_object', function () {
            expect(isEmpty(nonempty_object)).toBe(false);
        });
        it('isEmpty should return false for nonempty_string', function () {
            expect(isEmpty(nonempty_string)).toBe(false);
        });

        it('isEmpty should return true for empty_array', function () {
            expect(isEmpty(empty_array)).toBe(true);
        });
        it('isEmpty should return true for empty_object', function () {
            expect(isEmpty(empty_object)).toBe(true);
        });
        it('isEmpty should return true for empty_string', function () {
            expect(isEmpty(empty_string)).toBe(true);
        });
        it('isEmpty should return true for null_var', function () {
            expect(isEmpty(null_var)).toBe(true);
        });
        it('isEmpty should return true for undefined_var', function () {
            expect(isEmpty(undefined_var)).toBe(true);
        });

        it('notEmpty should return false for empty_array', function () {
            expect(notEmpty(empty_array)).toBe(false);
        });
        it('notEmpty should return false for empty_object', function () {
            expect(notEmpty(empty_object)).toBe(false);
        });
        it('notEmpty should return false for empty_string', function () {
            expect(notEmpty(empty_string)).toBe(false);
        });
        it('notEmpty should return false for null_var', function () {
            expect(notEmpty(null_var)).toBe(false);
        });
        it('notEmpty should return false for undefined_var', function () {
            expect(notEmpty(undefined_var)).toBe(false);
        });

        it('notEmpty should return true for nonempty_array', function () {
            expect(notEmpty(nonempty_array)).toBe(true);
        });
        it('notEmpty should return true for nonempty_number', function () {
            expect(notEmpty(nonempty_number)).toBe(true);
        });
        it('notEmpty should return true for nonempty_object', function () {
            expect(notEmpty(nonempty_object)).toBe(true);
        });
        it('notEmpty should return true for nonempty_string', function () {
            expect(notEmpty(nonempty_string)).toBe(true);
        });

    });

});
