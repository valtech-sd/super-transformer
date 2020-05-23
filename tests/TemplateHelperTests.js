const TemplateHelper = require('./../lib/TemplateHelper.js');
const { DataFormat, OutputTo } = require('./../lib/TemplateHelperEnums.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const simple = require('simple-mock');
const handlebars = require('handlebars');
const expect = chai.expect;
chai.should();
const path = require('path');

describe('TemplateHelper Tests', function () {
  describe('applyTemplateWithFilePath', () => {
    it('returns applied template, from a path, with no {{ present', () => {
      const contextData = {
        customer: {
          name: 'John',
        },
      };
      const templateBody = TemplateHelper.loadTemplate(
        './template-examples/demo-simple.hbs'
      );
      templateBody.should.exist;
      const templateOutput = TemplateHelper.applyTemplate(
        templateBody,
        contextData
      );
      // console.log(`templateOutput:\n${templateOutput}`);
      templateOutput.should.exist;
      templateOutput.should.not.match(
        /{{/,
        'Applied template should not have any mustaches {{}} left over!'
      );
      expect(templateOutput).to.equal('{ "customerName": "John" }');
    });
  });

  describe('loadTemplate', () => {
    it('returns text if template exists', () => {
      const templateBody = TemplateHelper.loadTemplate(
        './template-examples/demo-simple.hbs'
      );
      templateBody.should.exist;
    });
    it('returns empty string if template does not exist', () => {
      const templateBody = TemplateHelper.loadTemplate(
        'junk-does-not-exist.json'
      );
      templateBody.should.equal('');
    });
  });

  describe('applyTemplate', () => {
    it('returns applied template with no {{ present', () => {
      const contextData = {
        customer: {
          name: 'John',
        },
      };
      const templateOutput = TemplateHelper.applyTemplate(
        '{ "customerName": "{{customer.name}}" }',
        contextData
      );
      // console.log(`templateOutput:\n${templateOutput}`);
      templateOutput.should.exist;
      templateOutput.should.not.match(
        /{{/,
        'Applied template should not have any mustaches {{}} left over!'
      );
      expect(templateOutput).to.equal('{ "customerName": "John" }');
    });
  });

  describe('applyTemplateWithFilePathToDataFile', () => {
    it('JSON: should transform a template with data from a file', (done) => {
      const templatePath = './template-examples/demo-simple.hbs';
      const dataFilePath = './tests/test-files/simple-json-01.txt';
      // Apply our template and file.
      // Note we override outputTo so we can get the result of the transformation instead of letting it go to stdout.
      TemplateHelper.applyTemplateWithFilePathToDataFile(
        templatePath,
        dataFilePath,
        DataFormat.JSON,
        null,
        null,
        null,
        null,
        null,
        OutputTo.METHOD_RETURN
      )
        .then((templateOutput) => {
          templateOutput.should.exist;
          expect(templateOutput).to.equal(
            '{ "customerName": "John" }\n' +
              '{ "customerName": "Mary" }\n' +
              '{ "customerName": "Pete" }\n'
          );
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
    it('JSON: should transform a template with a Regexp replacement on data from a file', (done) => {
      const templatePath = './template-examples/demo-for-regex.hbs';
      const dataFilePath = './tests/test-files/simple-json-03-must-regex.txt';
      // Apply our template and file.
      // Note we override outputTo so we can get the result of the transformation instead of letting it go to stdout.
      TemplateHelper.applyTemplateWithFilePathToDataFile(
        templatePath,
        dataFilePath,
        DataFormat.JSON,
        '"rv(\\d\\d)".*?:',
        '"rv":$1,"rvdata":',
        null,
        null,
        null,
        OutputTo.METHOD_RETURN
      )
        .then((templateOutput) => {
          templateOutput.should.exist;
          expect(templateOutput).to.equal(
            '{ "rv": 18, "rvdata": 7 }\n' +
              '{ "rv": 17, "rvdata": 3 }\n' +
              '{ "rv": 15, "rvdata": 17 }\n'
          );
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
    it('JSON: should skip some rows with bad JSON in the input', (done) => {
      const templatePath = './template-examples/demo-simple.hbs';
      const dataFilePath =
        './tests/test-files/simple-json-02-some-bad-json.txt';
      // Apply our template and file.
      // Note we override outputTo so we can get the result of the transformation instead of letting it go to stdout.
      TemplateHelper.applyTemplateWithFilePathToDataFile(
        templatePath,
        dataFilePath,
        DataFormat.JSON,
        null,
        null,
        null,
        null,
        null,
        OutputTo.METHOD_RETURN
      )
        .then((templateOutput) => {
          templateOutput.should.exist;
          expect(templateOutput).to.equal(
            '{ "customerName": "John" }\n' + '{ "customerName": "Pete" }\n'
          );
          done();
        })
        .catch((e) => {
          done(e);
        });
    });

    /**
     * Test that the template is cached and not recompiled
     * Do this by...
     * 1.  Create a an example object
     * 2.  Load a template body from file
     * 3.  Mock handlebars compile function
     * 4.  Reset cached templates
     * 5.  Apply template using template body and data
     * 6.  Make sure template was cached.
     * 7.  Make sure compile was called
     * 8.  Make sure return data is correct
     * 9.  Apply template again using same template and data
     * 10.  Test compile was not called again
     * 11. Test data is correct
     */
    it('JSON: applyTemplate will cache the template', (done) => {
      // 1.  Create a an example object
      const contextData = {
        customer: {
          name: 'John',
        },
      };

      // 2.  Load a template body from file
      const templateBody = TemplateHelper.loadTemplate(
        './template-examples/demo-simple.hbs'
      );
      // 3.  Reset cached templates
      TemplateHelper.cacheCompiledTemplates = {};

      // 3.  Mock handlebars compile function
      let spy = simple.mock(handlebars, 'compile');

      // 5.  Apply template using template body and data
      let templateOutput = TemplateHelper.applyTemplate(
        templateBody,
        contextData
      );

      // 6.  Make sure template was cached.
      expect(TemplateHelper.cacheCompiledTemplates).to.have.key(templateBody);

      // 7.  Make sure compile was called
      expect(spy.callCount).to.equal(1);
      // 8.  Make sure return data is correct
      expect(templateOutput).to.equal('{ "customerName": "John" }');
      // 9.  Apply template again using same template and data
      templateOutput = TemplateHelper.applyTemplate(templateBody, contextData);
      // 10.  Test compile was not called again
      expect(spy.callCount).to.equal(1);
      // 11. Test data is correct
      expect(templateOutput).to.equal('{ "customerName": "John" }');
      done();
    });
    it('XSV: should transform a template with data from a file', (done) => {
      // In this test, we DO have columns in the file, so we inferColumns
      const templatePath = './template-examples/demo-simple-flat.hbs';
      const dataFilePath = './tests/test-files/simple-csv-01.txt';
      const delimiter = ',';
      const columnLayout = null;
      const inferColumns = true;
      // Apply our template and file.
      // Note we override outputTo so we can get the result of the transformation instead of letting it go to stdout.
      TemplateHelper.applyTemplateWithFilePathToDataFile(
        templatePath,
        dataFilePath,
        DataFormat.XSV,
        null,
        null,
        delimiter,
        columnLayout,
        inferColumns,
        OutputTo.METHOD_RETURN
      )
        .then((templateOutput) => {
          templateOutput.should.exist;
          expect(templateOutput).to.equal(
            '{ "customerName": "john smith", "customerCity": "Davenport, FL", "fteSince": 2017 }\n' +
              '{ "customerName": "mary jones", "customerCity": "Orlando, FL", "fteSince": 2019 }\n' +
              '{ "customerName": "pete parker", "customerCity": "Lakeland, FL", "fteSince": 2018 }\n'
          );
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
    it('XSV: should skip some rows with bad column alignment in the input', (done) => {
      // In this test, we DO have columns in the file, so we inferColumns
      const templatePath = './template-examples/demo-simple-flat.hbs';
      const dataFilePath =
        './tests/test-files/simple-csv-03-some-different-rows.txt';
      const delimiter = ',';
      const columnLayout = null;
      const inferColumns = true;
      // Apply our template and file.
      // Note we override outputTo so we can get the result of the transformation instead of letting it go to stdout.
      TemplateHelper.applyTemplateWithFilePathToDataFile(
        templatePath,
        dataFilePath,
        DataFormat.XSV,
        null,
        null,
        delimiter,
        columnLayout,
        inferColumns,
        OutputTo.METHOD_RETURN
      )
        .then((templateOutput) => {
          templateOutput.should.exist;
          expect(templateOutput).to.equal(
            '{ "customerName": "john smith", "customerCity": "Davenport, FL", "fteSince": 2017 }\n' +
              '{ "customerName": "mary jones", "customerCity": "Orlando, FL", "fteSince": 2019 }\n' +
              '{ "customerName": "pete parker", "customerCity": "Lakeland, FL", "fteSince": 2018 }\n'
          );
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
    it('XSV: should transform a template with a static column layout and data from a file', (done) => {
      // In this test, we DO have columns in the file, so we inferColumns
      const templatePath = './template-examples/demo-simple-flat.hbs';
      const dataFilePath = './tests/test-files/simple-csv-02-no-header.txt';
      const delimiter = ',';
      const columnLayout = 'first_name, last_name, customer_city, hire_year';
      const inferColumns = false;
      // Apply our template and file.
      // Note we override outputTo so we can get the result of the transformation instead of letting it go to stdout.
      TemplateHelper.applyTemplateWithFilePathToDataFile(
        templatePath,
        dataFilePath,
        DataFormat.XSV,
        null,
        null,
        delimiter,
        columnLayout,
        inferColumns,
        OutputTo.METHOD_RETURN
      )
        .then((templateOutput) => {
          templateOutput.should.exist;
          expect(templateOutput).to.equal(
            '{ "customerName": "john smith", "customerCity": "Davenport, FL", "fteSince": 2017 }\n' +
              '{ "customerName": "mary jones", "customerCity": "Orlando, FL", "fteSince": 2019 }\n' +
              '{ "customerName": "pete parker", "customerCity": "Lakeland, FL", "fteSince": 2018 }\n'
          );
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
  });
  describe('loadHandlebarsHelpers', () => {
    it('Valid handlebars custom helper file loads and applies the "yell" helper', () => {
      TemplateHelper.loadHandlebarsHelpers(
        path.resolve('./template-examples/demo-handlebars-helpers.js')
      );
      const contextData = {
        customer: {
          name: 'John',
        },
      };
      const templateOutput = TemplateHelper.applyTemplate(
        '{ "customerName": "{{yell customer.name}}" }',
        contextData
      );
      templateOutput.should.exist;
      expect(templateOutput).to.equal('{ "customerName": "JOHN" }');
    });
  });
});
