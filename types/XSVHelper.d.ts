export = XSVHelper;
declare class XSVHelper {
    /**
     * Returns a csv parse options object that can be passed into the parser.
     *
     * @param delimiter - expected to be the delimiter for the xSV file.
     * @param columns - expected to be a comma separated string of column names
     * @returns {{delimiter: *, columns: []}}
     */
    static getCsvOptionsObject(delimiter: any, columns: any): {
        delimiter: any;
        columns: [];
    };
    /**
     * Returns a csv parse options object that can be passed into the parser.
     * The options object will be setup for inferring column names!
     *
     * @param delimiter - expected to be the delimiter for the xSV file.
     * @returns {{delimiter: *, columns: []}}
     */
    static getCsvOptionsObjectWithInferColumns(delimiter: any): {
        delimiter: any;
        columns: [];
    };
    /**
     * Parses an input string expected to contain a xSV structure with the passed delimiter
     *
     * @param input - a string of text, delimited properly by the passed delimiter.
     * @param delimiter - a delimiter that separates distinct columns in the input
     * @param columnLayout - the layout of column names that matches the input string
     * @returns {any}
     */
    static parseXsv(input: any, delimiter: any, columnLayout: any): any;
    /**
     * Parses an input string expected to contain a xSV structure with the passed delimiter
     * and the first row must contain column names.
     *
     * @param input - a string of text, delimited properly by the passed delimiter.
     * @param delimiter - a delimiter that separates distinct columns in the input
     * @returns {any}
     */
    static parseXsvAndInferColumns(input: any, delimiter: any): any;
}
