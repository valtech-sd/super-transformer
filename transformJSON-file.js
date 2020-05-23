#!/usr/bin/env node

// Include our needed dependencies
const TemplateHelper = require('./lib/TemplateHelper.js');
const { DataFormat } = require('./lib/TemplateHelperEnums.js');

const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');

// Set aside a variable to hold our inputObject once we parse it from JSON
// These will be set by our programSetup
let inputObject,
  absoluteTemplatePath,
  absoluteInputFilePath,
  fileHandle,
  absoluteHandlebarsHelperPath;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: inputObject has a valid object (derived from the input JSON string.)
// ASSERT: absoluteTemplatePath has a valid path and the template file exists.
// ASSERT: absoluteInputFilePath has a valid path and the data file exists.

// Let'd do it!
TemplateHelper.applyTemplateWithFilePathToDataFile(
  absoluteTemplatePath,
  absoluteInputFilePath,
  DataFormat.JSON,
  program.matchregex,
  program.replacepattern
).catch();

/**
 * Helpers
 */

/**
 * Parses out command line arguments and validates that all required arguments were passed.
 * Exits if there's anything wrong with the command line arguments.
 *
 * @param program
 */
function programSetup(program) {
  // Setup our command line options, etc.
  program
    .version(pkg.version)
    .description(
      `Transforms an incoming json file by applying a handlebars/mustache template that is passed by file path as an argument. Outputs to console for each redirection.`
    )
    .requiredOption(
      '-t, --template </path/to/your/template.extension>',
      'The full path to the template file to be used.'
    )
    .requiredOption(
      '-i, --inputfilepath </path/to/input/file>',
      'The path of the data file to read in and apply transformations to. This file MUST BE a multi-line JSON file where each row contains an entire JSON object. This file must NOT contain a JSON array of objects.'
    )
    .option(
      "-m, --matchregex <'a regex match'>",
      "Optionally pass a regex match as a string. Do not include the typical forward slashes used in javascript regex patterns (pass in 'regex pattern' instead of /regex-here/.) If passed, you must also pass -r --replacepattern containing a matching Regex replacement string."
    )
    .option(
      "-r, --replacepattern <'a replacement pattern'>",
      "If you passed in -m, pass a regex replacement pattern in this argument. This is ignored if you don't also pass -m."
    )
    .option(
      "-x --extendHandlebars </path/to/your/handlebars-extension.js>'",
      'If you provide a path to a javascript file'
    )
    .parse(process.argv);

  // Ensure we received mandatory parameters.
  if (!program.template || !program.inputfilepath) {
    program.outputHelp();
    process.exit(-10);
  }

  // Ensure that if we were passed -m, we also have -r
  if (program.matchregex && !program.replacepattern) {
    program.outputHelp();
    console.error(`\n>>> ERROR: If you pass -m, you also must pass -r.`);
    process.exit(-11);
  }

  try {
    // Make the template file absolute
    absoluteTemplatePath = path.resolve(program.template);
  } catch (e) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Could not parse the path of your template from the supplied value of "${program.template}".`
    );
    process.exit(-20);
  }

  // Ensure the template exists
  if (!fs.existsSync(absoluteTemplatePath)) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the template file "${absoluteTemplatePath}" was not found!`
    );
    process.exit(-21);
  }

  try {
    // Make the input file absolute
    absoluteInputFilePath = path.resolve(program.inputfilepath);
  } catch (e) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Could not parse the path of your data file from the supplied value of "${program.inputfilepath}".`
    );
    process.exit(-30);
  }

  // Ensure the input exists
  if (!fs.existsSync(absoluteInputFilePath)) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the data file "${absoluteInputFilePath}" was not found!`
    );
    process.exit(-31);
  }

  // Sanity for the Handlebars helper file, if passed
  if (program.extendHandlebars) {
    try {
      // Make the path absolute
      absoluteHandlebarsHelperPath = path.resolve(program.extendHandlebars);
    } catch (e) {
      program.outputHelp();
      console.error(
        `\n>>> ERROR: Could not parse the path of your handlebars helper javascript file from the supplied value of "${program.extendHandlebars}".`
      );
      process.exit(-40);
    }

    // Ensure the file exists
    if (!fs.existsSync(absoluteHandlebarsHelperPath)) {
      program.outputHelp();
      console.error(
        `\n>>> ERROR: the Handlebars helper javascript file "${absoluteHandlebarsHelperPath}" was not found!`
      );
      process.exit(-41);
    }

    // ASSERT: We have an absolute path & File exists, so we load it
    try {
      TemplateHelper.loadHandlebarsHelpers(absoluteHandlebarsHelperPath);
    } catch (e) {
      console.error(
        `\n>>> ERROR: Could register the helpers in your handlebars helper javascript file from the supplied value of "${absoluteHandlebarsHelperPath}".`
      );
      console.error(`>>> INNER ERROR: ${e.message}`);
      process.exit(-40);
    }
  }
}
