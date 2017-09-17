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

Since we use a similar language to communicate between clients and servers, debugging problems become easier.
The GraphQL specification adopts a strong type system for all GraphQL elements; any misuse can be easily detected and properly reported.

Star Wars API: http://swapi.co/

The GraphQL server will be a single endpoint that replies to all data requests, and the interface channel does not matter.

```
/graphql?query={...}
```

https://github.com/graphql/swapi-graphql

In there, try:
```graphql
{
  person(personID: 4) {
    name
    birthYear
    homeworld {
      name
    }
    filmConnection {
      films {
        title
      }
    }
  }
}
```

The response will be a JSON:
```json
{
  "data": {
    "person": {
      "name": "Darth Vader",
      "birthYear": "41.9BBY",
      "homeworld": {
        "name": "Tatooine"
      },
      "filmConnection": {
        "films": [
          {
            "title": "A New Hope"
          },
          {
            "title": "The Empire Strikes Back"
          },
          {
            "title": "Return of the Jedi"
          },
          {
            "title": "Revenge of the Sith"
          }
        ]
      }
    }
  }
}
```

## Why Relay?

Relay acts as the data manager for React applications.

With Relay, we just declare what we need to happen to the data, and Relay will do the actual steps needed to satisfy our needs.

### Understanding Relay's core principles

#### Storage and caching

Relay uses a single normalized client-side data store in memory called Relay Store.

In front of the Relay Store, Relay has a Queue Store where it manages the inflight changes to the data.

Behind the Relay Store, Relay has a Cache layer, which can be any storage engine, such as localStorage, for example.

#### Object identification

All objects in Relay have unique IDs over the entire system.

Relay also has a diffing algorithm to make data fetching as efficient as possible.

#### The connection Model

When we need to paginate a list, we have a few models we can use:

* The offset/limit model: To fetch the first 3 comments, from the list, we do offset 0, limit 3. Our next page will be offset 3, limit 3. (this option has the risk of loosing some information in case someones deletes or adds new info in between).
* The after/first model: We can also do after null, first 3. Our next page would be after C, first 3. (this solves the offset/limit problem of loosing information, because we are using the unique IDs as reference).
* The connection model: The actual data is represented as nodes within edges.

## Setting up a simple GraphQL server
