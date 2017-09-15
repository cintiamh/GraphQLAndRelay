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

## What is Relay?

Relay is a framework for building data-driven React applications.

Example React component with its Relay data requirements:
```react
const UserCard = ({ user }) =>
  <div className="user-card">
    Name: {user.firstName} {user.lastName}
    Email: {user.email}
  </div>;

UserCard = Relay.createContainer(UserCard, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        firstName
        lastName
        email
      }
    `
  }
});
```

## Why GraphQL?

Some tasks an Application Programming Interface (API) can do:
* Act as a controller between protected raw data services and software clients.
* Parse a client request for access rights and enforce them.
* Construct SQL join statements to satisfy a client request efficiently.
* Process raw data into structures demanded by clients.
* Respond with data in specific formats such as JSON and XML.

### RESTful APIs versus GraphQL APIs

RESTful APIs come with some dependencies on browser implementations of HTTP.
Using only HTTP methods and response codes limits what we can do with RESTful APIs and developers usually resort to customizing and interpreting the request payload instead.

GraphQL is protocol-agnostic and does not depend on HTTP.
However, HTTP is one channel where we can do GraphQL communication.
