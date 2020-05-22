# super-transformer

![NPM CI+Build+Test](https://github.com/valtech-sd/super-transformer/workflows/NPM%20CI+Build+Test/badge.svg?event=push)

## Summary

This package provides scripts to transform incoming strings using templates. It receives string of various formats (JSON, CSV) and returns a string after transforming the incoming data. This package can also transform entire files or a string passed as an argument.

A complete example of how to use this package in your own project is available at: https://github.com/valtech-sd/super-transformer-example

## Dependencies

The NPM packages are committed to the repo, but if you're having problems, try `npm i`.

This repository uses Handlebars templates. To learn more about handlebars/mustache template transformations, see the [HandlebarsJS website](https://handlebarsjs.com/guide/).

## JSON Transformations

### transformJSON.js

The script **transformJSON.js** is a transformation script that operates on a single data object (a single "row" of data). This script uses a handlebars/mustache template to transform JSON passed as a string in the command line into another format determined by the template!

The transform script can be called like this:

```bash
$  node ./transformJSON.js -t "./template-examples/demo-simple.hbs" -i "{\"customer\": {\"name\": \"John\"}}"
```

The command line arguments are:

- -t :the full path of the template file to use for the transformation. 
- -i :a valid json string which will be used as context data in the transformation. If the string you pass cannot be parsed as JSON (using `JSON.parse()`), the script will terminate and return an error.
- -m :(optional) pass a regex match as a string. This will be applied to the -i string before parsing JSON. To avoid an error, ensure that your Regex still results in valid JSON. Do not include the typical forward slashes used in javascript regex patterns (pass in `'.*'` instead of `/.*/`). If passed, you must also pass -r --replacepattern containing a matching Regex replacement string.
- -r :if you passed in -m, pass a regex replacement pattern in this argument. This is ignored if you don't also pass -m.

### transformJSON-file.js

The script **transformJSON-file.js** is a transformation script that operates on an input file of any size (instead of a single data object). This script uses a handlebars/mustache template to transform each row of JSON into another format determined by the template!

The transform script can be called like this:

```bash
$  node ./transformJSON-file.js -t "./template-examples/demo-simple.hbs" -i "./tests/test-files/simple-json-01.txt"
```

The command line arguments are:

- -t :the full path of the template file to use for the transformation. 
- -i :the full path to a data file containing individual JSON objects, one per row. Note, a single JSON object (an array of JSON objects) is not supported.
- -m :(optional) pass a regex match as a string. This will be applied to each line in the input file before parsing JSON. To avoid an error, ensure that your Regex still results in valid JSON. Do not include the typical forward slashes used in javascript regex patterns (pass in `'.*'` instead of `/.*/`). If passed, you must also pass -r --replacepattern containing a matching Regex replacement string.
- -r :if you passed in -m, pass a regex replacement pattern in this argument. This is ignored if you don't also pass -m.


This script outputs all transformed rows to STDOUT. OS level redirection should be used capture results to file. For example:
```bash
$  node ./transformJSON-file.js -t "./template-examples/demo-simple.hbs"  -i "./tests/test-files/simple-json-01.txt" > /path/to/an/output/file.json
```

What about lines in the file that can't be parsed as JSON? This script will skip those lines and output error messages via STDERR so that a redirected output file still contains the successful rows without any errors.

### Template Example: demo-simple.hbs

Handlebars supports many rich template substitutions. 

The example template is very simple:

```
{ "customerName": "{{customer.name}}" }
```

This template will output all the text inside the file except the items wrapped in a mustache (the "{{}}"). For example,
in the above, **{{customer.name}}** will be replaced with the object **customer** and the property **name** in the incoming data. 
If the incoming data does not have a value for the object, then the value is replaced with an empty string.

The example data in the command line above is:
```
"{\"customer\": {\"name\": \"John\"}}"
```

Note the string is in double quotes with the inner double quotes escaped. This is impractical if your data is coming from another tool, in which case, you can also pass it in single quotes:
```
'{"customer": {"name": "John"}}'
```

Regardless of how you pass the string with json data, the object above is represented as the following object once `JSON.parse()` parses it.

```
{
  "customer": {
    "name": "John"
  }
}
```

When you run this **demo-simple.hbs** template with the data above, the results are:
```
{ "customerName": "John" }
```

What just happened? The template mustached variables were replaced with data coming from the passed JSON object!

Of course, this is a very simple example, but in practice the data object can be any JSON structure even containing arrays, 
nested objects, etc.

### Data File Example: simple-json-01.txt

The example data file contains one JSON object per row as follows:

```text
{"customer": {"name": "John"}}
{"customer": {"name": "Mary"}}
{"customer": {"name": "Pete"}}
```

Note that this is NOT a well formed JSON file in that it is not an array of JSON objects strung together. This format, very common in logging scenarios, holds a single complete JSON object per row!

## Delimited Transformations (CSV, TSV, or any other delimited string)

### transformDelimited.js

The script **transformDelimited.js** is a transformation script that operates on a single data object (a single "row" of data). This script uses a handlebars/mustache template to transform a delimited string (CSV or otherwise) passed as a string in the command line into another format determined by the template!

The transform script can be called like this:

```bash
$  node ./transformDelimited.js -t "./template-examples/demo-simple-flat.hbs" -i '"john", "smith", "Davenport, FL", 2017' -d "," -c "first_name, last_name, customer_city, hire_year"
```

The command line arguments are:

- -t :the full path of the template file to use for the transformation. 
- -i :a valid delimited string which will be used as context data in the transformation. Note that column values that contain the delimiter must be quoted to avoid being parsed as another column.
- -d :a character delimiter that is used in your input.
- -c :a string that represents the column names for your input. Do not quote the various column names individually. This should be a single string (and the string itself should be quoted.) This should not be used if the '-n' argument is also used.
- -n :a flag to tell the script to infer column names. Should not be used with the '-c' argument.
- -m :(optional) pass a regex match as a string. This will be applied to the -i string before parsing columns. To avoid an error, ensure that your Regex still results in the proper number of columns. Do not include the typical forward slashes used in javascript regex patterns (pass in `'.*'` instead of `/.*/`). If passed, you must also pass -r --replacepattern containing a matching Regex replacement string.
- -r :if you passed in -m, pass a regex replacement pattern in this argument. This is ignored if you don't also pass -m.


### transformDelimited-file.js

The script **transformDelimited.js** is a transformation script that operates on an input file of any size (instead of a single data object). This script uses a handlebars/mustache template to transform each delimited record row (CSV or otherwise) into another format determined by the template!

The transform script can be called like this:

```bash
$  node ./transformDelimited-file.js -t "./template-examples/demo-simple-flat.hbs" -i "./tests/test-files/simple-csv-01.txt" -d "," -n
```

The command line arguments are:

- -t :the full path of the template file to use for the transformation. 
- -i :the full path to a data file containing individual delimited records, one per row.
- -d :a character delimiter that is used in your input.
- -c :a string that represents the column names for your input. Do not quote the various column names individually. This should be a single string (and the string itself should be quoted.) This should not be used if the '-n' argument is also used.
- -n :a flag to tell the script to infer column names from the first row of your file. Should not be used with the '-c' argument.
- -m :(optional) pass a regex match as a string. This will be applied to each line in the input file before parsing columns. To avoid an error, ensure that your Regex still results in the proper number of columns. Do not include the typical forward slashes used in javascript regex patterns (pass in `'.*'` instead of `/.\*/`). If passed, you must also pass -r --replacepattern containing a matching Regex replacement string.
- -r :if you passed in -m, pass a regex replacement pattern in this argument. This is ignored if you don't also pass -m.

This script outputs all transformed rows to STDOUT. OS level redirection should be used capture results to file. For example:
```bash
$  node ./transformDelimited-file.js -t "./template-examples/demo-simple-flat.hbs" -i "./tests/test-files/simple-csv-01.txt" -d "," -n > /path/to/an/output/file.json
```

What about lines in the file that can't be parsed as JSON? This script will skip those lines and output error messages via STDERR so that a redirected output file still contains the successful rows without any errors.

### Template Example: demo-simple-flat.hbs

Handlebars supports many rich template substitutions. To learn more about handlebars/mustache template transformations, see the [HandlebarsJS website](https://handlebarsjs.com/guide/).

The example template is very simple:

```
{
  "customerName": "{{first_name}}{{#if last_name}} {{last_name}}{{/if}}",
  "customerCity": "{{customer_city}}",
  "fteSince": {{hire_year}}
}
```

This template will output all the text inside the file except the items wrapped in a mustache (the "{{}}"). For example,
in the above, **{{first_name}}** will be replaced with the **first_name** column. Similarly the others are replaced with the corresponding named columns.
 
If the incoming data does not have a value for the object, then the value is replaced with an empty string.

The example column names in the above are:
```
"first_name, last_name, customer_city, hire_year"
```

This will represent to the parser that it should expect 3 columns and it will parse the values into an object with 3 properties: **first_name**, **last_name**, **customer_city**.

Once the columns are defined, we can pass in corresponding delimited data.

The example data in the command line above are:
```
"\"john\", \"smith\", \"Davenport, FL\", 2017"
```

Note the string is in double quotes with the inner double quotes escaped. This is impractical if your data is coming from another tool, in which case, you can also pass it in single quotes:
```
'"john", "smith", "Davenport, FL", 2017'
```

Note in both of the above examples, the column "Davenport, FL" is treated as a single column (and is not delimited by the comma since it is quoted.)

Regardless of how you pass the string, the object above is represented as the following object once it is parsed.

```
{
  "first_name": "john",
  "last_name": "smith",
  "customer_city": "Davenport, FL",
  "hire_year": "2017"
}
```

When you run this **demo-simple.hbs** template with the data above, the results are:
```
{  "customerName": "john smith",  "customerCity": "Davenport, FL",  "fteSince": 2017 }
```

What just happened? The template mustached variables were replaced with data coming from the passed delimited string!

Of course, this is a very simple example, but in practice the input data can be any delimited string with as many columns as necessary so long as a matching columnLayout is also passed.

### Data File Example: simple-csv-01.txt

The example data file contains a header row with column names plus delinited (CSV) record rows as follows:

```text
first_name, last_name, customer_city, hire_year
"john", "smith", "Davenport, FL", 2017
"mary", "jones", "Orlando, FL", 2019
"pete", "parker", "Lakeland, FL", 2018
```

You would transform with the above file that contains a column header row using the **-n** command line argument to let the script infer your column names.

It is also possible to use a file without headers, for example:
```text
"john", "smith", "Davenport, FL", 2017
"mary", "jones", "Orlando, FL", 2019
"pete", "parker", "Lakeland, FL", 2018
```

You would transform with the above file that does not have a column header row using the **-c "first_name, last_name, customer_city, hire_year"** command line argument.

## Regex Replacement Examples

Both the transformDelimited and transformJSON variants of this package support passing in a Regex replacement. This package supports standard JavaScript Regex patterns and replacements.

Regex replacements can be as simple or as complex as needed!

Considerations:
- The Regex replacement happens BEFORE JSON/COLUMN parsing.
- If you are doing a JSON transform, ensure your Regex replacement results in VALID JSON.
- If you are doing an XSV transform, ensure your Regex replacement results in the proper number of columns and string quotes.

**Example 1 - Simple**
- Passing: `-m 'John' -r 'Johnnn'`
  When receiving the following input: (pretty printed for illustration only. Note matches should be on the same line of the file since the Regex will be applied one line at a time!)
  
  ```json
  {"customer": {"name": "John"}}
  ```
  
  Results in the following JSON before the rest of the package acts on your data: (pretty printed for illustration only. the return will be exactly as you passed, but with replacements.)
  
  ```json
  {"customer": {"name": "Johnnn"}}
  ```

**Example 2 - Complex**
- Passing: `-m '"rv(\d\d)".*?:' -r '"rv":$1,"rvdata":'`
  When receiving the following input: (pretty printed for illustration only. Note matches should be on the same line of the file since the Regex will be applied one line at a time!)
  
  ```json
  {
    "rvs": {
      "rv18": {
        "RvVgs": {"stops":  7}
      }
    }
  }
  ```
  
  Results in the following JSON before the rest of the package acts on your data: (pretty printed for illustration only. the return will be exactly as you passed, but with replacements.)
  
  ```json
  {
    "rvs": {
      "rv": 18,
      "rvdata": {
        "RvVgs": {"stops":  7}
      }
    }
  }
  ```
  
**Example 3 - Simple**
- Passing: `-m 'John' -r 'Johnnn'`
  When receiving the following input: (pretty printed for illustration only. Note matches should be on the same line of the file since the Regex will be applied one line at a time!)
  
  ```csv
  "john", "smith", "Davenport, FL", 2017
  ```
  
  Results in the following JSON before the rest of the package acts on your data: (pretty printed for illustration only. the return will be exactly as you passed, but with replacements.)
  
  ```csv
  "Johnnn", "smith", "Davenport, FL", 2017
  ```

**Example 4 - Complex**
- Passing: `-m '^(.*?),(.*?),(.*?),(.*?)$' -r '$1,$2,$3,$4,"full time"'`
  When receiving the following input: (pretty printed for illustration only. Note matches should be on the same line of the file since the Regex will be applied one line at a time!)
  
  ```csv
  "john", "smith", "Davenport, FL", 2017
  ```
  
  Results in the following JSON before the rest of the package acts on your data: (pretty printed for illustration only. the return will be exactly as you passed, but with replacements.)
  
  ```csv
    "john", "smith", "Davenport, FL", 2017, "full time"
  ```
  (Essentially, you add one more column to every row! Note that in this case, you would need to pass -c to define the columns properly otherwise, you'll get a column mismatch error.)

## Running Tests

From the root of this project, run `npm test` to execute all the tests in the **tests** sub-directory.

## Publishing this Package to the NPM Registry

In order to publish to NPM, you must first login with:
```
$ npm login
```
You'll be prompted for username and password for npmjs.com. You should use the NPM user valtech-sd.

After login:
```bash
$ npm version patch
$ npm publish
```

## Roadmap

* Add -s --skipLines for the **\*-file.js** scripts to allow the scripts to skip one or more lines in input files.
* (maybe,low) Add GROK support and a transformGROK.js script. There is a GROK Node library that uses the same underlying Regex library as logstash. See the PR for a recent version update (we might fork.) 
  * Why GROK? It's a nice way to apply many regular expressions to a single string to break it out into a rich object. There are also over 200 existing GROK patterns for mostly log patterns.
