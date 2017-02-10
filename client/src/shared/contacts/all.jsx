import React from 'react';
import {hashHistory} from 'react-router';

import CreateContactModal from './modal.jsx';

import './all.scss';

class AllContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      creatingContact: false
    };

    this.toggleCreatingContact = this.toggleCreatingContact.bind(this);
    this._goToContactPage = this._goToContactPage.bind(this);
  }

  toggleCreatingContact(e) {
    this.setState({ 'creatingContact': !this.state.creatingContact });
  }

  _goToContactPage(e) {
    const linkUrl = '/' + this.props._USER_TYPE + '/contacts/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
  }

  render() {
    const contactGroupLabels = Array.from(
      new Set(this.props.contacts.map(contact => contact[this.props.groupBy]))
    );
    contactGroupLabels.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    const contactGroups = contactGroupLabels.map(label => {
      const contacts = this.props.contacts.filter(contact =>
        contact[this.props.groupBy] === label
      ).map(contact => {
        return (
          <div className="ovc-contacts-contact-panel-container" key={contact.id}>
            <div className="ovc-contacts-contact-panel" id={contact.id}
                 onClick={this._goToContactPage}>
              <img className="contact-photo" src={contact.photoUrl} />
              <div className="contact-text">
                <div className="contact-name">
                  {contact.name}
                </div>
                <div className="contact-occupation">
                  {contact.title}, {contact.company}
                </div>
                <div className="contact-tags">
                  {contact.tags.join(', ')}
                </div>
                <div className="contact-icons">
                  <i className="ion-ios-plus add-contact" />
                </div>
              </div>
            </div>
          </div>
        );
      });
      return (
        <div key={label}>
          <h3>{label}</h3>
          <div className="ovc-contacts-contact-sublist">
            {contacts}
          </div>
        </div>
      );
    });

    return (
      <div className="ovc-contacts-contact-list">
        <div className="ovc-create-contact-button"
             onClick={this.toggleCreatingContact}>
          <i className="ion-plus create-contact" />
          <span>Create a new contact</span>
        </div>
        {contactGroups}
        <CreateContactModal creatingContact={this.state.creatingContact}
                            toggleCreatingContact={this.toggleCreatingContact} />
      </div>
    );
  }
}

export default AllContactsSection;

