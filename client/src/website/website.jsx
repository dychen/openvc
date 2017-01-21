import React from 'react';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'

import './website.scss';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <div className="ovc-website-header">
        <div className="ovc-header-left">
          <span className="ovc-header-item logo">OpenVC</span>
          <span className="ovc-header-item button hvr-fade">
            <Link to="/home">Home</Link>
          </span>
          <span className="ovc-header-item button hvr-fade">
            <Link to="/about">About</Link>
          </span>
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

class WebsiteHome extends React.Component {
  render() {
    return (
      <div className="ovc-website-body home">
      </div>
    );
  }
}

class WebsiteAbout extends React.Component {
  render() {
    return (
      <div className="ovc-website-body about">
      </div>
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
      <div className="ovc-website-container">
        <WebsiteHeader />
        {this.props.children}
        <WebsiteFooter />
      </div>
    );
  }
}

class WebsiteApp extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={WebsiteView}>
          <IndexRoute component={WebsiteHome} />
          <Route path="home" component={WebsiteHome} />
          <Route path="about" component={WebsiteAbout} />
        </Route>
      </Router>
    );
  }
}

export default WebsiteApp;
