import React from 'react';
import {NavLink} from 'react-router-dom';

import './website.scss';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <div className="ovc-website-header">
        <div className="ovc-header-left">
          <span className="ovc-header-item logo">OpenVC</span>
          <NavLink to="/home">
            <span className="ovc-header-item button">Home</span>
          </NavLink>
          <NavLink to="/about">
            <span className="ovc-header-item button">About</span>
          </NavLink>
        </div>

        <div className="ovc-header-right">
          <span className="ovc-header-item text">I am a...</span>
          <NavLink to="/founder">
            <span className="ovc-header-item button">Founder</span>
          </NavLink>
          <NavLink to="/investor">
            <span className="ovc-header-item button">Investor</span>
          </NavLink>
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

/*
class WebsiteAppContainer extends React.Component {
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
*/

export {WebsiteHeader, WebsiteHome, WebsiteAbout, WebsiteLogin, WebsiteFooter};
