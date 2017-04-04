import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import {EditField} from '../../components/editfield.jsx';

import './experience.scss';

/*
 * props:
 *   experienceUrl [string]: API endpoint to call for experience CRUD.
 */
class ExperienceSection extends React.Component {
  constructor(props) {
    super(props);

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
      experience: []
    };

    // Helpers
    this._resetNewExperience = this._resetNewExperience.bind(this);

    // New Experience component handlers
    this.addNewExperience = this.addNewExperience.bind(this);
    this.cancelNewExperience = this.cancelNewExperience.bind(this);
    this.updateNewExperienceInput = this.updateNewExperienceInput.bind(this);
    this.handleCreateExperience = this.handleCreateExperience.bind(this);
    this.handleDeleteExperience = this.handleDeleteExperience.bind(this);

    // Experience EditField component handlers
    this.handleUpdateExperience = this.handleUpdateExperience.bind(this);

    // Experience API
    this._getExperienceList = this._getExperienceList.bind(this);
    this._createExperience = this._createExperience.bind(this);
    this._updateExperience = this._updateExperience.bind(this);
    this._deleteExperience = this._deleteExperience.bind(this);

    this._getExperienceList();
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
   * Experience EditField component handlers
   */

  handleUpdateExperience(field, value, experienceId) {
    // Optimistic update
    const experienceIdx = this.state.experience.findIndex(exp =>
      exp.id === experienceId
    );
    const newState = Immutable.fromJS(this.state)
      .setIn(['experience', experienceIdx, field], value);

    // Write to the backend in callback
    this.setState(newState.toJS(), () => {
      let body = {};
      body[field] = value;
      this._updateExperience(experienceId, body);
    });
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
        this.setState({ experience: preprocessJSON(json) });
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
      const newExperience = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state)
        .update('experience', experience => experience.unshift(newExperience));

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

      const newState = Immutable.fromJS(this.state)
        .setIn(['experience', experienceIdx], json);
      this.setState(newState.toJS());
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

      const newState = Immutable.fromJS(this.state)
        .set('experience', newExperience);
      this.setState(newState.toJS());
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
                       placeholder="Update title"
                       onSave={this.handleUpdateExperience} />
            &nbsp;at&nbsp;
            <EditField field="company" id={exp.id}
                       originalValue={exp.company}
                       placeholder="Update company"
                       onSave={this.handleUpdateExperience} />
          </div>
          <div className="light italic">
            <EditField field="location" id={exp.id}
                       originalValue={exp.location}
                       placeholder="Update location"
                       onSave={this.handleUpdateExperience} />
            &nbsp;(
            <EditField field="startDate" id={exp.id}
                       fieldType="date"
                       originalValue={exp.startDate}
                       placeholder="Update start date"
                       onSave={this.handleUpdateExperience} />
            &nbsp;-&nbsp;
            <EditField field="endDate" id={exp.id}
                       fieldType="date"
                       originalValue={exp.endDate}
                       placeholder="Present"
                       onSave={this.handleUpdateExperience} />
            )
          </div>
          <div className="light">
            <EditField field="notes" id={exp.id}
                       fieldType="text"
                       originalValue={exp.notes}
                       placeholder="Update notes"
                       onSave={this.handleUpdateExperience} />
          </div>
        </div>
      );
    });
    return (
      <div className="profile-info-section profile-experience-container">
        {addExperience}
        {experience}
      </div>
    );
  }
}

export default ExperienceSection;

