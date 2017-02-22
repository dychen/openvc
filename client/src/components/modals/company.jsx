import React from 'react';
import Immutable from 'immutable';
import {createEntityModalWrapper} from './create.jsx';

/*
 * props:
 *   data [Object]: Company object.
 *   handleClick [function]: Function to trigger when panel is clicked.
 */
class CompanyPanel extends React.Component {
  render() {
    const sectorStr = (
      (this.props.data.segment && this.props.data.sector)
      ? `${this.props.data.segment} ${this.props.data.sector}`
      : `${this.props.data.segment}${this.props.data.sector}`
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
             src={this.props.data.logoUrl} />
        <div className="person-text">
          <span className="person-text-row">
            <span className="left">
              {this.props.data.name}
            </span>
            <span className="right">
              {this.props.data.location}
            </span>
          </span>
          <span className="person-text-row">
            <span className="left">
              {sectorStr}
            </span>
            <span className="right">
              {this.props.data.email}
            </span>
          </span>
          <span className="person-text-row">
            <a href={this.props.data.website} target="_blank">
              {this.props.data.website}
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
class CreateCompanyModalBase extends React.Component {
  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    const matchPanels = this.props.matches.map((match) =>
      <CompanyPanel key={match.id}
                    data={match}
                    handleClick={this.props.updateEntity} />
    );
    const matchSection = (
      this.props.matches.length > 0
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
      <div className={modalShowClass} onClick={this.props.closeModal}>
        <div className="ovc-modal create-person-modal"
             onClick={this.props.preventModalClose}>
          <div className="create-person-modal-header">
            {this.props.CREATE_HEADLINE}
          </div>
          <div className="create-person-modal-body">
            <CompanyPanel data={this.props.data} />
            <div className="create-person-input-section">
              <div className="create-person-input-group">
                <input className="person-input" name="name"
                       value={this.props.data.name}
                       placeholder="Company name (e.g. Google)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="person-input" name="segment"
                       value={this.props.data.segment}
                       placeholder="Segment (Consumer or Enterprise)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="person-input" name="sector"
                       value={this.props.data.sector}
                       placeholder="Sector (e.g. Search)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
              </div>
              <div className="create-person-input-group">
                <input className="person-input" name="location"
                       value={this.props.data.location}
                       placeholder="Location (e.g. Mountain View, CA)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="person-input" name="logoUrl"
                       value={this.props.data.logoUrl}
                       placeholder="Logo URL (e.g. https://media.licdn.com/...)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
                <input className="person-input" name="website"
                       value={this.props.data.website}
                       placeholder="Website URL (e.g. https://www.google.com)"
                       onBlur={this.props.matchEntity}
                       onChange={this.props.updateInput} />
              </div>
            </div>
            {matchSection}
          </div>
          <div className="create-person-modal-footer">
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

const CreateCompanyModal = createEntityModalWrapper(CreateCompanyModalBase, {
  initialState: {
    data: {
      name: '',
      segment: '',
      sector: '',
      location: '',
      website: '',
      logoUrl: ''
    },
    matches: []
  },
  matchUrl: `${SERVER_URL}/api/v1/match/company`,
  matchCondition: ((data) => data.name),
  CREATE_HEADLINE: 'Create a new company',
  UPDATE_HEADLINE: 'Add an existing company'
});

export default CreateCompanyModal;

