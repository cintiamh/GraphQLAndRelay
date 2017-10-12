# Configuring React Applications to Use Relay

1. [The example GraphQL schema](#the-example-graphql-schema)
2. [The quotes library](#the-quotes-library)
3. [Setting up webpack](#setting-up-webpack)
4. [Using GraphQL without Relay in React applications](#using-graphql-without-relay-in-react-applications)
5. [Relay containers](#relay-containers)

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

Start the MongoDB server (if you haven't yet):
```
$ mongod
```

Start the MongoDB CLI:
```
$ mongo
```

Create the quotes collection:
```
> db.createCollection("quotes")
```

We can use the `insertMany` collection function to insert our seed quotes:
```
> db.quotes.insertMany([
  {
    text: "The best preparation for tomorrow is doing your best today",
    author: "H. Jackson Brown"
  },
  {
    text: "If opportunity doesn't knock, build a door",
    author: "Milton Berle"
  },
  {
    text: "Try to be a rainbow in someone's cloud",
    author: "Maya Angelou"
  }
])
```

Let's now create a simple GraphQL API for this collection. Include in schema/main.js:
```javascript
const QuoteType = new GraphQLObjectType({
  name: 'Quote',
  fields: {
    id: {
      type: GraphQLString,
      resolve: obj => obj._id
    },
    text: { type: GraphQLString },
    author: { type: GraphQLString }
  }
});
```

We can use this new `QuoteType` to define our `allQuotes` root field.
```javascript
const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    // ...
    allQuotes: {
      type: new GraphQLList(QuoteType),
      description: 'A list of the quotes in the database',
      resolve: (_, args, { db }) => db.collection('quotes').find().toArray()
    }
  }
});
```

Now we are able to run:
```
$ node index.js
```

And use GraphiQL to query:
```graphql
{
  allQuotes {
    text,
    author
  }
}
```

## Setting up webpack

Install npm packages:
```
$ npm i webpack babel-loader babel-preset-es2015 babel-preset-react babel-preset-stage-0 --save
$ npm i babel-core --save
$ mkdir js
$ touch js/app.js
$ mkdir public
$ touch public/index.html
$ touch webpack.config.js
$ touch .babelrc
```

`webpack.config.js` file content.
```javascript
const path = require('path');

module.exports = {
  entry: './js/app.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};
```

`.babelrc` file content:
```
{
  "presets": [
    "react",
    "es2015",
    "stage-0"
  ]
}
```

`public/index.html` file content:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Quotes</title>
  <link rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
</head>
<body>
  <div id="react" class="container">
    Loading...
  </div>
  <script src="bundle.js"></script>
</body>
</html>
```

Include this line into index.js file:
```javascript
app.use(express.static('public'));
```

js/app.js file content:
```javascript
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  static defaultProps = {
    greeting: 'Hello'
  };
  render() {
    return (
      <div>
        {this.props.greeting} World
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('react')
)
```

Install react and react-dom:
```
$ npm i react react-dom --save
```

In package.json include the script:
```javascript
"build": "webpack",
```

And run build, and then run again (make sure mongoDB is running):
```
$ npm run build
$ node index.js
```

## Using GraphQL without Relay in React applications

We can use GraphQL directly in a React application using a simple Ajax library.
We're using a native `fetch` library.

`QuotesLibrary` component lists an array of `Quote` components.

`js/app.js`:
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Quote from './quote';

class QuotesLibrary extends React.Component {
  state = { allQuotes: [] };
  componentDidMount() {
    // Load the quotes list into this.state.allQuotes
  }
  render() {
    return (
      <div className="quotes-list">
        {this.state.allQuotes.map(quote => <Quote key={quote.id} quote={quote} />)}
      </div>
    );
  }
}
ReactDOM.render(
  <QuotesLibrary />,
  document.getElementById('react')
);
```

Create the quote component:
```
$ touch js/quote.js
```

js/quote.js:
```javascript
import React from 'react';

class Quote extends React.Component {
  render() {
    return (
      <blockquote>
        <p>{this.props.quote.text}</p>
        <footer>{this.props.quote.author}</footer>
      </blockquote>
    );
  }
}

export default Quote;
```

Now let's load the quotes using fetch in js/app.js inside componentDidMount:
```javascript
componentDidMount() {
  fetch(`/graphql?query={
    allQuotes {
      id,
      text,
      author
    }
  }`)
  .then(response => response.json())
  .then(json => this.setState(json.data))
  .catch(ex => console.error(ex))
}
```

## Relay containers
