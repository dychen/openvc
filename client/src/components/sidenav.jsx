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

/*
 * props:
 *   ITEMS [Array]: List of sidenav item metadata in the format:
 *     [{ link: [string], icon: [string], title: [string], subtext: [string] },
 *      ...]
 */
class Sidenav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      minimized: false,
      profile: {}
    };

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

    const subnavItems = this.props.ITEMS.map(item => (
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

export {Sidenav};
