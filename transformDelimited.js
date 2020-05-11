#!/usr/bin/env node

// Include our needed dependencies
const TemplateHelper = require('./lib/TemplateHelper.js');
const XSVHelper = require('./lib/XSVHelper.js');
const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Set aside a variable to hold our inputObject once we parse it from JSON
// These will be set by our programSetup
let inputObject, absoluteTemplatePath;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: absoluteTemplatePath has a valid path and the template file exists.
// ASSERT: either -c or -n was passed in, but not both.

try {
  // Parse our input data into an inputObject
  if (program.columnLayout) {
    inputObject = XSVHelper.parseXsv(
      program.inputdata,
      program.delimiter,
      program.columnLayout
    );
  } else if (program.inferColumns) {
    inputObject = XSVHelper.parseXsvAndInferColumns(
      program.inputdata,
      program.delimiter
    );
  }

  // ASSERT: our parseXsv returns an array, but we expect a single item!
  assert(
    inputObject.length === 1,
    `ERROR: transformDelimited parsed more than one row! Expected a single row.`
  );

  // Transform, notice we pass in the single row we expect!
  console.log(
    TemplateHelper.applyTemplateWithFilePath(
      absoluteTemplatePath,
      inputObject[0]
    )
  );
} catch (e) {
  // Opps - error out!
  console.log(`ERROR: transformDelimited - ${e.message}`);
}

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
      `Transforms an incoming delimited string by applying a handlebars/mustache template that is passed by file path as an argument.`
    )
    .requiredOption(
      '-t, --template </path/to/your/template.extension>',
      'The full path to the template file to be used.'
    )
    .requiredOption(
      '-i, --inputdata <"john", "smith", 1969, "Davenport, FL">',
      'Pass in a string delimited by the passed in --delimiter. Column values that contain the delimiter should be quoted.'
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
  if (!program.template || !program.inputdata || !program.delimiter) {
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
    process.exit(-3);
  }

  // Ensure the template exists
  if (!fs.existsSync(absoluteTemplatePath)) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the template file "${absoluteTemplatePath}" was not found!`
    );
    process.exit(-4);
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
