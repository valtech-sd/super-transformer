export = TemplateHelper;
/**
 * A class to manage all template operations.
 */
declare class TemplateHelper {
    /**
     * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output.
     *
     * @param templateFilepath
     * @param contextData - expected to be a valid JSON object! Convert into an object before calling this method.
     * @param removeNewline
     * @returns {string}
     */
    static applyTemplateWithFilePath(templateFilepath: any, contextData: any, removeNewline?: boolean): string;
    /**
     * Applies a template (by file name) to the passed data. Optionally removes newline characters from the output. This also caches
     * compiled templates to avoid recompiling the same template. Caching can make as much as 10 times difference in processing time in some applications
     *
     * @param templateBody
     * @param contextData
     * @param removeNewline
     * @returns {string}
     */
    static applyTemplate(templateBody: any, contextData: any, removeNewline?: boolean): string;
    /**
     * Given a template file path, loads the file from the file system. If the file is not found, returns an empty
     * string.
     *
     * @param templateFilepath
     * @returns {string}
     */
    static loadTemplate(templateFilepath: any): string;
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
    static applyTemplateWithFilePathToDataFile(templatePath: any, inputPath: any, dataFormat: any, regexMatch: any, regexReplacement: any, delimiter: any, columnLayout: any, inferColumns: any, outputTo?: string): Promise<unknown>;
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
    static applyTemplateWithFilePathToJSONFile(templatePath: any, inputPath: any, regexMatch: any, regexReplacement: any, outputTo?: string): Promise<unknown>;
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
    static applyTemplateWithFilePathToXsvFile(templatePath: any, inputPath: any, delimiter: any, columnLayout: any, inferColumns: any, regexMatch: any, regexReplacement: any, outputTo?: string): Promise<unknown>;
    /**
     * Provides support for wiring in standard Handlebars Helpers
     * Note, the contents of the helper file is special:
     * ```javascript
     * function loadHandlebarsHelpers(Handlebars) {
     *   Handlebars.registerHelper('yell', (someString) => {
     *     return someString.toUpperCase();
     *   });
     *   [... as many standard Handlerbars register declarations here...]
     * }
     * module.exports.loadHandlebarsHelpers = loadHandlebarsHelpers;
     * ```
     * Usage in a template: `{{yell somePropertyName}}`
     *
     * @param helperFilePath
     */
    static loadHandlebarsHelpers(helperFilePath: any): void;
}
declare namespace TemplateHelper {
    export { cacheCompiledTemplates };
}
declare const cacheCompiledTemplates: {};
