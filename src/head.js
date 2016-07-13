/*global define, module, exports, require */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3')) :
    typeof define === 'function' && define.amd ? define(['d3'],factory) :
    (global.c3 = factory(global.d3));
}(this, function (d3) { 
	'use strict';
	var c3 = { version: "0.4.11-rc4" };
