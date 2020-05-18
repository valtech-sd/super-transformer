const { OutputTo } = require('./TemplateHelperEnums.js');

/**
 * This is a class to make it easy to redirect output to their STDOUT or to a buffer to be returned
 * after all operations complete.
 *
 * Why? When running automated tests, it's not possibly to capture STDOUT for inspection by Mocha.
 * Therefore, we use this technique to return output via a buffer passed as the RESOLE() of a
 * promise.
 *
 * Warning: This technique works fine for small input files (since all output is stored in Memory).
 * However, this should be avoided with large data files! What is large? That will be relative to
 * the specific computer where this script runs, but memory is the most important factor.
 */
class OutputRedirectHelper {
  // In our consructor, set aside a variable to hold output and define what the outputHandler will be.
  /**
   * Constructor to our OutputRedirectHelper class.
   * @param outputTo - pass in a value from the enum `OutputTo`.
   */
  constructor(outputTo) {
    this.outputBuffer = '';
    if (outputTo === OutputTo.METHOD_RETURN) {
      // We're returning, so the handler needs to hold all output for return later.
      this.outputHandler = (str) => {
        this.outputBuffer += str;
      };
    } else {
      // We're going to STDOUT, so just let that happen.
      this.outputHandler = (str) => {
        process.stdout.write(str);
      };
    }
  }

  /**
   * A placeholder outputHandler. The constructor will override this.
   *
   * @param str
   */
  outputHandler(str) {}

  /**
   * A method to get the output from the class instance.
   *
   * @returns {string}
   */
  getOutput() {
    return this.outputBuffer;
  }
}

module.exports = OutputRedirectHelper;
