import React from 'react';

import LinkWrapper from '../../components/link.jsx';
import {CreateContactModal} from '../../components/modals/person.jsx';

import './all.scss';

/*
 * props:
 *   _USER_TYPE [string]: 'founder' or 'investor', depending on user role.
 *   contacts [list]: List of contact objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *
 *   getAllContacts [function]: Function to load contact data.
 *   createContact [function]: Function to write new contact to database. Gets
 *                             called in the child modal component.
 *   addConnection [function]: Function to create a new connection in the
 *                             database.
 *   removeConnection [function]: Function to remove an existing connection
 *                                from the database.
 */
class AllContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    };

    this.addNewContact = this.addNewContact.bind(this);
    this.cancelNewContact = this.cancelNewContact.bind(this);
    this.addConnection = this.addConnection.bind(this);
    this.removeConnection = this.removeConnection.bind(this);

    // Fetch data
    this.props.getAllContacts();
  }

  addNewContact(e) {
    this.setState({ modalVisible: true });
  }

  cancelNewContact(e) {
    this.setState({ modalVisible: false });
  }

  addConnection(e) {
    e.stopPropagation();
    this.props.addConnection(e.currentTarget.id);
  }

  removeConnection(e) {
    e.stopPropagation();
    this.props.removeConnection(e.currentTarget.id);
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
          <div className="ovc-all-contacts-panel-container" key={contact.id}>
            <LinkWrapper to={`/${this.props._USER_TYPE}/contacts/${contact.id}`}>
              <div className="ovc-all-contacts-contact-panel">
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
            </LinkWrapper>
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
             onClick={this.addNewContact}>
          <i className="ion-plus create-contact" />
          <span>Create a new contact</span>
        </div>
        {contactGroups}
        <CreateContactModal visible={this.state.modalVisible}
                            hideModal={this.cancelNewContact}
                            createEntity={this.props.createContact}
                            updateEntity={this.props.addConnection} />
      </div>
    );
  }
}

export default AllContactsSection;

