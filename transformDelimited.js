#!/usr/bin/env node

// Include our needed dependencies
const TemplateHelper = require('./lib/TemplateHelper.js');
const XSVHelper = require('./lib/XSVHelper.js');
const RegexHelper = require('./lib/RegexHelper.js');
const program = require('commander');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Set aside a variable to hold our inputObject once we parse it from JSON
// These will be set by our programSetup
let inputObject, absoluteTemplatePath, inputDataLocal;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: absoluteTemplatePath has a valid path and the template file exists.
// ASSERT: either -c or -n was passed in, but not both.
// ASSERT: inputDataLocal is set to the inputData and if a Regex option was passed, already has been Regex replaced!

try {
  // Parse our input data into an inputObject
  if (program.columnLayout) {
    inputObject = XSVHelper.parseXsv(
      inputDataLocal,
      program.delimiter,
      program.columnLayout
    );
  } else if (program.inferColumns) {
    inputObject = XSVHelper.parseXsvAndInferColumns(
      inputDataLocal,
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
  if (!program.template || !program.inputdata || !program.delimiter) {
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

  try {
    // Make the template file absolute
    absoluteTemplatePath = path.normalize(program.template);
  } catch (e) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Could not parse the path of your template from the supplied value of "${program.template}".`
    );
    process.exit(-30);
  }

  // Ensure the template exists
  if (!fs.existsSync(absoluteTemplatePath)) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the template file "${absoluteTemplatePath}" was not found!`
    );
    process.exit(-31);
  }

  if (!program.columnLayout && !program.inferColumns) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: Either "-n" (--inferColumns) or "-c" (--columnLayout) is required.`
    );
    process.exit(-40);
  }

  if (program.columnLayout && program.inferColumns) {
    program.outputHelp();
    console.log(
      `\n>>> ERROR: the "-n" (--inferColumns) and "-c" (--columnLayout) arguments are not allowed together! Use one or the other.`
    );
    process.exit(-50);
  }
}
