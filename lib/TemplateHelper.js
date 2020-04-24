// Include our needed dependencies
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * A class to manage all template operations.
 */
class TemplateHelper {
  /**
   * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output.
   *
   * @param templateFilename
   * @param contextData
   * @param removeNewline
   * @returns {string}
   */
  static applyTemplate(templateFilename, contextData, removeNewline = true) {
    const templateBody = TemplateHelper.loadTemplate(templateFilename);
    // TODO: Add safety code to check templateBody is something before compiling.
    // TODO: Wrap the compile in try catch that returns empty string
    const templateRuntime = handlebars.compile(templateBody);
    const appliedResult = templateRuntime(contextData);
    if (removeNewline) {
      return appliedResult.replace(/\n/g, '');
    } else {
      return appliedResult;
    }
  }

  /**
   * Given a template file name, loads the file from the file system. If the file is not found, returns an empty
   * string.
   *
   * @param templateFilename
   * @returns {string}
   */
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
