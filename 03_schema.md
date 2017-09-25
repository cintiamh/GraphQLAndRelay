# The GraphQL Schema

1. [The schema object](#the-schema-object)
2. [Introspection](#introspection)
3. [The type system](#the-type-system)

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

The `description` property is used to give clients some details about an object.
When clients read the schema information, the description of each object will be available to them.

When we try to use a field that is now documented with a description property in GraphiQL, that description appears in a dropdown.

Descriptions also show up in the Docs section of GraphiQL
For every field, we can see its type and description.

This reading of meta information about our schema is possible because of the introspective nature of GraphQL servers.
We can use a GraphQL query to ask about the GraphQL schema and what capabilities that schema supports.

```graphql
query TypeFields {
  __type(name: "RootQuery") {
    fields {
      name
      description
      args: {
        name
      }
    }
  }
}
```

The `__type` is a built-in introspective field that should be available in any GraphQL implementation.
The double underscores naming convention is reserved for the introspective system to avoid naming collisions with user-defined GraphQL types.
Anything that starts with double underscores is part of the introspective API.

The GraphQL specification document encourages GraphQL tool writers to support Markdown rendering for the description field in their tools.

The `__schema` field is available on the root type of a query.

For example, if we didn't know the name of the `RootQuery` type, we can use the `__schema` field to find it:
```graphql
query QueryTypeName {
  __schema {
    queryType {
      name
    }
  }
}
```

Response:
```json
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "RootQuery"
      }
    }
  }
}
```

We can also use the introspective API to read other capabilities of a GraphQL schema.

## The type system

GraphQL is a strongly-typed language, and a GraphQL schema should have types for all objects that it uses.

### Scalars and object types

The `GraphQLFieldConfig` object defines a field's type property to be `GraphQLOutputType`.
An output type in GraphQL can be one of the following:

* A custom type, like `EmployeeType`.
* `GraphQLScalarType`: represents a scalar value that cannot have fields of its own.
  - `GraphQLInt`: integer
  - `GraphQLFloat`: float
  - `GraphQLString`: string
  - `GraphQLBoolean`: Boolean
  - `GraphQLID`: identity value
* An instance of an object type class, like `GraphQLObjectType`.

### Interfaces and unions

Interfaces and unions are abstract types that can be used to group other types.
* Interface: used when there are common fields declares on the types of a group. Defines the fields an implementation will contain.
* Union: used when there are no common fields declared on the types of a group. Defines a list of different implementations.

Let's suppose we have something like:
```graphql
const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: {
    name: { type: GraphQLString },
    departmentName: { type: GraphQLString }
  }
});

const VendorType = new GraphQLObjectType({
  name: 'Vendor',
  fields: {
    name: { type: GraphQLString },
    companyName: { type: GraphQLString }
  }
});
```

We can extract a common `PersonType` to a interface:
```graphql
const PersonType = new GraphQLInterfaceType({
  name: 'Person',
  fields: {
    name: { type: GraphQLString }
  }
});
```

And use `PersonType` in the previous examples:
```graphql
const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: {
    departmentName: { type: GraphQLString }
  },
  interfaces: [PersonType]
});

const VendorType = new GraphQLObjectType({
  name: 'Vendor',
  fields: {
    companyName: { type: GraphQLString }
  },
  interfaces: [PersonType]
});
```

Let's add a new type that uses our `PersonType` directly:
```graphql
const ContactType = new GraphQLObjectType({
  name: 'Contact',
  fields: {
    person: PersonType,
    phoneNumber: { type: GraphQLString },
    emailAddress: { type: GraphQLString }
  }
});
```

We can use inline fragments to conditionally ask for `departmentName` or `companyName`:
```graphql
query ContactQuery($contactId: Int!) {
  contact(contactId: $contactId) {
    person {
      name
      ... on Employee {
        departmentName
      }
      ... on Vendor {
        companyName
      }
    },
    phoneNumber,
    emailAddress
  }
}
```
