class RegexHelper {
  /**
   * Performs a Regex Replace (replacing ALL occurrences) on the passed inputString. The input string can be
   * any string. It does not have to be JSON!
   *
   * JSON Example:
   * const someResult = performRegexReplace('"rv(\d\d)".*?:', '"rv":$1,"rvdata":', '{"rvs":{"rv18":{"RvVgs');
   *
   * Takes in: (pretty printed for illustration only. Your desired matches should be on the same line, but you
   * can pass a multi line (newline delimited) string.)
   * {
   *   "rvs": {
   *     "rv18": {
   *       "RvVgs": {}
   *     }
   *   }
   * }
   * and returns: (pretty printed for illustration only. the return will be exactly as you passed, but
   * with replacements.)
   * {
   *   "rvs": {
   *     "rv": 18,
   *     "rvdata": {
   *       "RvVgs": {}
   *     }
   *   }
   * }
   *
   * @param regexMatchString - a standard regex pattern, as a string.
   * @param regexReplaceString - a standard regex replacement. Can use capturing groups if your pattern defines them.
   * @param inputString - an input string, which can contain multiple lines delimited by newline (\n).
   * @returns {void | string | *}
   */
  static performRegexReplace(
    regexMatchString,
    regexReplaceString,
    inputString
  ) {
    // Setup a regexp object with the passed regex pattern string
    // Regex Options: global + case insensitive
    const myregexp = new RegExp(regexMatchString, 'gi');
    return inputString.replace(myregexp, regexReplaceString);
  }
}

module.exports = RegexHelper;
