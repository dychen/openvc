import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import EditField from '../../components/editfield.jsx';

import './experience.scss';

/*
 * props:
 *   experienceUrl [string]: API endpoint to call for experience CRUD.
 */
class ExperienceSection extends React.Component {
  constructor(props) {
    super(props);

    this._EXPERIENCE_FIELDS = ['company', 'title', 'startDate', 'endDate',
                               'location', 'notes'];

    this.state = {
      addingExperience: false,
      newExperience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        notes: ''
      },
      experience: [],
      editing: []
    };

    // Helpers
    this._stopPropagation = this._stopPropagation.bind(this);
    this._createEditingExperience = this._createEditingExperience.bind(this);
    this._resetNewExperience = this._resetNewExperience.bind(this);
    this._cancelEdits = this._cancelEdits.bind(this);

    // New Experience component handlers
    this.addNewExperience = this.addNewExperience.bind(this);
    this.cancelNewExperience = this.cancelNewExperience.bind(this);
    this.updateNewExperienceInput = this.updateNewExperienceInput.bind(this);
    this.handleCreateExperience = this.handleCreateExperience.bind(this);
    this.handleDeleteExperience = this.handleDeleteExperience.bind(this);

    // Experience Edit Field component handlers
    this.updateExperienceInput = this.updateExperienceInput.bind(this);
    this.editExperienceField = this.editExperienceField.bind(this);
    this.handleUpdateExperience = this.handleUpdateExperience.bind(this);

    // Experience API
    this._getExperienceList = this._getExperienceList.bind(this);
    this._createExperience = this._createExperience.bind(this);
    this._updateExperience = this._updateExperience.bind(this);
    this._deleteExperience = this._deleteExperience.bind(this);

    this._getExperienceList();
  }

  _stopPropagation(e) {
    e.stopPropagation();
  }

  _createEditingExperience(exp) {
    let experienceJSON = { id: exp.id };
    this._EXPERIENCE_FIELDS.forEach(field => {
      experienceJSON[field] = {
        value: exp[field] || '',
        editing: false
      };
    });
    return experienceJSON;
  }

  /*
   * Args:
   *   oldState [Immutable]: Old immutable state.
   */
  _resetNewExperience(oldState) {
    let newState = oldState.set('addingExperience', false);
    newState = newState.set('newExperience', {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    return newState;
  }

  /*
   * WARNING: This can cause unexpected bugs because it's bound to the
   *          the container div and modifies state. Be sure to stop propagation
   *          on subcomponent clicks, and consider only firing if an "in edit
   *          mode" flag is set.
   * TODO: Find a better pattern than callbacks
   * TODO: Hook this into parent element
   */
  _cancelEdits(callback) {
    console.log('DEBUG: experience._cancelEdits()');
    const newEditingExperiences = this.state.experience.map(exp =>
      this._createEditingExperience(exp)
    );

    if (callback && typeof(callback) === 'function')
      this.setState({ editing: newEditingExperiences }, callback);
    else
      this.setState({ editing: newEditingExperiences });
  }

  /*
   * New Experience component handlers
   */

  addNewExperience(e) {
    this.setState({ addingExperience: true });
  }

  cancelNewExperience(e) {
    const oldState = Immutable.fromJS(this.state);
    const newState = this._resetNewExperience(oldState);
    this.setState(newState.toJS());
  }

  updateNewExperienceInput(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['newExperience', e.currentTarget.name], e.currentTarget.value);
    this.setState(newState.toJS());
  }

  handleCreateExperience() {
    this._createExperience(this.state.newExperience);
  }

  handleDeleteExperience(e) {
    this._deleteExperience(Number(e.currentTarget.id));
  }

  /*
   * Experience Edit Field component handlers
   */

  updateExperienceInput(field, value, experienceId) {
    const experienceIdx = this.state.editing.findIndex(exp =>
      exp.id === experienceId
    );
    const newState = Immutable.fromJS(this.state)
      .setIn(['editing', experienceIdx, field, 'value'], value);
    this.setState(newState.toJS());
  }

  editExperienceField(field, experienceId) {
    // TODO: Find a better pattern than callbacks
    //       This is currently necessary because setState is often asynchronous
    this._cancelEdits(() => {
      const experienceIdx = this.state.editing.findIndex(exp =>
        exp.id === experienceId
      );
      const newState = Immutable.fromJS(this.state)
        .setIn(['editing', experienceIdx, field, 'editing'], true);
      this.setState(newState.toJS());
    });
  }

  handleUpdateExperience(field, value, experienceId) {
    let body = {};
    body[field] = value;
    this._updateExperience(experienceId, body);
  }

  /*
   * Experience API
   */

  _getExperienceList() {
    authFetch(this.props.experienceUrl)
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
        const editingJSON = json.map(exp =>
          this._createEditingExperience(exp)
        );
        this.setState({
          experience: json,
          editing: editingJSON
        });
      })
      .catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  _createExperience(experience) {
    authFetch(this.props.experienceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(experience)
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
      const newExperience = json;
      const newEditing = this._createEditingExperience(json);

      const newExperienceState = Immutable.fromJS(this.state)
        .update('experience', experience => experience.unshift(newExperience));
      const newEditingState = newExperienceState
        .update('editing', experience => experience.unshift(newEditing));
      const newState = this._resetNewExperience(newEditingState);

      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  _updateExperience(experienceId, experience) {
    authFetch(`${this.props.experienceUrl}/${experienceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(experience)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const experienceIdx = this.state.experience.findIndex(exp =>
        exp.id === experienceId
      );
      const editingIdx = this.state.editing.findIndex(exp =>
        exp.id === experienceId
      );

      const newExperienceState = Immutable.fromJS(this.state)
        .setIn(['experience', experienceIdx], json);
      const newEditingState = newExperienceState
        .setIn(['editing', editingIdx], this._createEditingExperience(json));
      this.setState(newEditingState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  _deleteExperience(experienceId) {
    authFetch(`${this.props.experienceUrl}/${experienceId}`, {
      method: 'DELETE'
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
      json = preprocessJSON(json);
      const deletedId = json.id;
      const newExperience = this.state.experience.filter(exp =>
        exp.id !== deletedId
      );
      const newEditing = this.state.editing.filter(exp =>
        exp.id !== deletedId
      );

      const newExperienceState = Immutable.fromJS(this.state)
        .set('experience', newExperience);
      const newEditingState = newExperienceState
        .set('editing', newEditing);
      this.setState(newEditingState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  render() {
    const addExperience = (
      this.state.addingExperience
      ? (
        <div className="profile-info-subsection profile-add-experience">
          <div className="add-experience-input-group">
            <input className="info-edit" name="company" value={this.company}
                   placeholder="Company (e.g. Google)"
                   onChange={this.updateNewExperienceInput} />
            <input className="info-edit" name="title" value={this.title}
                   placeholder="Title (e.g. CEO)"
                   onChange={this.updateNewExperienceInput} />
          </div>
          <div className="add-experience-input-group">
            <input className="info-edit" name="location" value={this.location}
                   placeholder="Location (e.g. San Francisco, CA)"
                   onChange={this.updateNewExperienceInput} />
          </div>
          <div className="add-experience-input-group">
            <input className="info-edit" name="startDate" value={this.startDate}
                   placeholder="Start Date (e.g. 2016-01-01)"
                   onChange={this.updateNewExperienceInput} />
            <input className="info-edit" name="endDate" value={this.endDate}
                   placeholder="End Date (e.g. 2016-12-31)"
                   onChange={this.updateNewExperienceInput} />
          </div>
          <div className="add-experience-input-group">
            <textarea className="info-edit" rows="5"
                      name="notes" value={this.notes}
                      placeholder="Notes/comments"
                      onChange={this.updateNewExperienceInput} />
          </div>
          <div className="add-experience-footer">
            <i className="ion-ios-close-outline cancel-experience"
               onClick={this.cancelNewExperience} />
            <i className="ion-ios-checkmark-outline save-experience"
               onClick={this.handleCreateExperience} />
          </div>
        </div>
      )
      : (
        <div className="profile-info-subsection profile-add-experience"
             onClick={this.addNewExperience}>
          <i className="ion-ios-plus-empty" />
        </div>
      )
    );
    const experience = this.state.experience.map((exp, index) => {
      const endDate = exp.endDate ? exp.endDate : 'present';
      return (
        <div className="profile-info-subsection" key={exp.id}>
          <i className="ion-trash-a remove-experience" id={exp.id}
             onClick={this.handleDeleteExperience} />
          <div>
            <EditField field="title" id={exp.id}
                       originalValue={exp.title}
                       editingValue={this.state.editing[index].title.value}
                       editing={this.state.editing[index].title.editing}
                       placeholder="Update title"
                       editField={this.editExperienceField}
                       updateInput={this.updateExperienceInput}
                       saveInput={this.handleUpdateExperience} />
            &nbsp;at&nbsp;
            <EditField field="company" id={exp.id}
                       originalValue={exp.company}
                       editingValue={this.state.editing[index].company.value}
                       editing={this.state.editing[index].company.editing}
                       placeholder="Update company"
                       editField={this.editExperienceField}
                       updateInput={this.updateExperienceInput}
                       saveInput={this.handleUpdateExperience} />
          </div>
          <div className="light italic">
            <EditField field="location" id={exp.id}
                       originalValue={exp.location}
                       editingValue={this.state.editing[index].location.value}
                       editing={this.state.editing[index].location.editing}
                       placeholder="Update location"
                       editField={this.editExperienceField}
                       updateInput={this.updateExperienceInput}
                       saveInput={this.handleUpdateExperience} />
            &nbsp;(
            <EditField field="startDate" id={exp.id}
                       fieldType="date"
                       originalValue={exp.startDate}
                       editingValue={this.state.editing[index].startDate.value}
                       editing={this.state.editing[index].startDate.editing}
                       placeholder="Update start date"
                       editField={this.editExperienceField}
                       updateInput={this.updateExperienceInput}
                       saveInput={this.handleUpdateExperience} />
            &nbsp;-&nbsp;
            <EditField field="endDate" id={exp.id}
                       fieldType="date"
                       originalValue={exp.endDate}
                       editingValue={this.state.editing[index].endDate.value}
                       editing={this.state.editing[index].endDate.editing}
                       placeholder="Present"
                       editField={this.editExperienceField}
                       updateInput={this.updateExperienceInput}
                       saveInput={this.handleUpdateExperience} />
            )
          </div>
          <div className="light">
            <EditField field="notes" id={exp.id}
                       originalValue={exp.notes}
                       editingValue={this.state.editing[index].notes.value}
                       editing={this.state.editing[index].notes.editing}
                       placeholder="Update notes"
                       editField={this.editExperienceField}
                       updateInput={this.updateExperienceInput}
                       saveInput={this.handleUpdateExperience} />
          </div>
        </div>
      );
    });
    return (
      <div className="profile-info-section profile-experience-container"
           onClick={this._stopPropagation}>
        {addExperience}
        {experience}
      </div>
    );
  }
}

export default ExperienceSection;

