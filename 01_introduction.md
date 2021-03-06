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

There are many GraphQL implementations (JavaScript, Java, Ruby, Scala, Python, etc).

We'll be using the JavaScript implementation: https://github.com/graphql/graphql-js

### Installing Node.js

NVM (Node version manager) targets the task of managing multiple Node.js versions.

* `node`: we use this command to execute a JavaScript file on the server.
* `npm`: we use this command to install, uninstall, or update a Node.js package.

### Defining the Schema

Create the directory:
```
$ mkdir graphql-project
$ cd graphql-project
$ touch .gitignore
```

`.gitignore` file content:
```
.DS_Store
.idea
*.iml
node_modules
package-lock.json
```

Create a `package.json` file:
```
$ npm init -y
```

Install the `graphql` library:
```
$ npm i graphql --save
```

Create a `schema` directory at the root level and create a `main.js` file there.
```
$ mkdir schema && touch schema/main.js
```

We need to import a few classes in `main.js` from the `graphql` package:
```javascript
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
```

The `GraphQLSchema` is the class we can use to instantiate our example schema.
```javascript
const mySchema = new GraphQLSchema({
  // root query & root mutation definitions
});
```

A GraphQL schema can expose multiple capabilities:
* read data: we need to define a query property on the schema.
* insert, update, or delete: we need to define a mutation property on the schema.

The query and mutation properties are instances of the `GraphQLObjectType` class.
```javascript
const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields:{
    hello: {
      type: GraphQLString,
      resolve: () => 'world'
    }
  }
});
```

Under the `queryType` definition, update the `mySchema` object to use `queryType` for its `query` configuration property:
```javascript
const mySchema = new GraphQLSchema({
  query: queryType
});
```

The `fields` property on a GraphQL object is where we define the fields that can be used in a GraphQL query to ask about that object.

Every field in a GraphQL object can define a `resolve()` function. The `resolve()` function is what the `graphql` library executes when it tries to answer queries asking about that field.

### Using the schema

We need to create an interface between the user and the schema.
* user input: GraphQL query
* output for user: GraphQL JSON response

Example with simplest interface using Linux command.

Create an `index.js` file:
```
$ touch index.js
```

With the following content:
```javascript
const { graphql } = require('graphql');
const readline = require('readline');
const mySchema = require('./schema/main');

const rli = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rli.question('Client request: ', inputQuery => {
  graphql(mySchema, inputQuery).then(result => {
    console.log('Server answer: ', result.data);
  });
  rli.close();
});
```

And then when you run the server side:
```
$ node index.js
$ Client request: { hello }
$ Server answer:  { hello: 'world' }
```

#### Rolling the Dice

We will make it simulate a simple 2-dice roll:

We expect to get:
```
$ node index.js
$ Client request: { diceRoll }
$ Server answer:  { diceRoll: [2, 5] }
```

We use a `GraphQLList` to represent an array type, and `GraphQLInt` type to represent the elements of our random integers array.

Update the `schema/main.js`:
```javascript
const {
  // ...
  GraphQLInt,
  GraphQLList
} = require('graphql');

const roll = () => Math.floor(6 * Math.random()) + 1;

const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields:{
    // ...
    diceRoll: {
      type: new GraphQLList(GraphQLInt),
      resolve: () => [roll(), roll()]
    }
  }
});
```

#### Using field arguments

The client can ask a query such as:
```
{ diceRoll(count: 5) }
```

In `schema/main.js` you can update the diceRoll query:

```javascript
diceRoll: {
  type: new GraphQLList(GraphQLInt),
  args: {
    count: { type: GraphQLInt }
  },
  resolve: (_, args) => {
    let rolls = [];
    for (let i = 0; i < args.count; i++) {
      rolls.push(roll());
    }
    return rolls;
  }
}
```

You can also set a defaultValue:
```javascript
args: {
  count: { type: GraphQLInt },
  defaultValue: 2
},
```

### Setting up MongoDB

Install mongoDB using Homebrew:
```
$ brew install mongodb
$ sudo mkdir -p /data/db
$ sudo chown -R $USER /data
```

Start the MongoDB server:
```
$ mongod
```

If everything worked fine, we'll be able to test the `mongo` CLI:
```
$ mongo
> db.getName()
test
>
```

Let's create a new collection to hold some test data.

```
> db.createCollection("users")
{ "ok" : 1 }
>
```

Now we can use the `users` collection to add documents that represent users:
```
> db.users.insertOne({
    firstName: "John",
    lastName: "Doe"
  })
```

We get the answer:
```
{
  "acknowledged" : true,
  "insertedId" : ObjectId("59c190140b511f7a57be21f8")
}
```

Inserting a second user:
```
> db.users.insertOne({
... firstName: "Jane",
... lastName: "Doe",
... })
```

We can now verify the number of users:
```
> db.users.count()
2
```

To communicate with a MongoDB from a Node.js application, we need to install a driver.

https://mongodb.github.io/node-mongodb-native/

```
$ npm i mongodb --save
```

Now we can use this `mongodb` npm package in our `index.js` file:
```javascript
const { MongoClient } = require('mongodb');
const assert = require('assert');

const MONGO_URL = 'mongodb://localhost:27017/test';

MongoClient.connect(MONGO_URL, (err, db) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB server');

  // The readline interface code
});
```

We can start with a simple query to check the users count:
```
{ usersCount }
```

To be able to use a MongoDB driver call inside our schema in `main.js` file, we need access to the `db` object that the `MongoClient.connect()` function exposed for us in the callback.

Update the `index.js` file:
```javascript
graphql(mySchema, inputQuery, {}, { db }).then(result => {
  console.log('Server answer: ', result.data);
  db.close(() => rli.close());
});
```

And the fields in main.js:
```javascript
fields: {
  // ...
  usersCount: {
    type: GraphQLInt,
    resolve: (_, args, { db }) =>
      db.collection('users').count()
  }
}
```

### Setting up an HTTP interface

We can use the `Express.js` node framework to handle and parse HTTP requests, and within an `Express.js` route, we can use the `graphql()` function.

There is a GraphQL Express.js middleware we can use: `express-graphql`.

```
$ npm i express express-graphql --save
```

Now we can use them in our `index.js` server file:
```javascript
const graphqlHTTP = require('express-graphql');
const express = require('express');

const app = express();
```

At this point, we'll use Express.js routing instead of the command line:
```javascript
app.use('/graphql', graphqlHTTP({
  schema: mySchema,
  context: { db }
}));

app.listen(3000, () => {
  console.log('Running Express.js on port 3000');
});
```

The `app.use` line defines a route `/graphql` and delegates the handling of that route to the `express-graphql` middleware.

Now we're able to access this URL in the browser:
http://localhost:3000/graphql?query={usersCount}

### The GraphiQL editor

The `graphqlHTTP()` middleware function accepts another property on its parameter object `graphiql`:

Update the `index.js` file:
```javascript
app.use('/graphql', graphqlHTTP({
  schema: mySchema,
  context: { db },
  graphiql: true
}));
```

Now if you access http://localhost:3000/graphql, we'll get an instance of the GraphiQL editor running locally on our GraphQL schema.

GraphiQL is an interactive playground where we can explore our GraphQL queries and mutations before we officially use them.
