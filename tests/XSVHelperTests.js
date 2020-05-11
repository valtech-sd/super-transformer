const XSVHelper = require('./../lib/XSVHelper.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('XSVHelper Tests', function () {
  describe('parseXsv', function () {
    it('returns an object when passed a good delimited string with matching columns', function () {
      const input = '"john", "smith", "Davenport, FL", 2017';
      const delimiter = ',';
      const columnLayout = 'first_name, last_name, customer_city, hire_year';
      const output = XSVHelper.parseXsv(input, delimiter, columnLayout);
      output.should.exist;
      expect(output).to.deep.equal(
        [
          {
            first_name: 'john',
            last_name: 'smith',
            customer_city: 'Davenport, FL',
            hire_year: '2017',
          },
        ],
        'output object was not as expected!'
      );
    });
    it('returns an object with two items when passed a good delimited string with two records and matching columns explicitly declared', function () {
      const input =
        '"john", "smith", "Davenport, FL", 2017\n"mary", "jones", "Orlando, FL", 2019';
      const delimiter = ',';
      const columnLayout = 'first_name, last_name, customer_city, hire_year';
      const output = XSVHelper.parseXsv(input, delimiter, columnLayout);
      output.should.exist;
      expect(output).to.deep.equal(
        [
          {
            first_name: 'john',
            last_name: 'smith',
            customer_city: 'Davenport, FL',
            hire_year: '2017',
          },
          {
            first_name: 'mary',
            last_name: 'jones',
            customer_city: 'Orlando, FL',
            hire_year: '2019',
          },
        ],
        'output object was not as expected!'
      );
    });
  });
  describe('parseXsvAndInferColumns', function () {
    it('returns an object when passed a good delimited string that contains column names + column names infer properly', function () {
      const input =
        'first_name, last_name, customer_city, hire_year\n"john", "smith", "Davenport, FL", 2017';
      const delimiter = ',';
      const output = XSVHelper.parseXsvAndInferColumns(input, delimiter);
      output.should.exist;
      expect(output).to.deep.equal(
        [
          {
            first_name: 'john',
            last_name: 'smith',
            customer_city: 'Davenport, FL',
            hire_year: '2017',
          },
        ],
        'output object was not as expected!'
      );
    });
  });
});
