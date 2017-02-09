import React from 'react';
import Immutable from 'immutable';
import {authFetch} from '../utils/auth.js';

import './profile.scss';

/*
 * props:
 *   field [string]: Name of field being edited (e.g. 'title'), the name of
 *                   the innermost key for nested fields.
 *   value [string]: Value of the field being edited (e.g. 'Google').
 *   id [string]: [Optional] Id of the parent object, used if the object is in
 *                           a list of objects, such as for experience objects.
 *   editing [Object]: { editing: [boolean], value: [string] }
 *
 *   editField [function]: Function to enter editing mode.
 *   updateInput [function]: Function to update field based on user input.
 *   saveInput [function]: Function to write updated field to database.
 */
class EditField extends React.Component {
  constructor(props) {
    super(props);

    this.stopPropagation = this.stopPropagation.bind(this);
    this.editField = this.editField.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.saveInput = this.saveInput.bind(this);
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  editField(e) {
    e.stopPropagation();
    // this.props.id is passed for experience fields but is undefined for
    // profile fields
    this.props.editField(this.props.field, this.props.id);
  }

  updateInput(e) {
    // this.props.id is passed for experience fields but is undefined for
    // profile fields
    this.props.updateInput(this.props.field, e.currentTarget.value,
                           this.props.id);
  }

  saveInput(e) {
    const trimmedValue = this.props.editing.value.trim();
    if (e.key === 'Enter' && trimmedValue !== '') {
      // this.props.id is passed for experience fields but is undefined for
      // profile fields
      this.props.saveInput(this.props.field, trimmedValue, this.props.id);
    }
  }

  render() {
    let editComponent;
    if (this.props.editing && this.props.editing.editing) {
      if (this.props.field.includes('notes')) {
        editComponent = (
          <textarea rows="8"
                    className="info-edit"
                    value={this.props.editing.value}
                    onChange={this.updateInput}
                    onKeyPress={this.saveInput}
                    onClick={this.stopPropagation} />
        );
      }
      else {
        editComponent = (
          <input className="info-edit"
                 value={this.props.editing.value}
                 onChange={this.updateInput}
                 onKeyPress={this.saveInput}
                 onClick={this.stopPropagation} />
        );
      }
    }
    else {
      editComponent = (
        <span className="info-edit"
              onClick={this.editField}>
          {this.props.value}
        </span>
      );
    }
    return editComponent;
  }
}

/*
 * props:
 *   experience [Array]: this.state.profile.experience - list of experience
 *                       objects.
 *   editingExperience [Array]: this.state.editing.experience - list of
 *                              experience editing objects.
 *
 *   editField [function]: Function to enter editing mode.
 *   updateInput [function]: Function to update field based on user input.
 *   saveInput [function]: Function to write updated field to database.
 *
 *   addExperience [function]: Function to create a new experience object.
 *   removeExperience [function]: Function to delete an experience object.
 */
class ExperienceSection extends React.Component {
  constructor(props) {
    super(props);

    this._INITIAL_STATE = {
      addingExperience: false,
      newExperience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        notes: ''
      }
    };

    this.state = this._INITIAL_STATE;

    // These functions all govern experience creation/deletion - they do not
    // have anything to do with field updating, which are all handled through
    // props.
    this.stopPropagation = this.stopPropagation.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.addExperience = this.addExperience.bind(this);
    this.cancelExperience = this.cancelExperience.bind(this);
    this.saveExperience = this.saveExperience.bind(this);
    this.removeExperience = this.removeExperience.bind(this);
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  /* NOTE: This is different from this.props.updateInput */
  updateInput(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['newExperience', e.currentTarget.name], e.currentTarget.value);
    this.setState(newState.toJS());
  }

  addExperience(e) {
    this.setState({ addingExperience: true });
  }

  cancelExperience(e) {
    this.setState(this._INITIAL_STATE);
  }

  saveExperience(e) {
    this.props.addExperience(this.state.newExperience);
    this.setState(this._INITIAL_STATE); // TODO: Will this affect
                                        //       parent.setState?
  }

  removeExperience(e) {
    this.props.removeExperience(Number(e.currentTarget.id));
  }

  render() {
    const addExperience = (
      this.state.addingExperience
      ? (
        <div className="profile-info-subsection profile-add-experience">
          <div className="add-experience-input-group">
            <input className="info-edit" name="company" value={this.company}
                   placeholder="Company (e.g. Google)"
                   onChange={this.updateInput} />
            <input className="info-edit" name="title" value={this.title}
                   placeholder="Title (e.g. CEO)"
                   onChange={this.updateInput} />
          </div>
          <div className="add-experience-input-group">
            <input className="info-edit" name="location" value={this.location}
                   placeholder="Location (e.g. San Francisco, CA)"
                   onChange={this.updateInput} />
          </div>
          <div className="add-experience-input-group">
            <input className="info-edit" name="startDate" value={this.startDate}
                   placeholder="Start Date (e.g. 2016-01-01)"
                   onChange={this.updateInput} />
            <input className="info-edit" name="endDate" value={this.endDate}
                   placeholder="End Date (e.g. 2016-12-31)"
                   onChange={this.updateInput} />
          </div>
          <div className="add-experience-input-group">
            <textarea className="info-edit" rows="5"
                      name="notes" value={this.notes}
                      placeholder="Notes/comments"
                      onChange={this.updateInput} />
          </div>
          <div className="add-experience-footer">
            <i className="ion-ios-close-outline cancel-experience"
               onClick={this.cancelExperience} />
            <i className="ion-ios-checkmark-outline save-experience"
               onClick={this.saveExperience} />
          </div>
        </div>
      )
      : (
        <div className="profile-info-subsection profile-add-experience"
             onClick={this.addExperience}>
          <i className="ion-ios-plus-empty" />
        </div>
      )
    );
    const experience = this.props.experience.map((exp, index) => {
      const endDate = exp.endDate ? exp.endDate : 'present';
      return (
        <div className="profile-info-subsection" key={exp.id}>
          <i className="ion-trash-a remove-experience" id={exp.id}
             onClick={this.removeExperience} />
          <div>
            <EditField field="title"
                       value={exp.title} id={exp.id}
                       editing={this.props.editingExperience[index].title}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            &nbsp;at&nbsp;
            <EditField field="company"
                       value={exp.company} id={exp.id}
                       editing={this.props.editingExperience[index].company}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
          </div>
          <div className="light italic">
            <EditField field="location"
                       value={exp.location} id={exp.id}
                       editing={this.props.editingExperience[index].location}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            &nbsp;(
            <EditField field="startDate"
                       value={exp.startDate} id={exp.id}
                       editing={this.props.editingExperience[index].startDate}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            &nbsp;-&nbsp;
            <EditField field="endDate"
                       value={exp.endDate} id={exp.id}
                       editing={this.props.editingExperience[index].endDate}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            )
          </div>
          <div className="light">
            <EditField field="notes"
                       value={exp.notes} id={exp.id}
                       editing={this.props.editingExperience[index].notes}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
          </div>
        </div>
      );
    });
    return (
      <div className="profile-info-section profile-experience-container"
           onClick={this.stopPropagation}>
        {addExperience}
        {experience}
      </div>
    );
  }
}

class ProfilePage extends React.Component {
  constructor(props) {
    super(props);

    this._PROFILE_FIELDS = ['firstName', 'lastName', 'title', 'company',
                            'location', 'email', 'linkedin'];
    this._EXPERIENCE_FIELDS = ['company', 'title', 'startDate', 'endDate',
                               'location', 'notes'];

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
        linkedin: '',
        experience: []
      },
      editing: {
        firstName: {},
        lastName: {},
        title: {},
        company: {},
        location: {},
        email: {},
        linkedin: {},
        experience: []
      }
    };

    this._createEditingExperience = this._createEditingExperience.bind(this);

    // Profile/Experience field CRUD
    this.editField = this.editField.bind(this);
    this.editExperienceField = this.editExperienceField.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.updateExperienceInput = this.updateExperienceInput.bind(this);
    this.saveInput = this.saveInput.bind(this);
    this.saveExperienceInput = this.saveExperienceInput.bind(this);

    this.cancelEdits = this.cancelEdits.bind(this);

    // Experience CRUD
    this.addExperience = this.addExperience.bind(this);
    this.removeExperience = this.removeExperience.bind(this);

    authFetch(`${SERVER_URL}/api/v1/users/self`)
      .then(function(response) {
        return response.json();
      }).then(json => {
        let editingJSON = { id: json.id };
        this._PROFILE_FIELDS.forEach(field => {
          editingJSON[field] = {
            value: json[field],
            editing: false
          };
        });
        editingJSON.experience = json.experience.map(exp =>
          this._createEditingExperience(exp)
        );
        this.setState({
          profile: json,
          editing: editingJSON
        });
      }); // TODO: Handle errors
  }

  _createEditingExperience(exp) {
    let experienceJSON = { id: exp.id };
    this._EXPERIENCE_FIELDS.forEach(field => {
      experienceJSON[field] = {
        value: exp[field],
        editing: false
      };
    });
    return experienceJSON;
  }

  /*
   * Profile/Experience field CRUD
   */

  editField(field) {
    // TODO: Find a better pattern than callbacks
    //       This is currently necessary because setState is often asynchronous
    this.cancelEdits(() => {
      const newState = Immutable.fromJS(this.state)
        .setIn(['editing', field, 'editing'], true);
      this.setState(newState.toJS());
    });
  }

  editExperienceField(field, experienceId) {
    // TODO: Find a better pattern than callbacks
    //       This is currently necessary because setState is often asynchronous
    this.cancelEdits(() => {
      const experienceIdx = this.state.editing.experience.findIndex(exp =>
        exp.id === experienceId
      );
      const newState = Immutable.fromJS(this.state)
        .setIn(['editing', 'experience', experienceIdx, field, 'editing'], true);
      this.setState(newState.toJS());
    });
  }

  updateInput(field, value) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['editing', field, 'value'], value);
    this.setState(newState.toJS());
  }

  updateExperienceInput(field, value, experienceId) {
    const experienceIdx = this.state.editing.experience.findIndex(exp =>
      exp.id === experienceId
    );
    const newState = Immutable.fromJS(this.state)
      .setIn(['editing', 'experience', experienceIdx, field, 'value'], value);
    this.setState(newState.toJS());
  }

  saveInput(field, value) {
    const newProfileState = Immutable.fromJS(this.state)
      .setIn(['profile', field], value);
    const newEditingState = newProfileState
      .setIn(['editing', field, 'editing'], false);
    this.setState(newEditingState.toJS());
  }

  saveExperienceInput(field, value, experienceId) {
    let body = {}
    body[field] = value;
    authFetch(`${SERVER_URL}/api/v1/users/experience/${experienceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error('Unable to log in');
        });
      }
    }).then(json => {
      // Success
      const profileExperienceIdx = this.state.profile.experience.findIndex(exp =>
        exp.id === experienceId
      );
      const editingExperienceIdx = this.state.editing.experience.findIndex(exp =>
        exp.id === experienceId
      );
      const newProfileState = Immutable.fromJS(this.state)
        .setIn(['profile', 'experience', profileExperienceIdx], json);
      const newEditingState = newProfileState
        .setIn(['editing', 'experience', editingExperienceIdx],
               this._createEditingExperience(json));
      this.setState(newEditingState.toJS());
    }).catch(err => {
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
  cancelEdits(callback) {
    console.log('DEBUG: profile.cancelEdits()');
    let newEditing = Immutable.fromJS(this.state.editing);
    this._PROFILE_FIELDS.forEach(field => {
      newEditing = newEditing.setIn([field, 'editing'], false);
      newEditing = newEditing.setIn([field, 'value'], this.state.profile[field]);
    });
    const newEditingExperiences = this.state.profile.experience.map(exp =>
      this._createEditingExperience(exp)
    );
    newEditing = newEditing.set('experience', newEditingExperiences);

    if (callback && typeof(callback) === 'function')
      this.setState({ editing: newEditing.toJS() }, callback);
    else
      this.setState({ editing: newEditing.toJS() });
  }

  /*
   * Experience CRUD
   */

  addExperience(experience) {
    authFetch(`${SERVER_URL}/api/v1/users/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(experience)
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error('Unable to log in');
        });
      }
    }).then(json => {
      // Success
      const newExperience = json;
      const newEditingExperience = this._createEditingExperience(json);
      const newProfileState = Immutable.fromJS(this.state)
        .updateIn(['profile', 'experience'], experience =>
          experience.unshift(newExperience)
        );
      const newEditingState = newProfileState
        .updateIn(['editing', 'experience'], experience =>
          experience.unshift(newEditingExperience)
        );
      this.setState(newEditingState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  removeExperience(experienceId) {
    authFetch(`${SERVER_URL}/api/v1/users/experience`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ id: experienceId })
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error('Unable to log in');
        });
      }
    }).then(json => {
      const deletedId = json.id;
      const newProfileExperience = this.state.profile.experience.filter(exp =>
        exp.id !== deletedId
      );
      const newProfileEditing = this.state.editing.experience.filter(exp =>
        exp.id !== deletedId
      );
      const newProfileState = Immutable.fromJS(this.state)
        .setIn(['profile', 'experience'], newProfileExperience);
      const newEditingState = newProfileState
        .setIn(['editing', 'experience'], newProfileEditing);
      this.setState(newEditingState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  render() {
    return (
      <div className="ovc-shared-profile-container"
           onClick={this.cancelEdits}>
        <div className="profile-picture-container">
          <img src={this.state.profile.photoUrl} />
        </div>
        <div className="profile-info-section profile-name-section">
          <div className="bold">
            <EditField field="firstName"
                       value={this.state.profile.firstName}
                       editing={this.state.editing.firstName}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
            &nbsp;
            <EditField field="lastName"
                       value={this.state.profile.lastName}
                       editing={this.state.editing.lastName}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
        </div>
        <div className="profile-info-section profile-basic-info-section">
          <div>
            <EditField field="title"
                       value={this.state.profile.title}
                       editing={this.state.editing.title}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div>
            <EditField field="company"
                       value={this.state.profile.company}
                       editing={this.state.editing.company}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div className="light">
            <EditField field="location"
                       value={this.state.profile.location}
                       editing={this.state.editing.location}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div className="light">
            <EditField field="email"
                       value={this.state.profile.email}
                       editing={this.state.editing.email}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div className="light">
            <EditField field="linkedin"
                       value={this.state.profile.linkedin}
                       editing={this.state.editing.linkedin}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
        </div>
        <ExperienceSection experience={this.state.profile.experience}
                           editingExperience={this.state.editing.experience}
                           editField={this.editExperienceField}
                           updateInput={this.updateExperienceInput}
                           saveInput={this.saveExperienceInput}
                           addExperience={this.addExperience}
                           removeExperience={this.removeExperience} />
      </div>
    );
  }
}

export default ProfilePage;
