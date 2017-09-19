const { graphql } = require('graphql');
const readline = require('readline');
const mySchema = require('./schema/main');

const { MongoClient } = require('mongodb');
const assert = require('assert');

const MONGO_URL = 'mongodb://localhost:27017/test';

const graphqlHTTP = require('express-graphql');
const express = require('express');

const app = express();

// const rli = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

MongoClient.connect(MONGO_URL, (err, db) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB server');

  app.use('/graphql', graphqlHTTP({
    schema: mySchema,
    context: { db },
    graphiql: true
  }));

  app.listen(3000, () => {
    console.log('Running Express.js on port 3000');
  });

  // rli.question('Client request: ', inputQuery => {
  //   graphql(mySchema, inputQuery, {}, { db }).then(result => {
  //     console.log('Server answer: ', result.data);
  //     db.close(() => rli.close());
  //   });
  // });
});
