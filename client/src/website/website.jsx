import React from 'react';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';

import { LoginForm, SignupForm, StartupForm, ContactForm, WebsiteLogin } from './login.jsx';

import './website.scss';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <div className="ovc-website-header">
        <div className="ovc-header-left">
          <span className="ovc-header-item logo">OpenVC</span>
          <Link to="/home">
            <span className="ovc-header-item button hvr-fade">Home</span>
          </Link>
          <Link to="/about">
            <span className="ovc-header-item button hvr-fade">About</span>
          </Link>
        </div>

        <div className="ovc-header-right">
          <span className="ovc-header-item text">I am a...</span>
          <Link to="/login">
            <span className="ovc-header-item button hvr-fade">Founder</span>
          </Link>
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
          <Route path="login" component={WebsiteLogin}>
            <IndexRoute component={LoginForm} />
            <Route path="signup" component={SignupForm} />
            <Route path="startup" component={StartupForm} />
            <Route path="contact" component={ContactForm} />
          </Route>
        </Route>
      </Router>
    );
  }
}

export default WebsiteApp;
