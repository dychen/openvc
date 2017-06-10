import React from 'react';
import {NavLink} from 'react-router-dom';

import {authFetch, handleResponse} from '../utils/api.js';

import './sidenav.scss';

const SidenavItem = (props) => {
  return (
    <NavLink to={props.link}>
      <div className="ovc-sidenav-item link">
        <i className={props.icon} />
        <span className="minimized-sidenav-hidden">
          <div className="ovc-sidenav-text">
            <div className="title">{props.title}</div>
            <div className="subtext hover">{props.subtext}</div>
          </div>
        </span>
      </div>
    </NavLink>
  );
}

const ProfileItem = (props) => {
  return (
    <div className="ovc-sidenav-item profile">
      <img src={props.photoUrl} />
      <span className="minimized-sidenav-hidden">
        <div className="ovc-sidenav-text">
          <div className="title">{props.firstName} {props.lastName}</div>
          <div className="subtext">{props.title}, {props.company}</div>
        </div>
      </span>
    </div>
  );
}

class InvestorSidenav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      minimized: false,
      profile: {}
    };

    this.ITEMS = [
      { link: '/investor/tables', icon: 'ion-easel',
        title: 'Tables', subtext: 'Build custom sheets' },
      { link: '/investor/deals', icon: 'ion-ios-pulse',
        title: 'Pipeline', subtext: 'Manage incoming deals' },
      { link: '/investor/portfolio', icon: 'ion-arrow-graph-up-right',
        title: 'Portfolio', subtext: 'Manage investments' },
      { link: '/investor/landscape', icon: 'ion-earth',
        title: 'Landscape', subtext: 'Source new deals' },
      { link: '/investor/compare', icon: 'ion-podium',
        title: 'Compare', subtext: 'Compare potential leads' },
      { link: '/investor/contacts', icon: 'ion-ios-people',
        title: 'Contacts', subtext: 'Connect to your network' },
      { link: '/investor/rooms', icon: 'ion-chatbubbles',
        title: 'Rooms', subtext: 'Chat with your network' },
      { link: '/investor/profile', icon: 'ion-android-person',
        title: 'Profile', subtext: 'Your profile page' },
      { link: '/investor/apis', icon: 'ion-network',
        title: 'APIs', subtext: 'Manage data sources' },
      { link: '/investor/access', icon: 'ion-lock-combination',
        title: 'Access', subtext: 'Manage user access' },
    ]

    this.toggleMinimized = this.toggleMinimized.bind(this);

    // Fetch profile
    authFetch(`${SERVER_URL}/api/v1/users/self`)
      .then(handleResponse)
      .then(data => { this.setState({ profile: data }) });
  }

  toggleMinimized(e) {
    this.setState({ 'minimized': !this.state.minimized });
  }

  render() {
    const sidenavClass = (this.state.minimized
                          ? 'ovc-sidenav minimized' : 'ovc-sidenav');

    const subnavItems = this.ITEMS.map(item => (
      <SidenavItem link={item.link}
                   icon={item.icon}
                   title={item.title}
                   subtext={item.subtext} />
    ));

    return (
      <div className={sidenavClass}>
        <div className="ovc-sidenav-top">
          <div className="ovc-sidenav-item logo"
               onClick={this.toggleMinimized}>
            <i className="ion-navicon nav-hamburger" />
            <span className="minimized-sidenav-hidden">OpenVC</span>
          </div>
        </div>
        <div className="ovc-sidenav-mid">
          {subnavItems}
        </div>
        <div className="ovc-sidenav-bottom">
          <ProfileItem firstName={this.state.profile.firstName}
                       lastName={this.state.profile.lastName}
                       photoUrl={this.state.profile.photoUrl}
                       company={this.state.profile.company}
                       title={this.state.profile.title} />
        </div>
      </div>
    );
  }
}

export default InvestorSidenav;
