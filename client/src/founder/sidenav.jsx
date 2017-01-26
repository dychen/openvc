import React from 'react';
import {Link} from 'react-router';

import './sidenav.scss';

class FounderSidenav extends React.Component {
  render() {
    return (
      <div className="ovc-founder-sidenav">
        <div className="ovc-sidenav-top">
          <div className="ovc-sidenav-item logo">OpenVC</div>
          <Link to="/founder/company">
            <div className="ovc-sidenav-item link">
              <i className="ion-speedometer"></i>Company
            </div>
          </Link>
          <Link to="/founder/apply">
            <div className="ovc-sidenav-item link">
              <i className="ion-android-checkmark-circle"></i>Apply
            </div>
          </Link>
          <div className="ovc-sidenav-item link">
            <i className="ion-ios-briefcase-outline"></i>Fundraising Status
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-android-people"></i>Investors
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-chatbubbles"></i>Founder Groups
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-key"></i>User Access
          </div>
        </div>

        <div className="ovc-sidenav-bottom">
        </div>
      </div>
    );
  }
}

export default FounderSidenav;

