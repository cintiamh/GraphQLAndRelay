const { MongoClient } = require('mongodb');
const assert = require('assert');
const graphqlHTTP = require('express-graphql');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { introspectionQuery } = require('graphql/utilities');
const { graphql } = require('graphql');

console.log(introspectionQuery);

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

  app.use(express.static('public'));

  graphql(mySchema, introspectionQuery)
    .then(result => {
      fs.writeFileSync(
        path.join(__dirname, 'cache/schema.json'),
        JSON.stringify(result, null, 2)
      );
    })
    .catch(console.error);

  app.listen(3000, () =>
    console.log('Running Express.js on port 3000')
  );
});
