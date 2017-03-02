import React from 'react';
import {DropdownButton, MenuItem, Nav, NavItem} from 'react-bootstrap';

import './search.scss';

/*
 * props:
 *   section [string]: Current visible section ('user', 'all', or 'table').
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *   orderBy [string]: Field to group contacts by (e.g. 'lastInteraction').
 *   filterInputs [Object]: Object of search nav input names and their values.
 *                          { company: '', name: '', title: '', tag: '' }
 *   filterTags [Array]: List of filter tags.
 *
 *   changeSection [function]: Function to change the visible section.
 *   selectGroupBy [function]: Function to change the groupBy field.
 *   selectOrderBy [function]: Function to change the orderBy field.
 *   updateFilter [function]: Function to update filter input text.
 *   addFilterTag [function]: Function to add a filter tag.
 *   removeFilterTag [function]: Function to remove a filter tag.
 */
class SearchSection extends React.Component {
  constructor(props) {
    super(props);

    this._GROUP_BY_DISPLAY_MAP = {
      none: 'None',
      company: 'Company',
      title: 'Title'
    };

    this._ORDER_BY_DISPLAY_MAP = {
      name: 'Name',
      lastInteraction: 'Last Interaction',
      quarterDuration: 'Quarter Activity',
      yearDuration: 'Year Activity',
      totalDuration: 'Total Activity',
    };

    this.changeSection = this.changeSection.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
    this.selectOrderBy = this.selectOrderBy.bind(this);
  }

  // React-Bootstrap component event
  changeSection(eventKey, e) {
    this.props.changeSection(eventKey);
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

  // React-Bootstrap component event
  selectOrderBy(eventKey, e) {
    this.props.selectOrderBy(eventKey);
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
        <Nav className="ovc-contacts-search-section-tabs"
             bsStyle="tabs"
             activeKey={this.props.section}
             onSelect={this.changeSection}>
          <NavItem className="ovc-search-tab" eventKey="user">
            Contacts
          </NavItem>
          <NavItem className="ovc-search-tab" eventKey="all">
            All
          </NavItem>
          <NavItem className="ovc-search-tab" eventKey="table">
            Table
          </NavItem>
        </Nav>
        <div className="ovc-contacts-search-dropdown">
          <label>Group by</label>
          <DropdownButton className="dropdown-button"
                          title={this._GROUP_BY_DISPLAY_MAP[this.props.groupBy]}
                          id="ovc-contacts-search-dropdown">
            <MenuItem eventKey="none" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.none}
            </MenuItem>
            <MenuItem eventKey="company" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.company}
            </MenuItem>
            <MenuItem eventKey="title" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.title}
            </MenuItem>
          </DropdownButton>
          <label>Order by</label>
          <DropdownButton className="dropdown-button"
                          title={this._ORDER_BY_DISPLAY_MAP[this.props.orderBy]}
                          id="ovc-contacts-search-dropdown">
            <MenuItem eventKey="name" onSelect={this.selectOrderBy}>
              {this._ORDER_BY_DISPLAY_MAP.name}
            </MenuItem>
            <MenuItem eventKey="lastInteraction" onSelect={this.selectOrderBy}>
              {this._ORDER_BY_DISPLAY_MAP.lastInteraction}
            </MenuItem>
            <MenuItem eventKey="quarterDuration" onSelect={this.selectOrderBy}>
              {this._ORDER_BY_DISPLAY_MAP.quarterDuration}
            </MenuItem>
            <MenuItem eventKey="yearDuration" onSelect={this.selectOrderBy}>
              {this._ORDER_BY_DISPLAY_MAP.yearDuration}
            </MenuItem>
            <MenuItem eventKey="totalDuration" onSelect={this.selectOrderBy}>
              {this._ORDER_BY_DISPLAY_MAP.totalDuration}
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

export default SearchSection;

