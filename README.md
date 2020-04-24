# log-transformation-library

## Summary

This repository is to maintain the code that transforms logs from a given input file and then outputs it to a new format ready for ingestion in a logging pipeline.

## Dependencies

The NPM packages are committed to the repo, but if you're having problems, try `npm i`.

## transform.js

The script **transform.js** is a transformation script. This script uses a handlebars/mustache template to 
transform JSON passed as a string in the command line into another format determined by the template!

To learn more about handlebars/mustache template transformations, see the [HandlebarsJS website](https://handlebarsjs.com/guide/).

The transform script can be called like this:

```bash
$  node ./transform.js -t 'demo-simple.json' -i '{"customer": {"name": "John"}}'
```

The command line arguments are:
- -t :the name of the template file to use for the transformation. The template file must be present in the **templates** sub-directory.
- -i :a valid json string which will be used as context data in the transformation. If the string you pass canot be parsed as JSON (using `JSON.parse()`), the script will terminate and return an error.

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
'{"customer": {"name": "John"}}'
```

Note that the string is wrapped by single quotes. This is so that it is passed into the script as a single string.

You could also wrap it in double quotes if you escape the inner double quotes (though this is impractical if your data is coming from another tool.)
```
"{\"customer\": {\"name\": \"John\"}}"
```

Regardless of how you pass the string with json data, the object above is represented as the following object once `JSON.parse()` parses it.

```
{
  "customer": {
    "name": "john"
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

## Running Tests

From the root of this project, run `npm test` to execute all the tests in the **tests** sub-directory.