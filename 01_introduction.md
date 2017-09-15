# An Introduction to GraphQL and Relay

GraphQL provides a common interface between client and server applications for fetching and manipulating data.

Relay is a JavaScript framework that uses GraphQL to enable React applications to communicate their data requirements in a declarative way.

## What is GraphQL?

* GraphQL is a language.
* GraphQL is a runtime - translator of GraphQL language.

GraphQL is designed to play well with other backend languages.
We can implement GraphQL as a layer on top of any existing server logic.
This layer will enable the server to understand GraphQL requests and pass them down to its existing logic to fetch data and fulfill the original requests.

GraphQL language is very close to JSON.

GraphQL operations:
* query: read operation
* mutation: write operation

The operation is a simple string that a GraphQL service can parse and respond to with data in a specific format.

Example of a GraphQL query:
```graphql
{
  user(id: 42) {
    firstName
    lastName
    email
  }
}
```

Possible JSON response:
```json
{
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
}
```
