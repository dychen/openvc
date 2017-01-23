import React from 'react';
import {Link} from 'react-router';

import './website.scss';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <div className="ovc-website-header">
        <div className="ovc-header-left">
          <span className="ovc-header-item logo">OpenVC</span>
          <Link to="/home">
            <span className="ovc-header-item button">Home</span>
          </Link>
          <Link to="/about">
            <span className="ovc-header-item button">About</span>
          </Link>
        </div>

        <div className="ovc-header-right">
          <span className="ovc-header-item text">I am a...</span>
          <Link to="/login">
            <span className="ovc-header-item button">Founder</span>
          </Link>
          <span className="ovc-header-item button">Investor</span>
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

class WebsiteLogin extends React.Component {
  render() {
    return (
      <div className="ovc-website-body login">
        <div className="login-container">
          {this.props.children}
        </div>
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

class WebsiteApp extends React.Component {
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

export {WebsiteHeader, WebsiteHome, WebsiteAbout, WebsiteLogin, WebsiteFooter,
        WebsiteApp};
