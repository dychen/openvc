import React from 'react';
import Immutable from 'immutable';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import 'whatwg-fetch';

import './contacts.scss';

class SearchSection extends React.Component {
  constructor(props) {
    super(props);

    this._GROUP_BY_DISPLAY_MAP = {
      title: 'Title',
      company: 'Company'
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
  }

  updateFilter(e) {
    this.props.updateFilter(e.currentTarget.name, e.currentTarget.value);
  }

  addFilterTag(e) {
    if (e.key === 'Enter') {
      const tagType = e.target.name;
      const tagValue = e.currentTarget.value.trim();
      this.props.addFilterTag({
        type: tagType,
        value: tagValue
      });
    }
  }

  removeFilterTag(e) {
    this.props.removeFilterTag(Number(e.currentTarget.id));
  }

  // React-Bootstrap component event
  selectGroupBy(eventKey, e) {
    this.props.selectGroupBy(eventKey);
  }

  render() {
    const tags = this.props.filterTags.map((tag, index) => {
      return (
        <div className="filter-tag" key={index} id={index}
             onClick={this.removeFilterTag}>
          <div className="filter-close">
            <i className="ion-ios-close-empty" />
          </div>
          <span className="light">{tag.type}&nbsp;|&nbsp;</span> {tag.value}
        </div>
      );
    });

    return (
      <div className="ovc-contacts-search-menu">
        <div className="ovc-contacts-search-dropdown">
          <label>Group by</label>
          <DropdownButton className="dropdown-button"
                          title={this._GROUP_BY_DISPLAY_MAP[this.props.groupBy]}
                          id="ovc-contacts-search-dropdown">
            <MenuItem eventKey="company" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.company}
            </MenuItem>
            <MenuItem eventKey="title" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.title}
            </MenuItem>
          </DropdownButton>
        </div>
        <div className="ovc-contacts-search-inputs">
          <label>Search by company</label>
          <input type="text" name="company"
                 value={this.props.filterInputs.company}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
          <label>Search by name</label>
          <input type="text" name="name"
                 value={this.props.filterInputs.name}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
          <label>Search by title</label>
          <input type="text" name="title"
                 value={this.props.filterInputs.title}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
          <label>Add a tag</label>
          <input type="text" name="tag"
                 value={this.props.filterInputs.tag}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
        </div>

        <div className="ovc-contacts-search-tags">
          {tags}
        </div>
      </div>
    );
  }
}

class ContactsSection extends React.Component {
  constructor(props) {
    super(props);

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.addInteraction = this.addInteraction.bind(this);
  }

  toggleExpanded(e) {
    this.props.toggleExpanded(Number(e.currentTarget.id));
  }

  addInteraction(e) {
    this.props.addInteraction({
      label: 'Meeting',
      date: '2017-02-02',
      notes: ''
    }, Number(e.currentTarget.id));
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
        const interactions = contact.interactions.map((interaction, index) =>
          (
            <tr key={index}>
              <td>{interaction.label}</td>
              <td>{interaction.date}</td>
            </tr>
          )
        );
        const expandedSection = (
          contact.expanded
          ? (
            <table>
              <thead>
                <tr><td colSpan="2">Interaction History</td></tr>
              </thead>
              <tbody>
                {interactions}
                <tr>
                  <td className="add-interaction" colSpan="2" id={contact.id}
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
            <div className="ovc-contacts-contact-panel">
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

class ContactsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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

    // Filters
    this.selectGroupBy = this.selectGroupBy.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);

    // Contact actions
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.addInteraction = this.addInteraction.bind(this);

    this._filterContacts = this._filterContacts.bind(this);

    fetch('/data/shared/contacts/contacts.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'contacts': json });
    }); // TODO: Handle errors
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

    return (
      <div className="ovc-shared-contacts-container">
        <SearchSection groupBy={this.state.groupBy}
                       filterInputs={this.state.filterInputs}
                       filterTags={this.state.filterTags}
                       selectGroupBy={this.selectGroupBy}
                       updateFilter={this.updateFilter}
                       addFilterTag={this.addFilterTag}
                       removeFilterTag={this.removeFilterTag} />
        <ContactsSection contacts={filteredContacts}
                         groupBy={this.state.groupBy}
                         toggleExpanded={this.toggleExpanded}
                         addInteraction={this.addInteraction} />
      </div>
    );
  }
}

export default ContactsPage;
