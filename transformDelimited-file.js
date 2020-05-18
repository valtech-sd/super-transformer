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
let inputObject, absoluteTemplatePath, absoluteInputFilePath, fileHandle;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: inputObject has a valid object (derived from the input JSON string.)
// ASSERT: absoluteTemplatePath has a valid path and the template file exists.
// ASSERT: absoluteInputFilePath has a valid path and the data file exists.
// ASSERT: either -c or -n was passed in, but not both.

// Let'd do it!
TemplateHelper.applyTemplateWithFilePathToDataFile(
  absoluteTemplatePath,
  absoluteInputFilePath,
  DataFormat.XSV,
  program.delimiter,
  program.columnLayout,
  program.inferColumns
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
    .requiredOption(
      '-d, --delimiter <"," or "|" or "\\t" or other>',
      'Pass in a character that delimits the individual columns in your input string.'
    )
    .option(
      '-c, --columnLayout <"column_name, other_column_name">',
      'Pass in a string of comma separated column names. These will be the names you use in your template file. not allowed with the "-n" argument.'
    )
    .option(
      '-n, --inferColumns',
      'A flag to tell the script to infer the column names from the incoming data. Not allowed with the "-c" argument.'
    )
    .parse(process.argv);

  // Ensure we received mandatory parameters.
  if (!program.template || !program.inputfilepath || !program.delimiter) {
    program.outputHelp();
    process.exit(-1);
  }

  try {
    // Make the template file absolute
    absoluteTemplatePath = path.normalize(program.template);
  } catch (e) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Could not parse the path of your template from the supplied value of "${program.template}".`
    );
    process.exit(-10);
  }

  // Ensure the template exists
  if (!fs.existsSync(absoluteTemplatePath)) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the template file "${absoluteTemplatePath}" was not found!`
    );
    process.exit(-11);
  }

  try {
    // Make the input file absolute
    absoluteInputFilePath = path.normalize(program.inputfilepath);
  } catch (e) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Could not parse the path of your data file from the supplied value of "${program.inputfilepath}".`
    );
    process.exit(-20);
  }

  // Ensure the input exists
  if (!fs.existsSync(absoluteInputFilePath)) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the data file "${absoluteInputFilePath}" was not found!`
    );
    process.exit(-21);
  }

  if (!program.columnLayout && !program.inferColumns) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Either "-n" (--inferColumns) or "-c" (--columnLayout) is required.`
    );
    process.exit(-5);
  }

  if (program.columnLayout && program.inferColumns) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the "-n" (--inferColumns) and "-c" (--columnLayout) arguments are not allowed together! Use one or the other.`
    );
    process.exit(-6);
  }
}
