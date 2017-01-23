import React from 'react';

import './sidenav.scss';

class FounderSidenav extends React.Component {
  render() {
    return (
      <div className="ovc-founder-sidenav">
        <div className="ovc-sidenav-top">
          <div className="ovc-sidenav-item logo">OpenVC</div>
          <div className="ovc-sidenav-item link">
            <i className="ion-speedometer"></i>Company
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-android-checkmark-circle"></i>Apply
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-ios-briefcase-outline"></i>Deal Pipeline
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-android-people"></i>Investors
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-chatbubbles"></i>Founder Groups
          </div>
        </div>

        <div className="ovc-sidenav-bottom">
        </div>
      </div>
    );
  }
}

export default FounderSidenav;

