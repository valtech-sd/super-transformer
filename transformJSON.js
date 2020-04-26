#!/usr/bin/env node

// Include our needed dependencies
const TemplateHelper = require('./lib/TemplateHelper.js');
const JSONHelper = require('./lib/JSONHelper.js');
const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');

// Set aside a variable to hold our inputObject once we parse it from JSON
// These will be set by our programSetup
let inputObject, absoluteTemplatePath;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: inputObject has a valid object (derived from the input JSON string.)
// ASSERT: absoluteTemplatePath has a valid path and the template file exists.

// Transform
console.log(
  TemplateHelper.applyTemplateWithFilePath(absoluteTemplatePath, inputObject)
);

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
      `Transforms an incoming json string by applying a handlebars/mustache template that is passed by file path as an argument.`
    )
    .option(
      '-t, --template </path/to/your/template.extension>',
      'The full path to the template file to be used.'
    )
    .option(
      '-i, --inputdata <"json string">',
      'Pass in a stringified valid JSON object.'
    )
    .parse(process.argv);

  // Ensure we received mandatory parameters.
  if (!program.template || !program.inputdata) {
    program.outputHelp();
    process.exit(-1);
  }

  // Parse out the JSON
  inputObject = JSONHelper.parseJson(program.inputdata);
  if (!inputObject) {
    program.outputHelp();
    console.log(`\n>>> ERROR: the parameter "inputjson" was not valid JSON!`);
    process.exit(-2);
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
}
