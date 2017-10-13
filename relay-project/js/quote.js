import React from 'react';
import Relay from 'react-relay';

class ReactQuote extends React.Component {
  render() {
    return (
      <blockquote>
        <p>{this.props.quote.text}</p>
        <footer>{this.props.quote.author}</footer>
      </blockquote>
    );
  }
}

const Quote = Relay.createContainer(ReactQuote, {
  fragments: {}
});

export default Quote;
