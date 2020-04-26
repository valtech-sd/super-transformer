const parse = require('csv-parse/lib/sync');

class XSVHelper {
  /**
   * Returns a csv parse options object that can be passed into the parser.
   *
   * @param delimiter - expected to be the delimiter for the xSV file.
   * @param columns - expected to be a comma separated string of column names
   * @returns {{delimiter: *, columns: []}}
   */
  static getCsvOptionsObject(delimiter, columns) {
    if (!delimiter || !columns) {
      throw new Error(
        'getCsvOptionsObject - arguments "delimiter" and "columns" must both be non-null.'
      );
    }
    return {
      delimiter: delimiter,
      // Note we split the incoming columns string into an array, and trim any whitespace between the delimiters
      columns: columns.split(',').map((s) => s.trim()),
      // Trim any whitespace around the delimiter (but not inside any quoted strings)
      trim: true,
    };
  }

  /**
   * Parses an input string expected to contain a xSV structure with the passed delimiter
   * @param input - a string of text, delimited properly by the passed delimiter.
   * @param delimiter - a delimiter that separates distinct columns in the input
   * @param columnLayout - the layout of column names that matches the input string
   * @returns {any}
   */
  static parseXsv(input, delimiter, columnLayout) {
    try {
      const optionsObject = this.getCsvOptionsObject(delimiter, columnLayout);
      return parse(input, optionsObject);
    } catch (e) {
      throw new Error(`parseXsv - ${e.message}`);
    }
  }
}

module.exports = XSVHelper;
