import React from 'react';
import {hashHistory} from 'react-router';

import './user.scss';

/*
 * props:
 *   _USER_TYPE [string]: 'founder' or 'investor', depending on user role.
 *   contacts [list]: List of contact objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *
 *   getUserContacts [function]: Function to load contact data.
 *   toggleExpanded [function]: Function to toggle interaction list visibility.
 *   addInteraction [function]: Function to write new interaction to database.
 *   removeInteraction [function]: Function to remove an existing interaction
 *                                 from the database.
 */
class UserContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.addInteraction = this.addInteraction.bind(this);
    this.removeInteraction = this.removeInteraction.bind(this);
    this._goToContactPage = this._goToContactPage.bind(this);

    // Fetch data
    this.props.getUserContacts();
  }

  toggleExpanded(e) {
    e.stopPropagation();
    this.props.toggleExpanded(Number(e.currentTarget.id));
  }

  addInteraction(e) {
    this.props.addInteraction({
      user: 'Daniel Chen', // TODO
      label: 'Meeting',
      date: '2017-02-02',
      notes: ''
    }, Number(e.currentTarget.id));
  }

  removeInteraction(interactionId, contactId) {
    // This is redundant, but we have this function for symmetry.
    this.props.removeInteraction(Number(interactionId), Number(contactId));
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
        contact.interactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const interactions = contact.interactions.map(interaction =>
          (
            <tr key={interaction.id}>
              <td>{interaction.date}</td>
              <td>{interaction.label}</td>
              <td>{interaction.user}</td>
              <td>
                <i className="ion-ios-close remove-interaction"
                   onClick={() => this.removeInteraction(interaction.id,
                                                         contact.id)} />
              </td>
            </tr>
          )
        );
        const expandedSection = (
          contact.expanded
          ? (
            <table>
              <thead>
                <tr><td colSpan="4">Interaction History</td></tr>
              </thead>
              <tbody>
                {interactions}
                <tr>
                  <td className="add-interaction" colSpan="4"
                      id={contact.id}
                      onClick={this.addInteraction}>
                    <i className="ion-plus" />
                  </td>
                </tr>
              </tbody>
            </table>
          )
          : ''
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
                  <i className="ion-chatbubbles start-chat" />
                  <i className="ion-ios-list expand-contact" id={contact.id}
                     onClick={this.toggleExpanded} />
                </div>
              </div>
            </div>
            <div className="ovc-contacts-contact-interactions">
              {expandedSection}
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
        {contactGroups}
      </div>
    );
  }
}

export default UserContactsSection;

