import React from 'react';

import './website.scss';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <div className="ovc-website-header">
        <div className="ovc-header-left">
          <span className="ovc-header-item logo">OpenVC</span>
          <span className="ovc-header-item button hvr-fade">Home</span>
          <span className="ovc-header-item button hvr-fade">About</span>
        </div>

        <div className="ovc-header-right">
          <span className="ovc-header-item text">I am a...</span>
          <span className="ovc-header-item button hvr-fade">Startup</span>
          <span className="ovc-header-item button hvr-fade">Investor</span>
        </div>
      </div>
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
      <div></div>
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

export default WebsiteView;
