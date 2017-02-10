import React from 'react';
import {hashHistory} from 'react-router';

import './all.scss';

class AllContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this._goToContactPage = this._goToContactPage.bind(this);
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
        {contactGroups}
      </div>
    );
  }
}

export default AllContactsSection;

