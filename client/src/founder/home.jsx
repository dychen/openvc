import React from 'react';

import './home.scss';

class FounderSidenav extends React.Component {
  render() {
    return (
      <div className="ovc-founder-sidenav">
        <div className="ovc-sidenav-top">
          <div className="ovc-sidenav-item logo">OpenVC</div>
          <div className="ovc-sidenav-item link">Company</div>
          <div className="ovc-sidenav-item link">Apply</div>
          <div className="ovc-sidenav-item link">Deal Pipeline</div>
          <div className="ovc-sidenav-item link">Investor Chat</div>
          <div className="ovc-sidenav-item link">Founder Groups</div>
        </div>

        <div className="ovc-sidenav-bottom">
        </div>
      </div>
    );
  }
}

class FounderTopnav extends React.Component {
  render() {
    return (
      <div className="ovc-founder-topnav">
        <div className="ovc-topnav-left">
          <div className="ovc-topnav-item link">Tasks</div>
          <div className="ovc-topnav-item link">Notifications</div>
          <div className="ovc-topnav-item link">News Feed</div>
        </div>

        <div className="ovc-topnav-right">
          <div className="ovc-topnav-item labeled-icon">
            <i className="ion-ios-plus-outline"></i>
            New Task
          </div>
          <div className="ovc-topnav-item circle-icon">
            <i>DC</i>
          </div>
        </div>
      </div>
    );
  }
}

class FounderCompanyPage extends React.Component {
  render() {
    return (
      <div className="ovc-founder-main">
      </div>
    );
  }
}

export {FounderSidenav, FounderTopnav, FounderCompanyPage};
