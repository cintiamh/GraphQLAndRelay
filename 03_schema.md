# The GraphQL Schema

1. [The schema object](#the-schema-object)
2. [Introspection](#introspection)

In a GraphQL schema, we define the types and directives that we want the server to support.

## The schema object

A GraphQL schema can be defined as an instance of the `GraphQLSchema` class.
The schema is a representation of the capabilities of a GraphQL server starting from the root fields.

```javascript
const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    hello: {
      // ...
    },
    diceRoll: {
      // ...
    },
    usersCount: {
      // ...
    }
  }
});
const mySchema = new GraphQLSchema({
  query: queryType
});
```

Official website: http://graphql.org/

The constructor of the `GraphQLSchema` class expects a configuration object:
```
class GraphQLSchema {
  constructor(config: GraphQLSchemaConfig)
}
```

This `config` object can have one or two properties:
```
type GraphQLSchemaConfig = {
  query: GraphQLObjectType;
  mutation?: ?GraphQLObjectType;
};
```

When we query our GraphQL server, we can start with the fields that are defined on the root query `GraphQLObjectType`.
```
class GraphQLObjectType {
  constructor(config: GraphQLObjectTypeConfig)
}
type GraphQLObjectTypeConfig = {
  name: string;
  description?: ?string;
  fields: GraphQLFieldConfigMapThunk | GraphQLFieldConfigMap;
  interfaces?: ...;
}
```

An `AbcThunk` is just a function that returns `Abc`.
```javascript
GraphQLFieldConfigMapThunk = () => GraphQLFieldConfigMap;
```

We can use the `thunk` function expression syntax when two types need to refer to each other, or when a type needs to refer to itself in a field.

A GraphQL field configuration map is an object that holds a list of fields, and every field is a configuration object.
```
type GraphQLFieldConfigMap = {
  [fieldName: string]: GraphQLFieldConfig;
}
```

A field configuration object is a simple one:
```
type GraphQLFieldConfig = {
  type: GraphQLOutputType;
  description?: ?string;
  args?: GraphQLFieldConfigArgumentMap;
  resolve?: GraphQLFieldResolveFn;
  deprecationReason?: string;
}
```

## Introspection
