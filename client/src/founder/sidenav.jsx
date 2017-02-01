import React from 'react';
import {Link} from 'react-router';

import './sidenav.scss';

class FounderSidenav extends React.Component {
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
          <Link to="/founder/company">
            <div className="ovc-sidenav-item link">
              <i className="ion-speedometer" />
              <span className="minimized-sidenav-hidden">
                Company
              </span>
            </div>
          </Link>
          <Link to="/founder/apply">
            <div className="ovc-sidenav-item link">
              <i className="ion-android-checkmark-circle" />
              <span className="minimized-sidenav-hidden">
                Apply
              </span>
            </div>
          </Link>
          <Link to="/founder/fundraising">
            <div className="ovc-sidenav-item link">
              <i className="ion-cash" />
              <span className="minimized-sidenav-hidden">
                Fundraising Status
              </span>
            </div>
          </Link>
          <div className="ovc-sidenav-item link">
            <i className="ion-stats-bars" />
            <span className="minimized-sidenav-hidden">
              Benchmarking
            </span>
          </div>
          <Link to="/founder/rooms">
            <div className="ovc-sidenav-item link">
              <i className="ion-chatbubbles" />
              <span className="minimized-sidenav-hidden">
                Rooms
              </span>
            </div>
          </Link>
          <div className="ovc-sidenav-item link">
            <i className="ion-key" />
            <span className="minimized-sidenav-hidden">
              User Access
            </span>
          </div>
        </div>

        <div className="ovc-sidenav-bottom">
        </div>
      </div>
    );
  }
}

export default FounderSidenav;

