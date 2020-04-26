// Include our needed dependencies
const handlebars = require('handlebars');
const fs = require('fs');

/**
 * A class to manage all template operations.
 */
class TemplateHelper {
  /**
   * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output.
   *
   * @param templateFilepath
   * @param contextData
   * @param removeNewline
   * @returns {string}
   */
  static applyTemplateWithFilePath(
    templateFilepath,
    contextData,
    removeNewline = true
  ) {
    const templateBody = TemplateHelper.loadTemplate(templateFilepath);
    return TemplateHelper.applyTemplate(
      templateBody,
      contextData,
      removeNewline
    );
  }

  /**
   * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output.
   *
   * @param templateBody
   * @param contextData
   * @param removeNewline
   * @returns {string}
   */
  static applyTemplate(templateBody, contextData, removeNewline = true) {
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
   * Given a template file path, loads the file from the file system. If the file is not found, returns an empty
   * string.
   *
   * @param templateFilepath
   * @returns {string}
   */
  static loadTemplate(templateFilepath) {
    // Try to read the template, if we can't for any reason, just return empty string
    try {
      return fs.readFileSync(templateFilepath).toString();
    } catch (e) {
      return '';
    }
  }
}

module.exports = TemplateHelper;
