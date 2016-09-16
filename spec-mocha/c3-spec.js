var expect = require('chai').expect;

describe('c3', function () {
    

    var c3 = window.c3;

    it('exists', function () {
        expect(c3).not.to.be.null;
        expect(typeof c3).to.equal('object');
    });
});
