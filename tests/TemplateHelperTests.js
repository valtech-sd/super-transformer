const TemplateHelper = require('./../lib/TemplateHelper.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('TemplateHelper Tests', function () {
  describe('loadTemplate', function () {
    it('returns text if template exists', function () {
      const templateBody = TemplateHelper.loadTemplate('demo-simple.json');
      templateBody.should.exist;
    });
    it('returns empty string if template does not exist', function () {
      const templateBody = TemplateHelper.loadTemplate(
        'junk-does-not-exist.json'
      );
      templateBody.should.equal('');
    });
  });

  describe('applyTemplate', function () {
    it('returns applied template with no {{ present', function () {
      const contextData = {
        customer: {
          name: 'John',
        },
      };
      const templateOutput = TemplateHelper.applyTemplate(
        'demo-simple.json',
        contextData
      );
      // console.log(`templateOutput:\n${templateOutput}`);
      templateOutput.should.exist;
      templateOutput.should.not.match(
        /{{/,
        'Applied template should not have any mustaches {{}} left over!'
      );
    });
  });
});
