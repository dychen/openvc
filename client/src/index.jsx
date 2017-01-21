import React from 'react';
import ReactDOM from 'react-dom';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <p>Header</p>
    );
  }
}

class WebsiteBody extends React.Component {
  render() {
    return (
      <h1>Hello, world 2!</h1>
    );
  }
}

class WebsiteFooter extends React.Component {
  render() {
    return (
      <p>Footer</p>
    );
  }
}

class WebsiteView extends React.Component {
  render() {
    return (
      <div>
        <WebsiteHeader />
        <WebsiteBody />
        <WebsiteFooter />
      </div>
    );
  }
}

ReactDOM.render(
  <WebsiteView />,
  document.getElementById('app')
);

