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
