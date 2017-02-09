import React from 'react';
import Immutable from 'immutable';

import EditField from './edit.jsx';

import './experience.scss';

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

    this._stopPropagation = this._stopPropagation.bind(this);
    // These functions all govern experience creation/deletion - they do not
    // have anything to do with field updating, which are all handled through
    // props.
    this.updateInput = this.updateInput.bind(this);
    this.addExperience = this.addExperience.bind(this);
    this.cancelExperience = this.cancelExperience.bind(this);
    this.saveExperience = this.saveExperience.bind(this);
    this.removeExperience = this.removeExperience.bind(this);
  }

  _stopPropagation(e) {
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
                       placeholder="Update your title"
                       editing={this.props.editingExperience[index].title}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            &nbsp;at&nbsp;
            <EditField field="company"
                       value={exp.company} id={exp.id}
                       placeholder="Update your company"
                       editing={this.props.editingExperience[index].company}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
          </div>
          <div className="light italic">
            <EditField field="location"
                       value={exp.location} id={exp.id}
                       placeholder="Update your location"
                       editing={this.props.editingExperience[index].location}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            &nbsp;(
            <EditField field="startDate"
                       value={exp.startDate} id={exp.id}
                       placeholder="Update your start date"
                       editing={this.props.editingExperience[index].startDate}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            &nbsp;-&nbsp;
            <EditField field="endDate"
                       value={exp.endDate} id={exp.id}
                       placeholder="Present"
                       editing={this.props.editingExperience[index].endDate}
                       editField={this.props.editField}
                       updateInput={this.props.updateInput}
                       saveInput={this.props.saveInput} />
            )
          </div>
          <div className="light">
            <EditField field="notes"
                       value={exp.notes} id={exp.id}
                       placeholder="Update any notes"
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
           onClick={this._stopPropagation}>
        {addExperience}
        {experience}
      </div>
    );
  }
}

export default ExperienceSection;

