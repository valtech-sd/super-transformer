const TemplateHelper = require('./../lib/TemplateHelper.js');
const { DataFormat, OutputTo } = require('./../lib/TemplateHelperEnums.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const expect = chai.expect;
chai.should();

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
});
