# Making GraphQL Queries Relay-Compliant

1. [Transforming GraphQL queries for Relay](#transforming-graphql-queries-for-relay)

## Transforming GraphQL queries for Relay

GraphQL queries need to be converted into JavaScript object for Relay.

Example for `AllQuotes` query:
```graphql
query AllQuotes {
  allQuotes {
    id
    text
    author
  }
}
```

Relay object repsentation:
```json
{
  "name": "AllQuotes",
  "fieldName": "allQuotes",
  "type": "Quote",
  "children": [
    {
      "fieldName": "id",
      "type": "String"
    },
    {
      "fieldName": "text",
      "type": "String"
    },
    {
      "fieldName": "author",
      "type": "String"
    }
  ]
}
```

We don't have to do this object conversion manually for GraphQL operations.

Relay helper: `Relay.QL`.

Relay the JavaScript tagged template literal feature to intercept a template that represents a GraphQL string and return an object instead of a String.
```javascript
Relay.QL `query { ... }` => {}
```

1. First, use the `Relay.QL` template syntax to write all GraphQL queries for clients.
2. Process all the JavaScript resources (with webpack).
3. Ask the GraphQL schema about the types for `allQuotes`, `id`, `text`, and `author` fields.
4. Use these types to generate the desired query object and return it.

Sounds simple, but requires a little configuration to make it efficient.

A Relay application will have multiple `Relay.QL` calls.

Instead of asking the GraphQL server about field types every time we want to convert a query, we can optimize this server process by caching the full schema structure into a big JSON object on the server and using the cache for the `Relay.QL` calls.

Advantage: Speeds up the webpack bundle process.
Disadvantage: need to update the cache every time schema changes.

In the `index.js` file include the following:
```javascript
const fs = require('fs');
const path = require('path');
const { introspectionQuery } = require('graphql/utilities');
```

You can actually run `console.log(introspectionQuery)` can copy the resulting text and run it on GraphiQL.

We can use the `graphql()` function to ask our schema for its response for the `introspectionQuery`.

Import the `graphql()` function again:
```javascript
const { graphql } = require('graphql');
```

Then place this snippet right before we make the express app listen on port 3000:
```javascript
graphql(mySchema, introspectionQuery)
  .then(result => {
    fs.writeFileSync(
      path.join(__dirname, 'cache/schema.json'),
      JSON.stringify(result, null, 2)
    );
    console.log('Generated cached schema.json file');
  })
  .catch(console.error);
```

Create the cache folder:
```
$ mkdir cache
```

Under the `cache` directory we should see the newly generated `schema.json` file.

You can include the `schema.json` file in your `.gitignore` list.

We are going to use `babel-relay-plugin` to read the cached content once and re-use it from memory to speed up the calls to `Relay.QL`.

Create a `babelRelayPlugin.js` file:
```
$ touch babelRelayPlugin.js
```

And add the following content:
```javascript
const babelRelayPlugin = require('babel-relay-plugin');
const schema = require('./cache/schema.json');

module.exports = babelRelayPlugin(schema.data);
```

To make use of this new plugin, add the plugins line into `.babelrc` file:
```json
{
  "passPerPreset": true,
  "presets": [
    {
      "plugins": ["./babelRelayPlugin"]
    },
    "react",
    "es2015",
    "stage-0"
  ]
}
```

The `passPerPreset` option tells Babel to execute the presets one after the other.

Now you should be able to run this anywhere inside `app.js`:
```javascript
console.log(
  Relay.QL `query AllQuotes {
    allQuotes {
      id
      text
      author
    }
  }`
)
```
