# The GraphQL Schema

1. [The schema object](#the-schema-object)
2. [Introspection](#introspection)
3. [The type system](#the-type-system)
4. [The resolve function](#the-resolve-function)

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

When we want to group two objects that don't have any fields in common with a certain logic, a GraphQL union is what we can use.

Example composing a resume:
```graphql
const EducationType = new GraphQLObjectType({
  name: 'Education',
  fields: () => ({
    schoolName: { type: GraphQLString },
    fieldOfStudy: { type: GraphQLString },
    graduationYear: { type: GraphQLInt }
  })
});

const ExperienceType = new GraphQLObjectType({
  name: 'Experience',
  fields: () => ({
    companyName: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString }
  })
});
```

We can use a union to represent a resume section that can be either an education type or a experience type:
```graphql
const ResumeSectionType = new GraphQLUnionType({
  name: 'ResumeSection',
  types: [ExperienceType, EducationType],
  resolveType(value) {
    if (value instanceof Experience) {
      return ExperienceType;
    }
    if (value instanceof Education) {
      return EducationType;
    }
  }
})
```

When we have a union type in a GraphQL schema, we can use inline fragments to ask about the fields of the types that the union represents.
```graphql
query ResumeInformation {
  ResumeSection {
    ... on Education {
      schoolName,
      fieldOfStudy
    }
    ... on Experience {
      companyName,
      title
    }
  }
}
```

### Type modifiers

* `GraphQLList`: When we wrap other types with `GraphQLList` instance, we are representing a list of those types.
  - `new GraphQLList(GraphQLInt)`
* `GraphQLNonNull`: When we wrap other types with a `GraphQLNonNull` instance, we are representing the non-null verion of those types. This wrapper enforces that the value it wraps is never null, and the type will raise an error if the value happens to be null.
  - `name: { type: new GraphQLNonNull(GraphQLString) }`

These two type modifiers are also known as type makers because they make a new type, which wraps the original type.

### Enums

When the scalar value that we want to represent for a field has a list of possible values in a set, and it can only be one of those values, we can represent the field in a GraphQL schema as an ENUM type.

For example, an employee's contract can be full-time, part-time, of shift-work.
```graphql
const ContractType = new GraphQLEnumType({
  name: 'Contract',
  values: {
    FULLTIME: { value: 1 },
    PARTTIME: { value: 2 },
    SHIFTWORK: { value: 3 }
  }
});
```

`ContractType` is a new custom type we can now use on the `EmployeeType`:
```graphql
const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: {
    name: { type: GraphQLString },
    contractType: ContractType
  }
});
```

Let's introduce a new type `DepartmentType`. For this type, we'll use the `ContractType` to represent the list of allowed contract types in a department:
```graphql
const DepartmentType = new GraphQLObjectType({
  name: 'Department',
  fields: {
    name: { type: GraphQLString },
    contractTypes: new GraphQLList(ContractType),
  }
});
```

## The resolve function
