import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import EditField from './edit.jsx';
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

    this._PROFILE_FIELDS = ['firstName', 'lastName', 'title', 'company',
                            'location', 'email', 'photoUrl', 'linkedinUrl'];

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
      },
      editing: {
        firstName: {},
        lastName: {},
        title: {},
        company: {},
        location: {},
        email: {},
        photoUrl: {},
        linkedinUrl: {}
      }
    };

    // Profile/Experience field CRUD
    this.editField = this.editField.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.saveInput = this.saveInput.bind(this);

    this._cancelEdits = this._cancelEdits.bind(this);

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
        json = preprocessJSON(json);
        let editingJSON = { id: json.id };
        this._PROFILE_FIELDS.forEach(field => {
          editingJSON[field] = {
            value: json[field],
            editing: false
          };
        });
        this.setState({
          profile: json,
          editing: editingJSON
        });
      })
      .catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  /*
   * Profile/Experience field CRUD
   */

  editField(field) {
    // TODO: Find a better pattern than callbacks
    //       This is currently necessary because setState is often asynchronous
    this._cancelEdits(() => {
      const newState = Immutable.fromJS(this.state)
        .setIn(['editing', field, 'editing'], true);
      this.setState(newState.toJS());
    });
  }

  updateInput(field, value) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['editing', field, 'value'], value);
    this.setState(newState.toJS());
  }

  saveInput(field, value) {
    let body = {}
    body[field] = value;
    authFetch(this.props.profileUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
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
      const newProfileState = Immutable.fromJS(this.state)
        .setIn(['profile', field], json[field]);
      const newEditingState = newProfileState
        .setIn(['editing', field, 'editing'], false);
      this.setState(newEditingState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  /*
   * WARNING: This can cause unexpected bugs because it's bound to the
   *          the container div and modifies state. Be sure to stop propagation
   *          on subcomponent clicks, and consider only firing if an "in edit
   *          mode" flag is set.
   * TODO: Find a better pattern than callbacks
   */
  _cancelEdits(callback) {
    console.log('DEBUG: profile._cancelEdits()');
    let newEditing = Immutable.fromJS(this.state.editing);
    this._PROFILE_FIELDS.forEach(field => {
      newEditing = newEditing.setIn([field, 'editing'], false);
      newEditing = newEditing.setIn([field, 'value'], this.state.profile[field]);
    });

    if (callback && typeof(callback) === 'function')
      this.setState({ editing: newEditing.toJS() }, callback);
    else
      this.setState({ editing: newEditing.toJS() });
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
    const editPhotoComponent = (
      this.state.editing.photoUrl.editing
      ? (
        <EditField className="info-edit-photo"
                   field="photoUrl"
                   value={this.state.profile.photoUrl}
                   placeholder="Enter a photo URL (e.g. your LinkedIn photo URL)"
                   editing={this.state.editing.photoUrl}
                   editField={this.editField}
                   updateInput={this.updateInput}
                   saveInput={this.saveInput} />
      )
      : ''
    );

    return (
      <div className="ovc-shared-profile-container"
           onClick={this._cancelEdits}>
        <div className="profile-picture-container">
          <img src={this.state.profile.photoUrl}
               onClick={() => this.editField('photoUrl')} />
        </div>
        {editPhotoComponent}
        <div className="profile-info-section profile-basic-info-section">
          <div className="bold">
            <EditField field="firstName"
                       value={this.state.profile.firstName}
                       placeholder="Update first name"
                       editing={this.state.editing.firstName}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
            &nbsp;
            <EditField field="lastName"
                       value={this.state.profile.lastName}
                       placeholder="Update last name"
                       editing={this.state.editing.lastName}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div>
            <span>{title}</span>
          </div>
          <div>
            <span>{company}</span>
          </div>
          <div className="light">
            <EditField field="location"
                       value={this.state.profile.location}
                       placeholder="Update location"
                       editing={this.state.editing.location}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div className="light">
            <EditField field="email"
                       value={this.state.profile.email}
                       editing={this.state.editing.email}
                       placeholder="Update email"
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div className="light">
            <EditField field="linkedinUrl"
                       value={this.state.profile.linkedinUrl}
                       placeholder="Update LinkedIn URL"
                       editing={this.state.editing.linkedinUrl}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
        </div>
        <ExperienceSection {...this.props} />
      </div>
    );
  }
}

export default ProfilePage;

