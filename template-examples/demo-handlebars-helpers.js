function loadHandlebarsHelpers(Handlebars) {
  Handlebars.registerHelper('yell', (someString) => {
    return someString.toUpperCase();
  });
  Handlebars.registerHelper('whisper', (someString) => {
    return someString.toLowerCase();
  });
}
module.exports.loadHandlebarsHelpers = loadHandlebarsHelpers;
