import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'relay';

import Quote from './quote';

class QuotesLibrary extends React.Component {
  state = { allQuotes: [] };

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

  render() {
    return (
      <div className="quotes-list">
        {this.state.allQuotes.map(quote => <Quote key={quote.id} quote={quote} />)}
      </div>
    );
  }
}

const RelayQuotesLibrary = Relay.createContainer(QuotesLibrary, {
  fragments: {}
});

// Relay routes have nothing to do with URL routing.
class AppRoute extends Relay.Route {
  static routeName = 'App';
}

const appRoute = new AppRoute({});

ReactDOM.render(
  <Relay.RootContainer
    Component={RelayQuotesLibrary}
    route={appRoute}
  />,
  document.getElementById('react')
);
