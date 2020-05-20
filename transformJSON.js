#!/usr/bin/env node

// Include our needed dependencies
const TemplateHelper = require('./lib/TemplateHelper.js');
const JSONHelper = require('./lib/JSONHelper.js');
const RegexHelper = require('./lib/RegexHelper.js');
const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');

// Set aside a variable to hold our inputObject once we parse it from JSON
// These will be set by our programSetup
let inputObject, absoluteTemplatePath, inputDataLocal;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: inputObject has a valid object (derived from the input JSON string.)
// ASSERT: if the Regex option was passed, the inputObject already has been replaced (and is still valid JSON.)
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
    .requiredOption(
      '-t, --template </path/to/your/template.extension>',
      'The full path to the template file to be used.'
    )
    .requiredOption(
      '-i, --inputdata <"json string">',
      'Pass in a stringified valid JSON object.'
    )
    .option(
      "-m, --matchregex <'a regex match'>",
      "Optionally pass a regex match as a string. Do not include the typical forward slashes used in javascript regex patterns (pass in 'regex pattern' instead of /regex-here/.) If passed, you must also pass -r --replacepattern containing a matching Regex replacement string."
    )
    .option(
      "-r, --replacepattern <'a replacement pattern'>",
      "If you passed in -m, pass a regex replacement pattern in this argument. This is ignored if you don't also pass -m."
    )
    .parse(process.argv);

  // Ensure we received mandatory parameters.
  if (!program.template || !program.inputdata) {
    program.outputHelp();
    process.exit(-10);
  }

  // Ensure that if we were passed -m, we also have -r
  if (program.matchregex && !program.replacepattern) {
    program.outputHelp();
    console.error(`\n>>> ERROR: If you pass -m, you also must pass -r.`);
    process.exit(-11);
  }

  // ASSERT: if we have -m, we also have -r

  // Store the inputdata in a variable so we can manipulate it
  inputDataLocal = program.inputdata;

  // If we received a Regex replacement, let's carry it out!
  if (program.matchregex) {
    try {
      inputDataLocal = RegexHelper.performRegexReplace(
        program.matchregex,
        program.replacepattern,
        inputDataLocal
      );
    } catch (e) {
      console.error(
        `\n>>> ERROR: Could not apply the Regex replacement. The underlying error was: ${e.message}`
      );
      process.exit(-17);
    }
  }

  // Parse out the JSON
  inputObject = JSONHelper.parseJson(inputDataLocal);
  if (!inputObject && !program.matchregex) {
    program.outputHelp();
    console.error(`\n>>> ERROR: the parameter "inputdata" was not valid JSON!`);
    process.exit(-20);
  } else if (!inputObject && program.matchregex) {
    console.error(
      `\n>>> ERROR: inputdata was not valid JSON after a Regex replacement was performed! Check your Regex pattern and replacement to ensure you still end up with valid JSON!`
    );
    process.exit(-21);
  }

  try {
    // Make the template file absolute
    absoluteTemplatePath = path.normalize(program.template);
  } catch (e) {
    program.outputHelp();
    console.error(
      `\n>>> ERROR: Could not parse the path of your template from the supplied value of "${program.template}".`
    );
    process.exit(-30);
  }

  // Ensure the template exists
  if (!fs.existsSync(absoluteTemplatePath)) {
    program.outputHelp();
    console.error(
      `\n>>> ERROR: the template file "${absoluteTemplatePath}" was not found!`
    );
    process.exit(-31);
  }
}
