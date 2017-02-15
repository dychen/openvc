import React from 'react';
import Immutable from 'immutable';

import './person.scss';

/*
 * props:
 *   visible [boolean]: Whether or not to show the modal.
 *
 *   hideModal [function]: Function to hide the modal.
 *   createEntity [function]: Function to write new entity to database.
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
      }
    }

    this.state = this._INITIAL_STATE;

    this.preventModalClose = this.preventModalClose.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.createEntity = this.createEntity.bind(this);
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
    // this.props.createEntity should close the modal
    this.props.createEntity(this.state.data);
    this.setState(this._INITIAL_STATE);
  }

  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    return (
      <div className={modalShowClass} onClick={this.props.hideModal}>
        <div className="ovc-modal create-person-modal"
             onClick={this.preventModalClose}>
          <div className="create-person-modal-header">
            Create a new team member
          </div>
          <div className="create-person-modal-body">
            <div className="create-person-display-panel">
              <img className="person-photo"
                   src={this.state.data.photoUrl} />
              <div className="person-text">
                <span>
                  {this.state.data.firstName}
                  &nbsp;{this.state.data.lastName}
                </span>
                <span>
                  {this.state.data.company}
                  &nbsp;{this.state.data.title}
                </span>
                <span>
                  {this.state.data.email}
                </span>
                <span>
                  {this.state.data.location}
                </span>
                <span>
                  <a href={this.state.data.linkedinUrl} target="_blank">
                    {this.state.data.linkedinUrl}
                  </a>
                </span>
              </div>
            </div>
            <div className="create-person-input-section">
              <div className="create-person-input-group">
                <input className="person-input" name="firstName"
                       value={this.state.data.firstName}
                       placeholder="First name (e.g. Bill)"
                       onChange={this.updateInput} />
                <input className="person-input" name="lastName"
                       value={this.state.data.lastName}
                       placeholder="Last name (e.g. Gates)"
                       onChange={this.updateInput} />
              </div>
              <div className="create-person-input-group">
                <input className="person-input" name="company"
                       value={this.state.data.company}
                       placeholder="Company (e.g. Bill and Melinda Gates Foundation)"
                       onChange={this.updateInput} />
                <input className="person-input" name="title"
                       value={this.state.data.title}
                       placeholder="Title (e.g. Co-chair)"
                       onChange={this.updateInput} />
              </div>
              <div className="create-person-input-group">
                <input className="person-input" name="email"
                       value={this.state.data.email}
                       placeholder="Email (e.g. bill@microsoft.com)"
                       onChange={this.updateInput} />
                <input className="person-input" name="location"
                       value={this.state.data.location}
                       placeholder="Location (e.g. Redmond, WA)"
                       onChange={this.updateInput} />
              </div>
              <div className="create-person-input-group">
                <input className="person-input" name="photoUrl"
                       value={this.state.data.photoUrl}
                       placeholder="Photo URL (e.g. https://media.licdn.com/...)"
                       onChange={this.updateInput} />
                <input className="person-input" name="linkedinUrl"
                       value={this.state.data.linkedinUrl}
                       placeholder="LinkedIn URL (e.g. https://www.linkedin.com/...)"
                       onChange={this.updateInput} />
              </div>
            </div>
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

