const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class TemplateHelper {
  static applyTemplate(templateFilename, contextData) {
    const templateBody = TemplateHelper.loadTemplate(templateFilename);
    // TODO: Add safety code to check templateBody is something before compiling.
    // TODO: Wrap the compile in try catch that returns empty string
    const templateRuntime = handlebars.compile(templateBody);
    return templateRuntime(contextData);
  }

  static loadTemplate(templateFilename) {
    // Try to read the template, if we can't for any reason, just return empty string
    try {
      return fs
        .readFileSync(`${__dirname}/../templates/${templateFilename}`)
        .toString();
    } catch (e) {
      return '';
    }
  }
}

module.exports = TemplateHelper;
