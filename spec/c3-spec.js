
var describe = window.describe;
var expect = window.expect;
var it = window.it;

var c3 = window.c3;

describe('c3', function () {
    'use strict';

    it('exists', function () {

        expect(c3).not.toBe(null);
        expect(typeof c3).toBe('object');

    });

    // ...write other tests here

});
