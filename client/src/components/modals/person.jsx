import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import './person.scss';

/*
 * props:
 *   data [Object]: Person object.
 *   handleClick [function]: Function to trigger when panel is clicked.
 */
class PersonPanel extends React.Component {
  render() {
    const titleStr = (
      (this.props.data.company && this.props.data.title)
      ? `${this.props.data.title} at ${this.props.data.company}`
      : `${this.props.data.company}${this.props.data.title}`
    );
    const className = (
      this.props.handleClick
      ? 'create-person-display-panel hover-panel'
      : 'create-person-display-panel'
    );

    return (
      <div className={className}
           id={this.props.data.id}
           onClick={this.props.handleClick}>
        <img className="person-photo"
             src={this.props.data.photoUrl} />
        <div className="person-text">
          <span className="person-text-row">
            <span className="left">
              {this.props.data.firstName}
              &nbsp;{this.props.data.lastName}
            </span>
            <span className="right">
              {this.props.data.location}
            </span>
          </span>
          <span className="person-text-row">
            <span className="left">
              {titleStr}
            </span>
            <span className="right">
              {this.props.data.email}
            </span>
          </span>
          <span className="person-text-row">
            <a href={this.props.data.linkedinUrl} target="_blank">
              {this.props.data.linkedinUrl}
            </a>
          </span>
        </div>
      </div>
    );
  }
}

/*
 * props:
 *   visible [boolean]: Whether or not to show the modal.
 *   CREATE_HEADLINE [string]: Modal title.
 *   UPDATE_HEADLINE [string]: Modal "add existing member" section title.
 *
 *   hideModal [function]: Function to hide the modal.
 *   createEntity [function]: Function to write new entity to database.
 *   updateEntity [function]: Function to update existing entity in database.
 */
class CreatePersonModal extends React.Component {
  constructor(props) {
    super(props);

    this._INITIAL_STATE = {
      data: {
        firstName: '',
        lastName: '',
        company: '',
        title: '',
        location: '',
        email: '',
        photoUrl: '',
        linkedinUrl: ''
      },
      matches: []
    }

    this.state = this._INITIAL_STATE;

    this.preventModalClose = this.preventModalClose.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);

    this.matchPerson = this.matchPerson.bind(this);
  }

  preventModalClose(e) {
    e.stopPropagation();
  }

  closeModal() {
    this.setState(this._INITIAL_STATE, () => { this.props.hideModal(); });
  }

  updateInput(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['data', e.currentTarget.name], e.currentTarget.value);
    this.setState(newState.toJS());
  }

  createEntity(e) {
    this.props.createEntity(this.state.data);
    this.closeModal();
  }

  updateEntity(e) {
    // this.props.updateEntity should close the modal
    const matchIdx = this.state.matches.findIndex((match) =>
      match.id === Number(e.currentTarget.id)
    );
    const match = this.state.matches[matchIdx];

    this.props.updateEntity(match.id, match);
    this.closeModal();
  }

  matchPerson(e) {
    if (this.state.data.firstName && this.state.data.lastName
        || this.state.data.company) {
      authFetch(`${SERVER_URL}/api/v1/match/person`, {
        params: this.state.data
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
        this.setState({ matches: json });
      })
      .catch(err => {
        // Failure
        console.log(err);
        return err;
      });
    }
  }

  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    const matchPanels = this.state.matches.map((match) =>
      <PersonPanel key={match.id}
                   data={match}
                   handleClick={this.updateEntity} />
    );
    const matchSection = (
      this.state.matches.length > 0
      ? (
        <div className="create-person-match-container">
          <div className="create-person-match-header">
            {this.props.UPDATE_HEADLINE}
          </div>
          <div className="create-person-match-list">
            {matchPanels}
          </div>
        </div>
      )
      : ''
    );

    return (
      <div className={modalShowClass} onClick={this.props.hideModal}>
        <div className="ovc-modal create-person-modal"
             onClick={this.preventModalClose}>
          <div className="create-person-modal-header">
            {this.props.CREATE_HEADLINE}
          </div>
          <div className="create-person-modal-body">
            <PersonPanel data={this.state.data} />
            <div className="create-person-input-section">
              <div className="create-person-input-group">
                <input className="person-input" name="firstName"
                       value={this.state.data.firstName}
                       placeholder="First name (e.g. Bill)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
                <input className="person-input" name="lastName"
                       value={this.state.data.lastName}
                       placeholder="Last name (e.g. Gates)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
                <input className="person-input" name="company"
                       value={this.state.data.company}
                       placeholder="Company (e.g. Bill and Melinda Gates Foundation)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
                <input className="person-input" name="title"
                       value={this.state.data.title}
                       placeholder="Title (e.g. Co-chair)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
              </div>
              <div className="create-person-input-group">
                <input className="person-input" name="email"
                       value={this.state.data.email}
                       placeholder="Email (e.g. bill@microsoft.com)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
                <input className="person-input" name="location"
                       value={this.state.data.location}
                       placeholder="Location (e.g. Redmond, WA)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
                <input className="person-input" name="photoUrl"
                       value={this.state.data.photoUrl}
                       placeholder="Photo URL (e.g. https://media.licdn.com/...)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
                <input className="person-input" name="linkedinUrl"
                       value={this.state.data.linkedinUrl}
                       placeholder="LinkedIn URL (e.g. https://www.linkedin.com/...)"
                       onBlur={this.matchPerson}
                       onChange={this.updateInput} />
              </div>
            </div>
            {matchSection}
          </div>
          <div className="create-person-modal-footer">
            <div className="modal-footer-button left"
                 onClick={this.closeModal}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button right"
                 onClick={this.createEntity}>
              <i className="ion-plus" />
              <span>Create</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreatePersonModal;

