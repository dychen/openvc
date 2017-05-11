import React from 'react';
import {Link} from 'react-router';

import './sidenav.scss';

class InvestorSidenav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'minimized': false
    };

    this.toggleMinimized = this.toggleMinimized.bind(this);
  }

  toggleMinimized(e) {
    this.setState({ 'minimized': !this.state.minimized });
  }

  render() {
    const sidenavClass = (this.state.minimized
                          ? 'ovc-sidenav minimized' : 'ovc-sidenav');

    return (
      <div className={sidenavClass}>
        <div className="ovc-sidenav-top">
          <div className="ovc-sidenav-item logo"
               onClick={this.toggleMinimized}>
            <i className="ion-navicon nav-hamburger" />
            <span className="minimized-sidenav-hidden">OpenVC</span>
          </div>
          <Link to="/investor/tables">
            <div className="ovc-sidenav-item link">
              <i className="ion-easel" />
              <span className="minimized-sidenav-hidden">
                Tables
              </span>
            </div>
          </Link>
          <Link to="/investor/deals">
            <div className="ovc-sidenav-item link">
              <i className="ion-ios-pulse" />
              <span className="minimized-sidenav-hidden">
                Deal Pipeline
                <i className="ovc-circle-alert red">4</i>
              </span>
            </div>
          </Link>
          <Link to="/investor/portfolio">
            <div className="ovc-sidenav-item link">
              <i className="ion-arrow-graph-up-right" />
              <span className="minimized-sidenav-hidden">
                Portfolio
              </span>
            </div>
          </Link>
          <Link to="/investor/landscape">
            <div className="ovc-sidenav-item link">
              <i className="ion-earth" />
              <span className="minimized-sidenav-hidden">
                Startup Landscape
              </span>
            </div>
          </Link>
          <Link to="/investor/compare">
            <div className="ovc-sidenav-item link">
              <i className="ion-podium" />
              <span className="minimized-sidenav-hidden">
                Compare Startups
              </span>
            </div>
          </Link>
          <Link to="/investor/contacts">
            <div className="ovc-sidenav-item link">
              <i className="ion-ios-people" />
              <span className="minimized-sidenav-hidden">
                Contacts
              </span>
            </div>
          </Link>
          <Link to="/investor/rooms">
            <div className="ovc-sidenav-item link">
              <i className="ion-chatbubbles" />
              <span className="minimized-sidenav-hidden">
                Rooms
              </span>
            </div>
          </Link>
          <Link to="/investor/profile">
            <div className="ovc-sidenav-item link">
              <i className="ion-android-person" />
              <span className="minimized-sidenav-hidden">
                Profile
              </span>
            </div>
          </Link>
          <div className="ovc-sidenav-item link">
            <i className="ion-key" />
            <span className="minimized-sidenav-hidden">
              User Access
            </span>
          </div>
          <div className="ovc-sidenav-item link">
            <i className="ion-lock-combination" />
            <span className="minimized-sidenav-hidden">
              Data Access
            </span>
          </div>
        </div>

        <div className="ovc-sidenav-bottom">
        </div>
      </div>
    );
  }
}

export default InvestorSidenav;
