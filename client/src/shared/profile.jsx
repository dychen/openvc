import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './profile.scss';

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
    this.props.editField(this.props.field);
  }

  updateInput(e) {
    this.props.updateInput(this.props.field, e.currentTarget.value);
  }

  saveInput(e) {
    const trimmedValue = this.props.editing.value.trim();
    if (e.key === 'Enter' && trimmedValue !== '') {
      this.props.saveInput(this.props.field, trimmedValue);
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

    this.editField = this.editField.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.saveInput = this.saveInput.bind(this);
    this.cancelEdits = this.cancelEdits.bind(this);

    fetch('/data/shared/profile/profile.json').then(function(response) {
      return response.json();
    }).then(json => {
      let editingJSON = {}
      this._PROFILE_FIELDS.forEach(field => {
        editingJSON[field] = {
          value: json[field],
          editing: false
        };
      });
      editingJSON.experience = json.experience.map(exp => {
        let experienceJSON = {}
        this._EXPERIENCE_FIELDS.forEach(field => {
          experienceJSON[field] = {
            value: exp[field],
            editing: false
          };
        });
        return experienceJSON;
      });
      this.setState({
        profile: json,
        editing: editingJSON
      });
    }); // TODO: Handle errors
  }

  /*
   * Args:
   *   @field [string/array]: Either a single string representing the target
   *                          field or a list of strings representing the
   *                          nested field.
   */
  editField(field) {
    // TODO: Find a better pattern than callbacks
    //       This is currently necessary because setState is often asynchronous
    const updateArray = (
      Array.isArray(field)
      ? ['editing'].concat(field).concat(['editing'])
      : ['editing', field, 'editing']
    );
    this.cancelEdits(() => {
      const newState = Immutable.fromJS(this.state)
        .setIn(updateArray, true);
      this.setState(newState.toJS());
    });
  }

  /*
   * Args:
   *   @field [string/array]: Either a single string representing the target
   *                          field or a list of strings representing the
   *                          nested field.
   */
  updateInput(field, value) {
    const updateArray = (
      Array.isArray(field)
      ? ['editing'].concat(field).concat(['value'])
      : ['editing', field, 'value']
    );
    const newState = Immutable.fromJS(this.state).setIn(updateArray, value);
    this.setState(newState.toJS());
  }

  /*
   * Args:
   *   @field [string/array]: Either a single string representing the target
   *                          field or a list of strings representing the
   *                          nested field.
   */
  saveInput(field, value) {
    let profileUpdateArray;
    let editingUpdateArray;
    if (Array.isArray(field)) {
      profileUpdateArray = ['profile'].concat(field);
      editingUpdateArray = ['editing'].concat(field).concat('editing');
    }
    else {
      profileUpdateArray = ['profile', field];
      editingUpdateArray = ['editing', field, 'editing'];
    }
    let newState = Immutable.fromJS(this.state).setIn(profileUpdateArray, value);
    newState = newState.setIn(editingUpdateArray, false);
    this.setState(newState.toJS());
  }

  // TODO: Find a better pattern than callbacks
  cancelEdits(callback) {
    let newEditing = Immutable.fromJS(this.state.editing);
    this._PROFILE_FIELDS.forEach(field => {
      newEditing = newEditing.setIn([field, 'editing'], false);
      newEditing = newEditing.setIn([field, 'value'], this.state.profile[field]);
    });
    newEditing = newEditing.update('experience', experiences => {
      return experiences.map((exp, index) => {
        let experienceJSON = {}
        this._EXPERIENCE_FIELDS.forEach(field => {
          experienceJSON[field] = {
            value: this.state.profile.experience[index][field],
            editing: false
          };
        });
        return experienceJSON;
      });
    });

    if (callback && typeof(callback) === 'function')
      this.setState({ editing: newEditing.toJS() }, callback);
    else
      this.setState({ editing: newEditing.toJS() });
  }

  render() {
    const experience = this.state.profile.experience.map((exp, index) => {
      const endDate = exp.endDate ? exp.endDate : 'present';
      return (
        <div className="profile-info-subsection" key={exp.id}>
          <div>
            <EditField field={['experience', index, 'title']}
                       value={exp.title}
                       editing={this.state.editing.experience[index].title}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
            &nbsp;at&nbsp;
            <EditField field={['experience', index, 'company']}
                       value={exp.company}
                       editing={this.state.editing.experience[index].company}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
          <div className="light italic">
            <EditField field={['experience', index, 'location']}
                       value={exp.location}
                       editing={this.state.editing.experience[index].location}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
            &nbsp;(
            <EditField field={['experience', index, 'startDate']}
                       value={exp.startDate}
                       editing={this.state.editing.experience[index].startDate}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
            &nbsp;-&nbsp;
            <EditField field={['experience', index, 'endDate']}
                       value={exp.endDate}
                       editing={this.state.editing.experience[index].endDate}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
            )
          </div>
          <div className="light">
            <EditField field={['experience', index, 'notes']}
                       value={exp.notes}
                       editing={this.state.editing.experience[index].notes}
                       editField={this.editField}
                       updateInput={this.updateInput}
                       saveInput={this.saveInput} />
          </div>
        </div>
      );
    });
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
        <div className="profile-info-section profile-experience-container">
          {experience}
        </div>
      </div>
    );
  }
}

export default ProfilePage;
