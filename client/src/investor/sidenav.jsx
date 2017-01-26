import React from 'react';
import {Link} from 'react-router';

import './sidenav.scss';

class InvestorSidenav extends React.Component {
  render() {
    return (
      <div className="ovc-investor-sidenav">
        <div className="ovc-sidenav-top">
          <div className="ovc-sidenav-item logo">OpenVC</div>
          <Link to="/investor/deals">
            <div className="ovc-sidenav-item link">
              <i className="ion-ios-pulse"></i>Deal Pipeline
              <i className="ovc-circle-alert red">4</i>
            </div>
          </Link>
          <Link to="/investor/landscape">
            <div className="ovc-sidenav-item link">
              <i className="ion-earth"></i>Startup Landscape
            </div>
          </Link>
          <Link to="/investor/compare">
            <div className="ovc-sidenav-item link">
              <i className="ion-podium"></i>Compare Startups
            </div>
          </Link>
          <div className="ovc-sidenav-item link">
            <i className="ion-map"></i>Market Map
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-arrow-graph-up-right"></i>Portfolio
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-ios-people"></i>Founders
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-key"></i>User Access
          </div>
        </div>

        <div className="ovc-sidenav-bottom">
        </div>
      </div>
    )
  }
}

export default InvestorSidenav;
