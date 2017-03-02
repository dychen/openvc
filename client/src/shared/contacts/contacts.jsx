import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import SearchSection from './search.jsx';
import UserContactsSection from './user.jsx';
import AllContactsSection from './all.jsx';
import ContactsTableSection from './table.jsx';

import './contacts.scss';

class ContactsPage extends React.Component {
  constructor(props) {
    super(props);

    this._USER_TYPE = (
      this.props.location.pathname.includes('investor') ? 'investor' : 'founder'
    );

    this.state = {
      // Options: 'user', 'all', 'table'
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

    // Search section
    this.changeSection = this.changeSection.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);

    // Contact actions
    // User contacts view
    this.getUserContacts = this.getUserContacts.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.createContactAndConnect = this.createContactAndConnect.bind(this);
    this.addUserConnection = this.addUserConnection.bind(this);
    this.removeUserConnection = this.removeUserConnection.bind(this);
    // TODO: Refactor EditTable API to use these to update contacts state
    //this.createInteraction = this.createInteraction.bind(this);
    //this.deleteInteraction = this.deleteInteraction.bind(this);

    // All contacts view
    this.getAllContacts = this.getAllContacts.bind(this);
    this.createContact = this.createContact.bind(this);
    this.addConnection = this.addConnection.bind(this);
    this.removeConnection = this.removeConnection.bind(this);

    this._filterContacts = this._filterContacts.bind(this);
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

  /* User Contact API */

  getUserContacts() {
    authFetch(`${SERVER_URL}/api/v1/contacts/self`)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            throw new Error(json);
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

  createContactAndConnect(contact) {
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
          throw new Error(json);
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

  addUserConnection(contactId) {
    authFetch(`${SERVER_URL}/api/v1/contacts/connect/${contactId}`, {
      method: 'POST'
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
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

  removeUserConnection(contactId) {
    authFetch(`${SERVER_URL}/api/v1/contacts/connect/${contactId}`, {
      method: 'DELETE'
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state)
        .update('contacts', contacts =>
          contacts.filter(contact => contact.toJS().id !== json.id)
        );
      this.setState(newState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  toggleExpanded(contactId) {
    const contactIdx = this.state.contacts.findIndex(contact =>
      contact.id === contactId
    );
    const newState = Immutable.fromJS(this.state)
      .updateIn(['contacts', contactIdx, 'expanded'], value => !value);
    this.setState(newState.toJS());
  }

  /* TODO: Refactor EditTable API to use these to update contacts state
  createInteraction(interaction, contactId) {
    let jsonBody = Immutable.fromJS(interaction)
      .set('personId', contactId).toJS();
    authFetch(`${SERVER_URL}/api/v1/contacts/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(jsonBody)
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const contactIdx = this.state.contacts.findIndex(contact =>
        contact.id === contactId
      );
      const newState = Immutable.fromJS(this.state)
        .updateIn(['contacts', contactIdx, 'interactions'], interactions =>
          interactions.unshift(json)
        );
      this.setState(newState.toJS());

    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  deleteInteraction(interactionId, contactId) {
    authFetch(`${SERVER_URL}/api/v1/contacts/interactions/${interactionId}`, {
      method: 'DELETE'
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const contactIdx = this.state.contacts.findIndex(contact =>
        contact.id === contactId
      );
      const newState = Immutable.fromJS(this.state)
        .updateIn(['contacts', contactIdx, 'interactions'], interactions =>
          interactions.filter(interaction => {
            return interaction.toJS().id !== json.id;
          })
        );
      this.setState(newState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }
  */

  /* All Contact API */

  getAllContacts() {
    authFetch(`${SERVER_URL}/api/v1/contacts/all`)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            throw new Error(json);
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
          throw new Error(json);
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

  addConnection(contactId) {
    authFetch(`${SERVER_URL}/api/v1/contacts/connect/${contactId}`, {
      method: 'POST'
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const contactIdx = this.state.contacts.findIndex(contact =>
        contact.id === json.id
      );
      const newState = Immutable.fromJS(this.state)
        .setIn(['contacts', contactIdx, 'connected'], true);
      this.setState(newState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  removeConnection(contactId) {
    authFetch(`${SERVER_URL}/api/v1/contacts/connect/${contactId}`, {
      method: 'DELETE'
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    }).then(json => {
      // Success
      json = preprocessJSON(json);
      const contactIdx = this.state.contacts.findIndex(contact =>
        contact.id === json.id
      );
      const newState = Immutable.fromJS(this.state)
        .setIn(['contacts', contactIdx, 'connected'], false);
      this.setState(newState.toJS());
    }).catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  /* Helpers */

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
    let visibleSection;
    switch (this.state.section) {
      case 'all':
        visibleSection = (
          <AllContactsSection _USER_TYPE={this._USER_TYPE}
                              contacts={filteredContacts}
                              groupBy={this.state.groupBy}
                              getAllContacts={this.getAllContacts}
                              createContact={this.createContact}
                              addConnection={this.addConnection}
                              removeConnection={this.removeConnection} />
        );
        break;
      case 'table':
        visibleSection = (<ContactsTableSection />);
        break;
      case 'user':
      case 'default':
        visibleSection = (
          <UserContactsSection _USER_TYPE={this._USER_TYPE}
                               contacts={filteredContacts}
                               groupBy={this.state.groupBy}
                               getUserContacts={this.getUserContacts}
                               createContact={this.createContact}
                               addConnection={this.addUserConnection}
                               removeConnection={this.removeUserConnection}
                               toggleExpanded={this.toggleExpanded} />
        );
        break;
    }

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
