import React from 'react';
import Immutable from 'immutable';

import './modal.scss';

/*
 * props:
 *   creatingContact [boolean]: Whether or not a contact is being created - if
 *                              so, show the modal.
 *
 *   toggleCreatingContact [function]: Function toggle modal visibility.
 *   createContact [function]: Function to write new contact to database.
 *   createContactandConnect [function]: Function to write new contact to
 *                                       database as a connection.
 */
class CreateContactModal extends React.Component {
  constructor(props) {
    super(props);

    this._INITIAL_STATE = {
      contact: {
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

    this._preventModalClose = this._preventModalClose.bind(this);
    this._clearContact = this._clearContact.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.createContact = this.createContact.bind(this);
    this.createContactandConnect = this.createContactandConnect.bind(this);
  }

  _preventModalClose(e) {
    e.stopPropagation();
  }

  _clearContact() {
    // WARNING: May cause a race condition, but should be okay because both
    //          function calls (toggleCreatingContact() and _clearContact())
    //          update the states of different components.
    this.setState(this._INITIAL_STATE);
    this.props.toggleCreatingContact();
  }

  updateInput(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['contact', e.currentTarget.name], e.currentTarget.value);
    this.setState(newState.toJS());
  }

  createContact(e) {
    // WARNING: May cause a race condition, but should be okay because all
    //          three function calls (createContact(), toggleCreatingContact(),
    //          and _clearContact()) update the states of different components.
    this.props.createContact({
      firstName: this.state.contact.firstName,
      lastName: this.state.contact.lastName,
      company: this.state.contact.company,
      title: this.state.contact.title,
      location: this.state.contact.location,
      email: this.state.contact.email,
      photoUrl: this.state.contact.photoUrl,
      linkedinUrl: this.state.contact.linkedinUrl
    });
    this._clearContact();
  }

  createContactandConnect(e) {
    // WARNING: May cause a race condition, but should be okay because all
    //          three function calls (createContact(), toggleCreatingContact(),
    //          and _clearContact()) update the states of different components.
    this.props.createContactandConnect({
      firstName: this.state.contact.firstName,
      lastName: this.state.contact.lastName,
      company: this.state.contact.company,
      title: this.state.contact.title,
      location: this.state.contact.location,
      email: this.state.contact.email,
      photoUrl: this.state.contact.photoUrl,
      linkedinUrl: this.state.contact.linkedinUrl
    });
    this._clearContact();
  }

  render() {
    const modalShowClass = (
      this.props.creatingContact
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    return (
      <div className={modalShowClass} onClick={this.props.toggleCreatingContact}>
        <div className="ovc-modal create-contact-modal"
             onClick={this._preventModalClose}>
          <div className="create-contact-modal-header">
            Create a new Contact
          </div>
          <div className="create-contact-modal-body">
            <div className="create-contact-display-panel">
              <img className="contact-photo"
                   src={this.state.contact.photoUrl} />
              <div className="contact-text">
                <span>
                  {this.state.contact.firstName}
                  &nbsp;{this.state.contact.lastName}
                </span>
                <span>
                  {this.state.contact.company}
                  &nbsp;{this.state.contact.title}
                </span>
                <span>
                  {this.state.contact.email}
                </span>
                <span>
                  {this.state.contact.location}
                </span>
                <span>
                  <a href={this.state.contact.linkedinUrl} target="_blank">
                    {this.state.contact.linkedinUrl}
                  </a>
                </span>
              </div>
            </div>
            <div className="create-contact-input-section">
              <div className="create-contact-input-group">
                <input className="contact-input" name="firstName"
                       value={this.state.contact.firstName}
                       placeholder="First name (e.g. Bill)"
                       onChange={this.updateInput} />
                <input className="contact-input" name="lastName"
                       value={this.state.contact.lastName}
                       placeholder="Last name (e.g. Gates)"
                       onChange={this.updateInput} />
              </div>
              <div className="create-contact-input-group">
                <input className="contact-input" name="company"
                       value={this.state.contact.company}
                       placeholder="Company (e.g. Bill and Melinda Gates Foundation)"
                       onChange={this.updateInput} />
                <input className="contact-input" name="title"
                       value={this.state.contact.title}
                       placeholder="Title (e.g. Co-chair)"
                       onChange={this.updateInput} />
              </div>
              <div className="create-contact-input-group">
                <input className="contact-input" name="email"
                       value={this.state.contact.email}
                       placeholder="Email (e.g. bill@microsoft.com)"
                       onChange={this.updateInput} />
                <input className="contact-input" name="location"
                       value={this.state.contact.location}
                       placeholder="Location (e.g. Redmond, WA)"
                       onChange={this.updateInput} />
              </div>
              <div className="create-contact-input-group">
                <input className="contact-input" name="photoUrl"
                       value={this.state.contact.photoUrl}
                       placeholder="Photo URL (e.g. https://media.licdn.com/...)"
                       onChange={this.updateInput} />
                <input className="contact-input" name="linkedinUrl"
                       value={this.state.contact.linkedinUrl}
                       placeholder="LinkedIn URL (e.g. https://www.linkedin.com/...)"
                       onChange={this.updateInput} />
              </div>
            </div>
          </div>
          <div className="create-contact-modal-footer">
            <div className="modal-footer-button left"
                 onClick={this._clearContact}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button middle"
                 onClick={this.createContact}>
              <i className="ion-plus" />
              <span>Create Contact</span>
            </div>
            <div className="modal-footer-button right"
                 onClick={this.createContactandConnect}>
              <i className="ion-plus" />
              <span>Create and Connect</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateContactModal;

