import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import {EditField} from '../../components/editfield.jsx';
import ExperienceSection from './experience.jsx';

import './profile.scss';

/*
 * props:
 *   getUrl [string]: URL to fetch user profile data.
 *   updateUrl [string]: URL to update user profile data.
 */
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);

    // Separate this so the page has data to render (this.state.profile) before
    // state gets populated.
    this.state = {
      profile: {
        firstName: '',
        lastName: '',
        title: '',
        company: '',
        location: '',
        email: '',
        photoUrl: '',
        linkedinUrl: ''
      }
    };

    // Profile/Experience field CRUD
    this.handleUpdateProfile = this.handleUpdateProfile.bind(this);
    this._getProfile = this._getProfile.bind(this);
    this._updateProfile = this._updateProfile.bind(this);

    this._getProfile();
  }

  handleUpdateProfile(field, value) {
    // Optimistic update
    const newState = Immutable.fromJS(this.state)
      .setIn(['profile', field], value);

    // Write to the backend in callback
    this.setState(newState.toJS(), () => {
      let body = {};
      body[field] = value;
      this._updateProfile(body);
    });
  }

  /*
   * Profile/Experience field CRUD
   */

  _getProfile() {
    authFetch(this.props.profileUrl)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            throw new Error(json);
          });
        }
      })
      .then(json => {
        console.log(json);
        this.setState({ profile: preprocessJSON(json) });
      })
      .catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  _updateProfile(profile) {
    authFetch(this.props.profileUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(profile)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state).set('profile', json);
      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  render() {
    // TODO: Update based on experience component
    const company = (
      this.state.profile.company
      ? this.state.profile.company
      : 'No company - add a company below'
    );
    const title = (
      this.state.profile.title
      ? this.state.profile.title
      : 'No title - add a company below'
    );
    return (
      <div className="ovc-shared-profile-container">
        <div className="profile-picture-container">
          <EditField field="photoUrl"
                     fieldType="image"
                     originalValue={this.state.profile.photoUrl}
                     placeholder="Enter a photo URL (e.g. LinkedIn photo URL)"
                     onSave={this.handleUpdateProfile} />
        </div>
        <div className="profile-info-section profile-basic-info-section">
          <div className="bold">
            <EditField field="firstName"
                       originalValue={this.state.profile.firstName}
                       placeholder="Update first name"
                       onSave={this.handleUpdateProfile} />
            &nbsp;
            <EditField field="lastName"
                       originalValue={this.state.profile.lastName}
                       placeholder="Update last name"
                       onSave={this.handleUpdateProfile} />
          </div>
          <div>
            <span>{title}</span>
          </div>
          <div>
            <span>{company}</span>
          </div>
          <div className="light">
            <EditField field="location"
                       originalValue={this.state.profile.location}
                       placeholder="Update location"
                       onSave={this.handleUpdateProfile} />
          </div>
          <div className="light">
            <EditField field="email"
                       originalValue={this.state.profile.email}
                       placeholder="Update email"
                       onSave={this.handleUpdateProfile} />
          </div>
          <div className="light">
            <EditField field="linkedinUrl"
                       originalValue={this.state.profile.linkedinUrl}
                       placeholder="Update LinkedIn URL"
                       onSave={this.handleUpdateProfile} />
          </div>
        </div>
        <ExperienceSection {...this.props} />
      </div>
    );
  }
}

export default ProfilePage;

