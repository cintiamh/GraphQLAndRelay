# The Query Language

1. [Documents and operations](#documents-and-operations)
2. [Fields](#fields)

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
