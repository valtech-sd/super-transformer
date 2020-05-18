const fs = require('fs');
const readline = require('readline');

class FileHelper {
  /**
   * Reads a file, line by line. Note, this is a thin wrapper around NodeJs readline.
   *
   * The caller should save a reference to the return of this method and then implement
   * an event handler for `rl.on('line')` or a `for await... of` loop.
   * See https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
   *
   * @param inputPath
   * @returns {Interface}
   */
  static readFileLineByLine(inputPath) {
    // Open a stream for reading one line at a time
    const fileStream = fs.createReadStream(inputPath);
    return readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    // per: https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  }
}

module.exports = FileHelper;
