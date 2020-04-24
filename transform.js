const TemplateHelper = require('./lib/TemplateHelper.js');
const program = require('commander');
const pkg = require('./package.json');
// Set aside a variable to hold our inputObject once we parse it from JSON
let inputObject;

// Parse out command line arguments
programSetup(program);

// ASSERT: programSetup would exit if the CL arguments were bad. So, we have good arguments if we're here!
// ASSERT: inputObject has a valid object (derived from the input JSON string.)

// Transform
console.log(TemplateHelper.applyTemplate(program.template, inputObject));

// ********************************************************************************

// Helper to define command line arguments and enforce them
function programSetup(program) {
  // Setup our command line options, etc.
  program
    .version(pkg.version)
    .description(
      `Transforms an incoming json string by applying a handlebars/mustache template that is passed by file name as an argument.`
    )
    .option(
      '-t, --template <template-file-name>',
      'The name of the template to use. Must be present in the "templates" directory.'
    )
    .option(
      '-i, --inputdata "<json string>"',
      'Pass in a stringified JSON object.'
    )
    .parse(process.argv);

  // Ensure we received mandatory parameters.
  if (!program.template || !program.inputdata) {
    program.outputHelp();
    process.exit(-1);
  }

  // Parse out the JSON
  inputObject = parseJson(program.inputdata);
  if (!inputObject) {
    program.outputHelp();
    console.log(`\n>>> ERROR: the parameter "inputjson" was not valid JSON!`);
    process.exit(-1);
  }
}

// Validates that a passed string can be parsed as JSON and return it as an object.
function parseJson(inputjson) {
  try {
    return JSON.parse(inputjson);
  } catch (e) {
    return null;
  }
}
