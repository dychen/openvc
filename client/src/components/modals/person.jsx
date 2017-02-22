import React from 'react';
import Immutable from 'immutable';
import {createEntityModalWrapper} from './create.jsx';

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
      ? 'create-entity-display-panel hover-panel'
      : 'create-entity-display-panel'
    );

    return (
      <div className={className}
           id={this.props.data.id}
           onClick={this.props.handleClick}>
        <img className="entity-photo"
             src={this.props.data.photoUrl} />
        <div className="entity-text">
          <span className="entity-text-row">
            <span className="left">
              {this.props.data.firstName}
              &nbsp;{this.props.data.lastName}
            </span>
            <span className="right">
              {this.props.data.location}
            </span>
          </span>
          <span className="entity-text-row">
            <span className="left">
              {titleStr}
            </span>
            <span className="right">
              {this.props.data.email}
            </span>
          </span>
          <span className="entity-text-row">
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
 *   data [Object]: Entity object to create or update.
 *   matches [Array]: List of matching entities.
 *   visible [boolean]: Whether or not to show the modal.
 *   CREATE_HEADLINE [string]: Modal title.
 *   UPDATE_HEADLINE [string]: Modal "add existing member" section title.
 *
 *   preventModalClose [function]: Function to stop closeModal from triggering.
 *   closeModal [function]: Function to close the modal and reset the state.
 *   updateInput [function]: Function to update user inputs.
 *   createEntity [function]: Function to write new entity to database.
 *   updateEntity [function]: Function to update existing entity in database.
 *   matchEntity [function]: Function to find the closest entity matches.
 */
class CreatePersonModalBase extends React.Component {
  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    const matchPanels = this.props.matches.map((match) =>
      <PersonPanel key={match.id}
                   data={match}
                   handleClick={this.props.updateEntity} />
    );
    const matchSection = (
      this.props.matches.length > 0
      ? (
        <div className="create-entity-match-container">
          <div className="create-entity-match-header">
            {this.props.UPDATE_HEADLINE}
          </div>
          <div className="create-entity-match-list">
            {matchPanels}
          </div>
        </div>
      )
      : ''
    );

    return (
      <div className={modalShowClass} onClick={this.props.closeModal}>
        <div className="ovc-modal create-entity-modal"
             onClick={this.props.preventModalClose}>
          <div className="create-entity-modal-header">
            {this.props.CREATE_HEADLINE}
          </div>
          <div className="create-entity-modal-body">
            <PersonPanel data={this.props.data} />
            <div className="create-entity-input-section">
              <div className="create-entity-input-group">
                <input className="entity-input" name="firstName"
                       value={this.props.data.firstName}
                       placeholder="First name (e.g. Bill)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="lastName"
                       value={this.props.data.lastName}
                       placeholder="Last name (e.g. Gates)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="company"
                       value={this.props.data.company}
                       placeholder="Company (e.g. Bill and Melinda Gates Foundation)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="title"
                       value={this.props.data.title}
                       placeholder="Title (e.g. Co-chair)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
              </div>
              <div className="create-entity-input-group">
                <input className="entity-input" name="email"
                       value={this.props.data.email}
                       placeholder="Email (e.g. bill@microsoft.com)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="location"
                       value={this.props.data.location}
                       placeholder="Location (e.g. Redmond, WA)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="photoUrl"
                       value={this.props.data.photoUrl}
                       placeholder="Photo URL (e.g. https://media.licdn.com/...)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="linkedinUrl"
                       value={this.props.data.linkedinUrl}
                       placeholder="LinkedIn URL (e.g. https://www.linkedin.com/...)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
              </div>
            </div>
            {matchSection}
          </div>
          <div className="create-entity-modal-footer">
            <div className="modal-footer-button left"
                 onClick={this.props.closeModal}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button right"
                 onClick={this.props.createEntity}>
              <i className="ion-plus" />
              <span>Create</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const CreateContactModal = createEntityModalWrapper(CreatePersonModalBase, {
  initialState: {
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
  },
  matchUrl: `${SERVER_URL}/api/v1/match/person`,
  matchCondition: ((data) => (data.firstName && data.lastName || data.company)),
  CREATE_HEADLINE: 'Create a new contact',
  UPDATE_HEADLINE: 'Add an existing contact'
});

const CreateTeamMemberModal = createEntityModalWrapper(CreatePersonModalBase, {
  initialState: {
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
  },
  matchUrl: `${SERVER_URL}/api/v1/match/person`,
  matchCondition: ((data) => (data.firstName && data.lastName || data.company)),
  CREATE_HEADLINE: 'Create a new team member',
  UPDATE_HEADLINE: 'Add existing contact as team member'
});


const CreateBoardMemberModal = createEntityModalWrapper(CreatePersonModalBase, {
  initialState: {
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
  },
  matchUrl: `${SERVER_URL}/api/v1/match/person`,
  matchCondition: ((data) => (data.firstName && data.lastName || data.company)),
  CREATE_HEADLINE: 'Create a new board member',
  UPDATE_HEADLINE: 'Add existing contact as board member'
});

export {CreateContactModal, CreateTeamMemberModal, CreateBoardMemberModal};

