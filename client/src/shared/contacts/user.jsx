import React from 'react';
import {hashHistory} from 'react-router';
import moment from 'moment';
import {getStartOfQuarter, getEndOfQuarter, getStartOfYear,
        getEndOfYear} from '../../utils/datetime.js';

import EditTable from '../../components/edittable.jsx';
import {CreateContactModal} from '../../components/modals/person.jsx';

import './user.scss';

/*
 * props:
 *   title [string]: Title of subpanel.
 *   interaction [Object]: {
 *     type [string]: Interaction type (e.g. 'Meeting'),
 *     date [Date]: Interaction date,
 *     label [string]: Interaction label,
 *     duration [number]: Duration of interaction
 *   }
 */
class InteractionLastSubpanel extends React.Component {
  render() {
    let interactionIcon;
    const interactionType = (this.props.interaction.type
                             ? this.props.interaction.type : '');
    switch (interactionType.toLowerCase()) {
      case 'meeting':
        interactionIcon = <i className="ion-ios-people icon-main" />;
        break;
      case 'call':
        interactionIcon = <i className="ion-ios-telephone icon-main" />;
        break;
      case 'email':
        interactionIcon = <i className="ion-email icon-main" />;
        break;
      default:
        interactionIcon = <i className="ion-help icon-main" />;
        break;
    }
    const subpanelText = {
      type: this.props.interaction.type ? this.props.interaction.type : '',
      date: (this.props.interaction.date ?
             ` on ${moment(this.props.interaction.date).format('ll')}` : ''),
      label: this.props.interaction.type ? this.props.interaction.label : '',
      duration: (this.props.interaction.duration ?
                 ` (${this.props.interaction.duration} min)` : '')
    };
    return (
      <div className="ovc-user-contacts-overview-subpanel">
        <div className="overview-subpanel-title">
          {this.props.title}
        </div>
        <div className="overview-subpanel-subsection long">
          <span className="overview-value">
            {interactionIcon}
          </span>
          <span className="overview-value">
            {subpanelText.type}
            {subpanelText.date}
          </span>
          <span className="overview-value">
            {subpanelText.label}
            {subpanelText.duration}
          </span>
        </div>
      </div>
    );
  }
}

/*
 * props:
 *   title [string]: Title of subpanel.
 *   data [Object]: {
 *     number [number]: Number of interactions,
 *     duration [number]: Duration of interactions
 *   }
 */
class InteractionStatsSubpanel extends React.Component {
  render() {
    return (
      <div className="ovc-user-contacts-overview-subpanel">
        <div className="overview-subpanel-title">
          {this.props.title}
        </div>
        <div className="overview-subpanel-subsection short">
          <span className="overview-label">
            Number of Interactions
          </span>
          <span className="overview-value">
            <i className="ion-pound icon-left" />
            <span className="value-large">
              {this.props.data.number}
            </span>
          </span>
        </div>
        <div className="overview-subpanel-subsection short">
          <span className="overview-label">
            Time Spent (min)
          </span>
          <span className="overview-value">
            <i className="ion-clock icon-left" />
            <span className="value-large">
              {this.props.data.duration}
            </span>
          </span>
        </div>
      </div>
    );
  }
}

/*
 * props:
 *   contact [string]: Target contact object.
 */
class InteractionsTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['date', 'type', 'label', 'duration', 'notes'];
    this.FIELD_MAP = {
      date: {
        display: 'Date',
        type: 'date',
        required: false
      },
      type: {
        display: 'Type',
        type: 'string',
        required: false
      },
      label: {
        display: 'Label',
        type: 'string',
        required: false
      },
      duration: {
        display: 'Duration',
        type: 'string',
        required: false
      },
      notes: {
        display: 'Notes',
        type: 'text truncated',
        required: false
      }
    };
  }

  render() {
    const API_URL = `${SERVER_URL}/api/v1/contacts/${this.props.contact.id}/interactions`;
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={API_URL}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   {...this.props} />
      </div>
    );
  }
}

/*
 * props:
 *   _USER_TYPE [string]: 'founder' or 'investor', depending on user role.
 *   contacts [list]: List of contact objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *   orderBy [string]: Field to group contacts by (e.g. 'lastInteraction').
 *
 *   Contact functions:
 *   getUserContacts [function]: Function to load contact data.
 *   createContact [function]: Function to write new contact to database. Gets
 *                             called in the child modal component.
 *   addConnection [function]: Function to create a new connection in the
 *                             database.
 *   removeConnection [function]: Function to remove an existing connection
 *                                from the database.
 *   Interaction functions:
 *   toggleExpanded [function]: Function to toggle interaction list visibility.
 */
class UserContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contactModalVisible: false
    };

    // Create contact modal
    this.addNewContact = this.addNewContact.bind(this);
    this.cancelNewContact = this.cancelNewContact.bind(this);

    this.removeConnection = this.removeConnection.bind(this);

    this.toggleExpanded = this.toggleExpanded.bind(this);

    // Helpers
    this._goToContactPage = this._goToContactPage.bind(this);
    this._filterLastQuarterInteractions = this._filterLastQuarterInteractions.bind(this);
    this._filterLastYearInteractions = this._filterLastYearInteractions.bind(this);
    this._sumInteractions = this._sumInteractions.bind(this);
    this._getInteractionStats = this._getInteractionStats.bind(this);
    this._createContactPanel = this._createContactPanel.bind(this);

    // Fetch data
    this.props.getUserContacts();
  }

  /* Create contact modal */

  addNewContact(e) {
    this.setState({ contactModalVisible: true });
  }

  cancelNewContact(e) {
    this.setState({ contactModalVisible: false });
  }

  /* Interaction API */

  toggleExpanded(e) {
    e.stopPropagation();
    this.props.toggleExpanded(Number(e.currentTarget.id));
  }

  removeConnection(e) {
    e.stopPropagation();
    this.props.removeConnection(e.currentTarget.id);
  }

  /* Helpers */

  _goToContactPage(e) {
    const linkUrl = '/' + this.props._USER_TYPE + '/contacts/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
  }

  _filterLastQuarterInteractions(interactions) {
    const start = getStartOfQuarter(new Date(), -1);
    const end = getEndOfQuarter(new Date(), -1);
    return interactions.filter(interaction =>
      interaction.date >= start && interaction.date <= end
    );
  }

  _filterLastYearInteractions(interactions) {
    const start = getStartOfYear(new Date(), -1);
    const end = getEndOfYear(new Date(), -1);
    return interactions.filter(interaction =>
      interaction.date >= start && interaction.date <= end
    );
  }

  _sumInteractions(interactions, field) {
    return interactions.reduce((accum, next) => accum + next[field], 0);
  }

  _getInteractionStats(contact) {
    return {
      total: {
        duration: this._sumInteractions(contact.interactions, 'duration'),
        number: contact.interactions.length,
      },
      lastQuarter: {
        duration: this._sumInteractions(
          this._filterLastQuarterInteractions(contact.interactions),
          'duration'
        ),
        number: this._filterLastQuarterInteractions(contact.interactions).length,
      },
      lastYear: {
        duration: this._sumInteractions(
          this._filterLastYearInteractions(contact.interactions),
          'duration'
        ),
        number: this._filterLastYearInteractions(contact.interactions).length,
      },
      lastInteraction: contact.interactions.length > 0 ? contact.interactions[0] : {}
    };
  }

  _createContactPanel(contact) {
    const interactionStats = this._getInteractionStats(contact);

    const expandedSection = (
      contact.expanded
      ? (
        <div>
          <div className="ovc-contacts-contact-toggle-interactions"
               id={contact.id}
               onClick={this.toggleExpanded}>
            <i className="ion-chevron-up" />
          </div>
          <InteractionsTableSection contact={contact} />
        </div>
      )
      : (
        <div className="ovc-contacts-contact-toggle-interactions"
             id={contact.id}
             onClick={this.toggleExpanded}>
          <i className="ion-chevron-down" />
        </div>
      )
    );

    return (
      <div className="ovc-user-contacts-panel-container" key={contact.id}>
        <div className="ovc-user-contacts-contact-panel" id={contact.id}
             onClick={this._goToContactPage}>
          <div className="ovc-user-contacts-left-subpanel">
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
            </div>
          </div>
          <div className="ovc-user-contacts-subpanel-container">
            <InteractionLastSubpanel title="Last"
                                     interaction={interactionStats.lastInteraction} />
            <InteractionStatsSubpanel title="Total"
                                      data={interactionStats.total} />
            <InteractionStatsSubpanel title="Last Year"
                                      data={interactionStats.lastYear} />
            <InteractionStatsSubpanel title="Last Quarter"
                                      data={interactionStats.lastQuarter} />
          </div>
          <div className="contact-icons">
            <i className="ion-ios-email send-mail" />
            <i className="ion-ios-close remove-contact"
               id={contact.id}
               onClick={this.removeConnection} />
          </div>
        </div>
        <div className="ovc-contacts-contact-interactions">
          {expandedSection}
        </div>
      </div>
    );
  }

  _sortContacts(contacts) {
    switch (this.props.orderBy) {
      case 'name':
        contacts.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        break;
      case 'lastInteraction':
        contacts.sort((a, b) =>
          (new Date(this._getInteractionStats(b).lastInteraction.date || 0)
           - new Date(this._getInteractionStats(a).lastInteraction.date || 0))
        );
        break;
      case 'quarterDuration':
        contacts.sort((a, b) =>
          (this._getInteractionStats(b).lastQuarter.duration
           - this._getInteractionStats(a).lastQuarter.duration)
        );
        break;
      case 'yearDuration':
        contacts.sort((a, b) =>
          (this._getInteractionStats(b).lastYear.duration
           - this._getInteractionStats(a).lastYear.duration)
        );
        break;
      case 'totalDuration':
        contacts.sort((a, b) =>
          (this._getInteractionStats(b).total.duration
           - this._getInteractionStats(a).total.duration)
        );
        break;
      default:
        break;
    }
  }

  render() {
    let contacts;
    if (this.props.groupBy === 'none') {
      this._sortContacts(this.props.contacts);
      contacts = this.props.contacts.map(contact =>
        this._createContactPanel(contact)
      );
    }
    else {
      this._sortContacts(this.props.contacts);
      const contactGroupLabels = Array.from(
        new Set(this.props.contacts.map(contact => contact[this.props.groupBy]))
      );
      contactGroupLabels.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      contacts = contactGroupLabels.map(label => {
        const contactGroup = this.props.contacts.filter(contact =>
          contact[this.props.groupBy] === label
        ).map(contact =>
          this._createContactPanel(contact)
        );
        return (
          <div key={label}>
            <h3>{label}</h3>
            <div className="ovc-contacts-contact-sublist">
              {contactGroup}
            </div>
          </div>
        );
      });
    }

    return (
      <div className="ovc-contacts-contact-list">
        <div className="ovc-create-contact-button"
             onClick={this.addNewContact}>
          <i className="ion-plus create-contact" />
          <span>Create a new contact</span>
        </div>
        {contacts}
        <CreateContactModal visible={this.state.contactModalVisible}
                            hideModal={this.cancelNewContact}
                            createEntity={this.props.createContact}
                            updateEntity={this.props.addConnection} />
      </div>
    );
  }
}

export default UserContactsSection;

