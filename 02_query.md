# The Query Language

1. [Documents and operations](#documents-and-operations)
2. [Fields](#fields)
3. [Variables](#variables)
4. [Directives](#directives)
5. [Aliases](#aliases)
6. [Fragments](#fragments)
7. [Mutations](#mutations)

## Documents and operations

To communicate with a GraphQL service, we send it a text document written in the GraphQL query language.

A GraphQL document contains one or more operations, and these operations can be:
* read => queries
* write => mutations

A query example:
```graphql
# Find one article and its list of comments:
query ArticleComments {
  article(articleId: 42) {
    comments: {
      commentId
      formattedBody
      timestamp
    }
  }
}
```

* By default, the type of operation is a query.
* If there is only one simple operation in the document, the name can be omitted.
* The query name can be anything and it's optional for a single query.
* A GraphQL document may contain multiple operations, in which case the name of the desired operation to be executed must be provided.
* In addition to queries and mutations, a GraphQL document can also contain fragments.
* Most of the query language elements are expressed using ASCII characters, but Unicode characters are acceptable inside string values and comments.

The GraphQL parser will ignore the following tokens:
* comments: any text that appears between a `#` marker and a line terminator,
* line terminators,
* commas,
* most white spaces.

## Fields

Here is a possible response to the `ArticleComments` query:
```json
{
  "article": {
    "comments": [
      {
        "commentId": 1,
        "formattedBody": "GraphQL is <strong>cool</strong>",
        "timestamp": "12/12/2015 - 15:15"
      },
      {
        "commentId": 2,
        "formattedBody": "What's wrong with <em>REST</em>!",
        "timestamp": "12/12/2015 - 15:25"
      }
    ]
  }
}
```

This response has sections that represent the different fields in our GraphQL query.

A field can be mapped to either a primitive value, in the response, or to an object or array of objects in the response.

You can think of fields as functions; they return something in the response.

They also take arguments, for example the `article` fields takes an integer argument `articleId`.

On the server side, we can use field arguments to customize the response to be resolved by the field.

The `article` field is also a property on what is called the `root query object`.
A `root query object` is an entry point; one of the possible many points on the graph that we can start with in our queries.

* `selection sets`: the curly braces in the GraphQL query. Selection sets are nestable.
* `complex fields`: fields that map to objects or an array of objects in GraphQL.

When we ask for a complex field, we need a new selection set until the innermost selection set of the GraphQL query that contain fields that resolve to scalar values.

A common error message when this doesn't happen is: `Field "article" of type "Article" must have a sub selection.`

## Variables

In the example above we hardcoded the value of `articleId` in the query string itself.

To make the query reusable, we need to make it generic by using GraphQL variable as the input for `articleId`:

```graphql
query ArticleComments($articleId: Int!) {
  article(articleId: $articleId) {
    comments: {
      commentId
      formattedBody
      timestamp
    }
  }
}
```

Notice how we first define the variable at the top of our query operation (`$articleId: Int!`).
This sets the scope of the variable `$articleId` so that we can use it anywhere inside our query operation.
The type of `$articleId` variable is `Int`; the trailing `!` after the type indicates that this variable is required and can't be null.

To execute the generic query, we supply a JSON object for the `variables` input which we pass to our GraphQL query executor along with the `query` input.

```json
{
  "articleId": 42
}
```

For an HTTP interface, our operation request can be send as:
```
/graphql?query={...}&variables={...}
```

* Variables have to be unique in a single operation.
* We can use the same variable name in different operations.
* If we define a variable, it has to be used at least once in that operation.

## Directives

We can provide options to alter the GraphQL runtime execution using directives.
Directives have three characteristics:

* A unique name to identify them.
* A list of arguments, just like fields. Arguments may accept values of any input type.
* A list of locations where the use of the directive is accepted.

There are two main built-in directives that should be supported by a GraphQL executor:

* `@include`, which accepts a Boolean `if` argument, and directs the GraphQL executor to include a field or a fragment only when the `if` argument is true.
  - `field @include(if: $BooleanValue)`
* `@skip`, which accepts a Boolean `if` argument, and directs the GraphQL executor to skip a field or fragment when the `if` argument is true.
  - `field @skip(if: $BooleanValue)`

Directives are commonly used with variables to customize the response based on variable's values.

```graphql
query ArticleComments($articleId: Int!, $showEmails: Boolean!) {
  article(articleId: $articleId) {
    comments: {
      commentId
      formattedBody
      timestamp
      author {
        name
        email @include(if: $showEmails)
        website @skip(if: $showEmails)
      }
    }
  }
}
```

We can use directives with complex fields as well.
```graphql
query ArticleComments($articleId: Int!, $showAuthor: Boolean!) {
  article(articleId: $articleId) {
    comments: {
      commentId
      formattedBody
      timestamp
      author @include(if: $showAuthor) {
        name
      }
    }
  }
}
```

## Aliases

Sometimes, the data exposed by the server might have different property names than what the UI is using.

For example, if the UI expects to receive `responses` instead of `comments`:
```json
{
  "post": {
    "responses": [
      {
        "responseId": 1,
        "formattedBody": "GraphQL is <strong>cool</strong>",
        "timestamp": "12/12/2015 - 15:15"
      },
      {
        "responseId": 2,
        "formattedBody": "What's wrong with <em>REST</em>!",
        "timestamp": "12/12/2015 - 15:25"
      }
    ]
  }
}
```

We can use aliases on any field to customize its appearance in the response:
```graphql
query ArticleResponses {
  post: article(articleId: 42) {
    responses: comments {
      responseId: commentId
      formattedBody
      timestamp
    }
  }
}
```

We can also use aliases to ask for the same field multiple times:
```graphql
query TwoArticles: {
  firstArticle: article(articleId: 42) {
    comments {
      commentId
      formattedBody
      timestamp
    }
  }
  secondArticle: article(articleId: 43) {
    comments {
      commentId
      formattedBody
      timestamp
    }
  }
}
```

## Fragments

We can use GraphQL fragments to avoid repetition and compose our main query using a smaller query fragment.
```graphql
query TwoArticles {
  firstArticle: article(articleId: 42) {
    ...CommentList
  }
  secondArticle: article(articleId: 43) {
    ...CommentList
  }
}

fragment CommentList on Article {
  comments {
    commentId
    formattedBody
    timestamp
  }
}
```

A fragment is just a partial operation; we can't use it on its own, but we can use it and reuse it inside a full operation.

When a GraphQL server sees the spread operator followed by a name anywhere in a GraphQL query, it will look for a fragment defined using that same name.

We can use variables in fragments. When a fragment gets used by an operation, it gets access to the variables defined by that operation.
```graphql
query TwoArticles($showAuthor: Boolean!) {
  firstArticle: article(articleId: 42) {
    ...CommentList
  }
  secondArticle: article(articleId: 43) {
    ...CommentList
  }
}

fragment CommentList on Article {
  comments {
    commentId
    formattedBody
    timestamp
    author @include(if: $showAuthor) {
      name
    }
  }
}
```

We can also use fragments directly inline without giving them a name:
```graphql
query ArticleOrComment {
  node(nodeId: 42) {
    formattedBody
    timestamp
    ... on Article {
      nodeId: articleId
    }
    ... on Comment {
      nodeId: commentId
    }
  }
}
```

Inline fragments are useful inside a type that implements multiple objects.

The `node` field is part of Relay and it can represent any object in the GraphQL schema.

Inline fragments can also be used to apply a directive to a group of fields.

## Mutations

GraphQL updates data using mutations.

Resolving the mutation will have side effects on some elements of the data on runtime.

A good GraphQL runtime implementation executes multiple GraphQL mutations in a single request in sequence one by one, while it executes multiple GraphQL queries in the same request in parallel.

For mutations, we can use field arguments as data input.
```graphql
mutation AddNewComment {
  addComment(
    articleId: 42,
    authorEmail: 'mark@fb.com',
    markdown: "GraphQL is clearly a **game changer**"
  ) {
    id
    formattedBody
    timestamp
  }
}
```
