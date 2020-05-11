# super-transformer

![NPM CI+Build+Test](https://github.com/valtech-sd/super-transformer/workflows/NPM%20CI+Build+Test/badge.svg?event=push)

## Summary

This package provides scripts to transform incoming strings using templates. It receives string representations of various formats (JSON, CSV) and returns a string after transforming the incoming data.

A complete example of how to use this package in your own project is available at: https://github.com/valtech-sd/super-transformer-example

## Dependencies

The NPM packages are committed to the repo, but if you're having problems, try `npm i`.

## transformJSON.js

The script **transformJSON.js** is a transformation script. This script uses a handlebars/mustache template to transform JSON passed as a string in the command line into another format determined by the template!

To learn more about handlebars/mustache template transformations, see the [HandlebarsJS website](https://handlebarsjs.com/guide/).

The transform script can be called like this:

```bash
$  node ./transformJSON.js -t "./template-examples/demo-simple.json" -i "{\"customer\": {\"name\": \"John\"}}"
```

The command line arguments are:
- -t :the full path of the template file to use for the transformation. 
- -i :a valid json string which will be used as context data in the transformation. If the string you pass cannot be parsed as JSON (using `JSON.parse()`), the script will terminate and return an error.

### Template Example: demo-simple.json

Handlebars supports many rich template substitutions. To learn more about handlebars/mustache template transformations, see the [HandlebarsJS website](https://handlebarsjs.com/guide/).

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

When you run this **demo-simple.json** template with the data above, the results are:
```
{ "customerName": "John" }
```

What just happened? The template mustached variables were replaced with data coming from the passed JSON object!

Of course, this is a very simple example, but in practice the data object can be any JSON structure even containing arrays, 
nested objects, etc.

## transformDelimited.js

The script **transformDelimited.js** is a transformation script. This script uses a handlebars/mustache template to transform a delimited string (CSV or otherwise) passed as a string in the command line into another format determined by the template!

To learn more about handlebars/mustache template transformations, see the [HandlebarsJS website](https://handlebarsjs.com/guide/).

The transform script can be called like this:

```bash
$  node ./transformDelimited.js -t "./template-examples/demo-simple-flat.json" -i '"john", "smith", "Davenport, FL", 2017' -d "," -c "first_name, last_name, customer_city, hire_year"
```

The command line arguments are:
- -t :the full path of the template file to use for the transformation. 
- -i :a valid delimited string which will be used as context data in the transformation. Note that column values that contain the delimiter must be quoted to avoid being parsed as another column.
- -d :a character delimiter that is used in your input.
- -c :a string that represents the column names for your input. Do not quote the various column names individually. This should be a single string (and the string itself should be quoted.) This should not be used if the '-n' argument is also used.
- -n :a flag to tell the script to infer column names. Should not be used with the '-c' argument.

### Template Example: demo-simple-flat.json

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

When you run this **demo-simple.json** template with the data above, the results are:
```
{  "customerName": "john smith",  "customerCity": "Davenport, FL",  "fteSince": 2017 }
```

What just happened? The template mustached variables were replaced with data coming from the passed delimited string!

Of course, this is a very simple example, but in practice the input data can be any delimited string with as many columns as necessary so long as a matching columnLayout is also passed.


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

* Add GROK support and a transformGROK.js script. There is a GROK Node library that uses the same underlying Regex library as logstash. See the PR for a recent version update (we might fork.) 
  * Why GROK? It's a nice way to apply many regular expressions to a single string to break it out into a rich object. There are also over 200 existing GROK patterns for mostly log patterns.
