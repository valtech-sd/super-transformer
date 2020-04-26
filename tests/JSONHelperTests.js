const JSONHelper = require('./../lib/JSONHelper.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('JSONHelper Tests', function () {
  describe('parseJson', function () {
    it('returns an object when passed a good JSON string', function () {
      const output = JSONHelper.parseJson('{"customer": {"name": "John"}}');
      output.should.exist;
      expect(output).to.deep.equal({
        customer: {
          name: 'John',
        },
      });
    });
    it('returns null when passed a bad JSON string', function () {
      const output = JSONHelper.parseJson('{customer": {"name: "John"}}');
      expect(output).to.be.null;
    });
  });
});
