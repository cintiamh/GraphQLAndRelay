# The Query Language

1. [Documents and operations](#documents-and-operations)
2. [Fields](#fields)
3. [Variables](#variables)

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
