import React from 'react';
import Immutable from 'immutable';

import './modal.scss';

class CreateContactModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    };

    this._preventModalClose = this._preventModalClose.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  _preventModalClose(e) {
    e.stopPropagation();
  }

  updateInput(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['contact', e.currentTarget.name], e.currentTarget.value);
    this.setState(newState.toJS());
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
                       placeholder="Location (e.g. Seattle, WA)"
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
            <div className="modal-footer-button cancel-create-contact"
                 onClick={this.props.toggleCreatingContact}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button confirm-create-contact">
              <i className="ion-plus" />
              <span>Create Contact</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateContactModal;

