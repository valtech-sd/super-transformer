// Include our needed dependencies
const handlebars = require('handlebars');
const fs = require('fs');
const FileHelper = require('./FileHelper.js');
const JSONHelper = require('./JSONHelper.js');
const { DataFormat, OutputTo } = require('./TemplateHelperEnums.js');
const XSVHelper = require('./XSVHelper.js');
const RegexHelper = require('./RegexHelper.js');
const OutputRedirectHelper = require('./OutputRedirectHelper.js');
const assert = require('assert');

// cacheCompiledTemplates: This is used to cache compiled handlebars templates.
const cacheCompiledTemplates = {};
/**
 * A class to manage all template operations.
 */
class TemplateHelper {
  /**
   * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output.
   *
   * @param templateFilepath
   * @param contextData - expected to be a valid JSON object! Convert into an object before calling this method.
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
   * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output. This also caches
   * compiled templates to avoid recompiling the same template. Caching can make as much as 10 times difference in processing time in some applications
   *
   * @param templateBody
   * @param contextData
   * @param removeNewline
   * @returns {string}
   */
  static applyTemplate(templateBody, contextData, removeNewline = true) {
    // Check templateBody is something before compiling.
    assert(
      templateBody,
      'applyTemplate ERROR: templateBody must not be empty!'
    );

    // Use the cached template if available, else compile a new template
    const templateRuntime =
      this.cacheCompiledTemplates[templateBody] ||
      handlebars.compile(templateBody);

    // Cache the template
    this.cacheCompiledTemplates[templateBody] = templateRuntime;

    // Apply the template
    const appliedResult = templateRuntime(contextData);

    // Remove new line
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

  /**
   * Applies a template (via the file path) to a XSV or JSON data file.
   *
   * @param templatePath - the full path to a handlerbars template.
   * @param inputPath - the full path to an input file containing lines of JSON or XSV. Note, the input file must be individual independent JSON or XSV lines.
   * @param dataFormat - what is the data format of our input data. Use the ENUM `DataFormat.JSON` or `DataFormat.XSV`.
   * @param regexMatch - a valid regex match to apply on each line in
   * @param regexReplacement - a valid regex replacement to apply on each line in, IF a regexMatch was passed. Otherwise ignored.
   * @param delimiter - (Only for XSV input files) Pass the delimiter between the columns as a string.
   * @param columnLayout - (Only for XSV input files) Pass the names of the columns. Pass null if inferColumns == true.
   * @param inferColumns - (Only for XSV input files) Pass `true` if the data file has column names in row 1 and you want to infer column names.
   * @param outputTo - optional (defaults to OutputTo.STDOUT). Pass in `OutputTo.METHOD_RETURN` to return output via the method's return. Otherwise, STDOUT will be used. Note, with large data files, METHOD_RETURN will likely not scale well (node might run out of memory.)
   * @returns {Promise<unknown>}
   */
  static applyTemplateWithFilePathToDataFile(
    templatePath,
    inputPath,
    dataFormat,
    regexMatch,
    regexReplacement,
    delimiter,
    columnLayout,
    inferColumns,
    outputTo = OutputTo.STDOUT
  ) {
    switch (dataFormat) {
      case DataFormat.JSON:
        return this.applyTemplateWithFilePathToJSONFile(
          templatePath,
          inputPath,
          regexMatch,
          regexReplacement,
          outputTo
        );

      case DataFormat.XSV:
        return this.applyTemplateWithFilePathToXsvFile(
          templatePath,
          inputPath,
          delimiter,
          columnLayout,
          inferColumns,
          regexMatch,
          regexReplacement,
          outputTo
        );

      default:
        throw new Error(
          `applyTemplateWithFilePathToDataFile ERROR: Invalid dataFormat='${dataFormat}'`
        );
    }
  }

  /**
   * Applies a template (via the file path) to a JSON data file.
   *
   * @param templatePath - the full path to a handlerbars template.
   * @param inputPath - the full path to an input file containing lines of JSON. Note, the input file must be individual independent JSON lines, NOT a JSON array one item per line.
   * @param regexMatch - a valid regex match to apply on each line in
   * @param regexReplacement - a valid regex replacement to apply on each line in, IF a regexMatch was passed. Otherwise ignored.
   * @param outputTo - optional (defaults to OutputTo.STDOUT). Pass in `OutputTo.METHOD_RETURN` to return output via the method's return. Otherwise, STDOUT will be used. Note, with large data files, METHOD_RETURN will likely not scale well (node might run out of memory.)
   * @returns {Promise<unknown>}
   */
  static applyTemplateWithFilePathToJSONFile(
    templatePath,
    inputPath,
    regexMatch,
    regexReplacement,
    outputTo = OutputTo.STDOUT
  ) {
    return new Promise((resolve) => {
      // Setup our Output Redirect
      const outputRedirectHelper = new OutputRedirectHelper(outputTo);
      const outputHandler = outputRedirectHelper.outputHandler;

      // Get the template once so we have it handy for the entire file
      const templateBody = TemplateHelper.loadTemplate(templatePath);

      // Setup a line-by-line Stream handler
      const fileReadlineHandler = FileHelper.readFileLineByLine(inputPath);

      // Setup events to monitor the stream and act on it

      // EVENT: On each 'line' from the file.
      // Each line in the input file will be successively available below as `line`.
      fileReadlineHandler.on('line', (line) => {
        try {
          // Save the incoming line to a variable so we can change it
          let localLine = line;
          // If we have a regex, let's carry it out for the line
          if (regexMatch) {
            localLine = RegexHelper.performRegexReplace(
              regexMatch,
              regexReplacement,
              localLine
            );
          }
          // Try to parse the line as JSON - seems some versions of NodeJS don't THROW on bad JSON and instead return an empty object, so we account for both.
          const lineAsObject = JSONHelper.parseJson(localLine);
          // Transform and output the results, but only if the parser returned a non null
          if (lineAsObject) {
            outputHandler(
              TemplateHelper.applyTemplate(templateBody, lineAsObject)
            );
            // stdout.write does not output newlines, so lets output one since we're done with the line
            outputHandler('\n');
          } else {
            process.stderr.write(`Skipping bad JSON line: ${line}\n`);
          }
        } catch (e) {
          // Skipping since there was an error
          process.stderr.write(
            `Skipping JSON line due to an error: ${line}\nerror: ${e.message}\n`
          );
        }
      });

      // EVENT: Monitor for file end
      fileReadlineHandler.on('close', () => {
        // Stream 'close' == File 'end', so we can resolve our Promise
        // Depending on our outputHandler, we might resolve with the output or not
        if (outputTo === OutputTo.METHOD_RETURN) {
          // The caller asked for output as the return from this method, so we oblige
          resolve(outputRedirectHelper.getOutput());
        } else {
          // The caller did not ask for output, so we've already sent it all to stdout leaving nothing to resolve with.
          resolve();
        }
      });
    });
  }

  /**
   * Applies a template (via the file path) to an XSV data file.
   *
   * @param templatePath - the path to the transformation template.
   * @param inputPath - the input file path. Must be an XSV file with the passed delimiter.
   * @param delimiter - the delimiter of the XSV data.
   * @param columnLayout - optional, the names of the columns in the XSV. Pass null if also passing inferColumns == true.
   * @param inferColumns - optional, a boolean to determine if column names should be inferred from row 1 of the file. Pass false if also passing columnLayout.
   * @param regexMatch - a valid regex match to apply on each line in
   * @param regexReplacement - a valid regex replacement to apply on each line in, IF a regexMatch was passed. Otherwise ignored.
   * @param outputTo - optional (defaults to OutputTo.STDOUT). Pass in `OutputTo.METHOD_RETURN` to return output via the method's return. Otherwise, STDOUT will be used. Note, with large data files, METHOD_RETURN will likely not scale well (node might run out of memory.)
   * @returns {Promise<unknown>}
   */
  static applyTemplateWithFilePathToXsvFile(
    templatePath,
    inputPath,
    delimiter,
    columnLayout,
    inferColumns,
    regexMatch,
    regexReplacement,
    outputTo = OutputTo.STDOUT
  ) {
    return new Promise((resolve, reject) => {
      // Sanity
      assert(
        inferColumns || columnLayout,
        'applyTemplateWithFilePathToXsvFile ERROR: Either a columnLayout or the inferColumns flag must be set!'
      );
      assert(
        delimiter,
        'applyTemplateWithFilePathToXsvFile ERROR: delimiter must be non-null!'
      );

      // Setup our Output Redirect
      const outputRedirectHelper = new OutputRedirectHelper(outputTo);
      const outputHandler = outputRedirectHelper.outputHandler;

      // ASSERT: We have either inferColumns || columnLayout

      // Set a variable to hold our column layout (this is harmless if not set as other logic will correct this)
      let effectiveColumnLayout = columnLayout;
      // A flag to keep track of first row (in case we have inferred columns)
      let firstLine = true;

      // Get the template once so we have it handy for the entire file
      const templateBody = TemplateHelper.loadTemplate(templatePath);

      // Setup a line-by-line Stream handler
      const fileReadlineHandler = FileHelper.readFileLineByLine(inputPath);

      // Setup events to monitor the stream and act on it

      // EVENT: On each 'line' from the file.
      // Each line in the input file will be successively available below as `line`.
      fileReadlineHandler.on('line', (line) => {
        // Set aside a variable to hold our line as we change it
        let localLine;
        try {
          if (inferColumns && firstLine) {
            // We're inferring columns and this is line 1, so let's keep track of that first line
            // and we don't process that line as a row of data.
            effectiveColumnLayout = line;
            firstLine = false;
          } else {
            // Otherwise, we're not inferring or we're not in line 1, so we parse
            // Save the incoming line to a variable so we can change it
            localLine = line;
            // If we have a regex, let's carry it out for the line
            if (regexMatch) {
              localLine = RegexHelper.performRegexReplace(
                regexMatch,
                regexReplacement,
                localLine
              );
            }
            // Try to parse the line as XSV - note, parseXsv returns an ARRAY, but we care about
            // the single line, so we pull [0].
            const lineAsObject = XSVHelper.parseXsv(
              localLine,
              delimiter,
              effectiveColumnLayout
            )[0];
            // Transform and output the results, but only if the parser returned a non null
            if (lineAsObject) {
              outputHandler(
                TemplateHelper.applyTemplate(templateBody, lineAsObject)
              );
              // stdout.write does not output newlines, so lets output one since we're done with the line
              outputHandler('\n');
            } else {
              process.stderr.write(`Skipping bad XSV line: ${line}\n`);
            }
          }
        } catch (e) {
          // Skipping due to error
          process.stderr.write(
            `Skipping XSV line due to an error: ${line}\nerror: ${e.message}\n`
          );
          if (regexMatch) {
            process.stderr.write(`Regex replaced line: ${localLine}\n`);
          }
        }
      });

      // EVENT: Monitor for file end
      fileReadlineHandler.on('close', () => {
        // Stream 'close' == File 'end', so we can resolve our Promise
        // Depending on our outputHandler, we might resolve with the output or not
        if (outputTo === OutputTo.METHOD_RETURN) {
          // The caller asked for output as the return from this method, so we oblige
          resolve(outputRedirectHelper.getOutput());
        } else {
          // The caller did not ask for output, so we've already sent it all to stdout leaving nothing to resolve with.
          resolve();
        }
      });
    });
  }
}
TemplateHelper.cacheCompiledTemplates = cacheCompiledTemplates;
module.exports = TemplateHelper;
