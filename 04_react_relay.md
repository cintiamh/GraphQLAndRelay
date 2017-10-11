# Configuring React Applications to Use Relay

1. [The example GraphQL schema](#the-example-graphql-schema)
2. [The quotes library](#the-quotes-library)

## The example GraphQL schema

```
$ mkdir relay-project
$ cd relay-project
$ npm init -y
$ npm i graphql --save
$ mkdir schema && touch schema/main.js
```

Schema/main.js content:
```javascript
const {
   GraphQLSchema,
   GraphQLObjectType,
   GraphQLString,
   GraphQLInt,
   GraphQLList,
   GraphQLBoolean,
   GraphQLEnumType
} = require('graphql');

const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    usersCount: {
      description: 'Total number of users in the database',
      type: GraphQLInt,
      resolve: (_, args, { db }) => db.collection('users').count()
    }
  }
});

const mySchema = new GraphQLSchema({
  query: queryType
});

module.exports = mySchema;
```

Setting up the MongoDB in your project with express:
```
$ npm i mongodb --save
$ npm i express express-graphql --save
$ touch index.js
```

index.js content:
```javascript
const { MongoClient } = require('mongodb');
const assert = require('assert');
const graphqlHTTP = require('express-graphql');
const express = require('express');

const app = express();
const mySchema = require('./schema/main');
const MONGO_URL = 'mongodb://localhost:27017/test';

MongoClient.connect(MONGO_URL, (err, db) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB server');

  app.use('/graphql', graphqlHTTP({
    schema: mySchema,
    context: { db },
    graphiql: true
  }));

  app.listen(3000, () =>
    console.log('Running Express.js on port 3000')
  );
});
```

This schema assumes the existence of a MongoDB collection named `users`, which is defined under a local database named `test`.

Starting up the MongoDB:
```
$ mongod
$ node index.js
```

Check the url: http://localhost:3000/graphql
And run the test query:

```graphql
query TestQuery {
  usersCount
}
```

## The quotes library
