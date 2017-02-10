import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import SearchSection from './search.jsx';
import UserContactsSection from './user.jsx';
import AllContactsSection from './all.jsx';

import './contacts.scss';

class ContactsPage extends React.Component {
  constructor(props) {
    super(props);

    this._USER_TYPE = (
      this.props.location.pathname.includes('investor') ? 'investor' : 'founder'
    );

    this.state = {
      section: 'user',
      groupBy: 'company',
      filterInputs: {
        company: '',
        name: '',
        title: '',
        tag: ''
      },
      filterTags: [],
      contacts: []
    };

    // Load data
    this.getUserContacts = this.getUserContacts.bind(this);
    this.getAllContacts = this.getAllContacts.bind(this);

    // Search section
    this.changeSection = this.changeSection.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);

    // Contact actions
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.addInteraction = this.addInteraction.bind(this);
    this.createContact = this.createContact.bind(this);
    this.createContactandConnect = this.createContactandConnect.bind(this);

    this._filterContacts = this._filterContacts.bind(this);
  }

  /* Load data */
  getUserContacts() {
    authFetch(`${SERVER_URL}/api/v1/contacts/self`)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            // TODO: Handle error responses
            throw new Error('Unable to log in');
          });
        }
      }).then(json => {
        // Success
        json = preprocessJSON(json);
        const newState = Immutable.fromJS(this.state).set('contacts', json);
        this.setState(newState.toJS());
      }).catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  getAllContacts() {
    authFetch(`${SERVER_URL}/api/v1/contacts/all`)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            // TODO: Handle error responses
            throw new Error('Unable to log in');
          });
        }
      }).then(json => {
        // Success
        json = preprocessJSON(json);
        const newState = Immutable.fromJS(this.state).set('contacts', json);
        this.setState(newState.toJS());
      }).catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  /* Search section */

  changeSection(newSection) {
    this.setState({ section: newSection });
  }

  selectGroupBy(field) {
    this.setState({ groupBy: field });
  }

  updateFilter(filterName, filterValue) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filterInputs', filterName], value => filterValue);
    this.setState(newState.toJS());
  }

  addFilterTag(tag) {
    const newState = Immutable.fromJS(this.state)
      .update('filterTags', tags => tags.push(tag));
    const newStateCleared = newState.updateIn(
      ['filterInputs', tag.type], value => ''
    );
    this.setState(newStateCleared.toJS());
  }

  removeFilterTag(tagId) {
    const memberIdx = tagId;
    const newTags = this.state.filterTags.filter((tag, index) =>
      index !== memberIdx
    );
    const newState = Immutable.fromJS(this.state)
      .update('filterTags', value => newTags);
    this.setState(newState.toJS());
  }

  /* Contact actions */

  toggleExpanded(contactId) {
    const contactIdx = this.state.contacts.findIndex(contact =>
      contact.id === contactId
    );
    const newState = Immutable.fromJS(this.state)
      .updateIn(['contacts', contactIdx, 'expanded'], value => !value);
    this.setState(newState.toJS());
  }

  addInteraction(interaction, contactId) {
    const contactIdx = this.state.contacts.findIndex(contact =>
      contact.id === contactId
    );
    const newState = Immutable.fromJS(this.state)
      .updateIn(['contacts', contactIdx, 'interactions'], interactions =>
        interactions.unshift(interaction)
      );
    this.setState(newState.toJS());
  }

  createContact(contact) {
    authFetch(`${SERVER_URL}/api/v1/contacts/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error('Unable to log in');
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state)
        .update('contacts', contacts => contacts.unshift(json));
      this.setState(newState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  createContactandConnect(contact) {
    authFetch(`${SERVER_URL}/api/v1/contacts/self`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error('Unable to log in');
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state)
        .update('contacts', contacts => contacts.unshift(json));
      this.setState(newState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  _filterContacts(contacts) {
    const filterAttribute = function(contact, attr) {
      return contact[attr].toLowerCase()
        .indexOf(this.state.filterInputs[attr].toLowerCase()) > -1;
    }.bind(this);

    const filterTags = function(contact) {
      if (this.state.filterTags.length > 0) {
        const matchedTags = this.state.filterTags.filter(tag => {
          if (tag.type === 'tag') {
            return contact.tags.map(tag => tag.toLowerCase())
              .indexOf(tag.value.toLowerCase()) > -1;
          }
          else {
            return contact[tag.type].toLowerCase()
              .indexOf(tag.value.toLowerCase()) > -1;
          }
        });
        // Make sure all tags match
        return matchedTags.length === this.state.filterTags.length;
      }
      else {
        return true;
      }
    }.bind(this);

    return contacts.filter(contact => {
      const companyMatch = filterAttribute(contact, 'company');
      const nameMatch = filterAttribute(contact, 'name');
      const titleMatch = filterAttribute(contact, 'title');
      const tagsMatch = filterTags(contact);

      return companyMatch && nameMatch && titleMatch && tagsMatch;
    });
  }

  render() {
    const filteredContacts = this._filterContacts(this.state.contacts);
    const visibleSection = (
      this.state.section === 'user'
      ? <UserContactsSection _USER_TYPE={this._USER_TYPE}
                             contacts={filteredContacts}
                             groupBy={this.state.groupBy}
                             getUserContacts={this.getUserContacts}
                             toggleExpanded={this.toggleExpanded}
                             addInteraction={this.addInteraction} />
      : <AllContactsSection _USER_TYPE={this._USER_TYPE}
                            contacts={filteredContacts}
                            groupBy={this.state.groupBy}
                            getAllContacts={this.getAllContacts}
                            createContact={this.createContact}
                            createContactandConnect={this.createContactandConnect} />
    );

    return (
      <div className="ovc-shared-contacts-container">
        <SearchSection section={this.state.section}
                       groupBy={this.state.groupBy}
                       filterInputs={this.state.filterInputs}
                       filterTags={this.state.filterTags}
                       changeSection={this.changeSection}
                       selectGroupBy={this.selectGroupBy}
                       updateFilter={this.updateFilter}
                       addFilterTag={this.addFilterTag}
                       removeFilterTag={this.removeFilterTag} />
        {visibleSection}
      </div>
    );
  }
}

export default ContactsPage;
