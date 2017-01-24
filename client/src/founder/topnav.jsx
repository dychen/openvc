import React from 'react';

import './topnav.scss';

class FounderTopnav extends React.Component {
  render() {
    return (
      <div className="ovc-founder-topnav">
        <div className="ovc-topnav-left">
          <div className="ovc-topnav-item link">Tasks</div>
          <div className="ovc-topnav-item link">History</div>
          <div className="ovc-topnav-item link">Notifications</div>
          <div className="ovc-topnav-item link">News Feed</div>
        </div>

        <div className="ovc-topnav-right">
          <div className="ovc-topnav-item labeled-icon">
            <i className="ion-ios-plus-outline"></i>New Task
          </div>
          <div className="ovc-topnav-item circle-icon">
            <i>DC</i>
          </div>
        </div>
      </div>
    );
  }
}

export default FounderTopnav;

