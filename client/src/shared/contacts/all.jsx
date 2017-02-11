import React from 'react';
import {hashHistory} from 'react-router';

import CreateContactModal from './modal.jsx';

import './all.scss';

/*
 * props:
 *   _USER_TYPE [string]: 'founder' or 'investor', depending on user role.
 *   contacts [list]: List of contact objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *
 *   getAllContacts [function]: Function to load contact data.
 *   createContact [function]: Function to write new contact to database. Gets
 *                             called in the child component
 *                             (CreateContactModal).
 *   createContactandConnect [function]: Function to write new contact to
 *                                       database as a connection. Gets called
 *                                       in the child component
 *                                       (CreateContactModal).
 *   addConnection [function]: Function to create a new connection in the
 *                             database.
 *   removeConnection [function]: Function to remove an existing connection
 *                                from the database.
 */
class AllContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      creatingContact: false
    };

    this.toggleCreatingContact = this.toggleCreatingContact.bind(this);
    this.addConnection = this.addConnection.bind(this);
    this.removeConnection = this.removeConnection.bind(this);
    this._goToContactPage = this._goToContactPage.bind(this);

    // Fetch data
    this.props.getAllContacts();
  }

  toggleCreatingContact(e) {
    this.setState({ 'creatingContact': !this.state.creatingContact });
  }

  addConnection(e) {
    e.stopPropagation();
    this.props.addConnection(e.currentTarget.id);
  }

  removeConnection(e) {
    e.stopPropagation();
    this.props.removeConnection(e.currentTarget.id);
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
        const contactIcon = (
          contact.connected
          ? <i className="ion-ios-close remove-contact"
               id={contact.id}
               onClick={this.removeConnection} />
          : <i className="ion-person-add add-contact"
               id={contact.id}
               onClick={this.addConnection} />
        );
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
                  {contactIcon}
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
                            toggleCreatingContact={this.toggleCreatingContact}
                            createContact={this.props.createContact}
                            createContactandConnect={this.props.createContactandConnect} />
      </div>
    );
  }
}

export default AllContactsSection;

