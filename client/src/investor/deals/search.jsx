import React from 'react';
import {DropdownButton, MenuItem, Nav, NavItem} from 'react-bootstrap';

/*
 * props:
 *   section [string]: Current visible section ('user' or 'table').
 *   groupBy [string]: Field to group deals by (e.g. 'sector' or 'location').
 *   filterInputs [Object]: Object of search nav input names and their values.
 *                          { name: '', segment: '', sector: '', tag: '' }
 *   filterTags [Array]: List of filter tags.
 *
 *   changeSection [function]: Function to change the visible section.
 *   selectGroupBy [function]: Function to change the groupBy field.
 *   updateFilter [function]: Function to update filter input text.
 *   addFilterTag [function]: Function to add a filter tag.
 *   removeFilterTag [function]: Function to remove a filter tag.
 */
class SearchSection extends React.Component {
  constructor(props) {
    super(props);

    this._GROUP_BY_DISPLAY_MAP = {
      none: 'None',
      sector: 'Sector',
      location: 'Location',
      latestRoundSeries: 'Last Round'
    };

    this.changeSection = this.changeSection.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
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
      <div className="ovc-view-search-menu">
        <Nav className="ovc-view-search-section-tabs"
             bsStyle="tabs"
             activeKey={this.props.section}
             onSelect={this.changeSection}>
          <NavItem className="ovc-search-tab" eventKey="user">
            Pipeline
          </NavItem>
          <NavItem className="ovc-search-tab" eventKey="table">
            Table
          </NavItem>
        </Nav>
        <div className="ovc-view-search-dropdown">
          <label>Group by</label>
          <DropdownButton className="dropdown-button"
                          title={this._GROUP_BY_DISPLAY_MAP[this.props.groupBy]}
                          id="ovc-view-search-dropdown">
            <MenuItem eventKey="none" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.none}
            </MenuItem>
            <MenuItem eventKey="sector" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.sector}
            </MenuItem>
            <MenuItem eventKey="location" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.location}
            </MenuItem>
            <MenuItem eventKey="latestRoundSeries" onSelect={this.selectGroupBy}>
              {this._GROUP_BY_DISPLAY_MAP.latestRoundSeries}
            </MenuItem>
          </DropdownButton>
        </div>
        <div className="ovc-view-search-inputs">
          <label>Search by company</label>
          <input type="text" name="name"
                 value={this.props.filterInputs.name}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
          <label>Search by segment</label>
          <input type="text" name="segment"
                 value={this.props.filterInputs.segment}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
          <label>Search by sector</label>
          <input type="text" name="sector"
                 value={this.props.filterInputs.sector}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
          <label>Add a tag</label>
          <input type="text" name="tag"
                 value={this.props.filterInputs.tag}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
        </div>

        <div className="ovc-view-search-tags">
          {tags}
        </div>
      </div>
    );
  }
}

export default SearchSection;

