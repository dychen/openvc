import React from 'react';
import Immutable from 'immutable';
import {DropdownButton, MenuItem, Nav, NavItem} from 'react-bootstrap';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import './subnav.scss';

/*
 * Filters with the following logic: For each element in a tag group, filter
 * with a logical OR. For each tag group, filter with a logical AND. E.g., if
 * the tags are:
 *   [{ key: 'name', value: 'Co1' }, { key: 'name', value: 'Co2' },
 *    { key: 'source', value: 'Source1' }, { key: 'source', value: 'Source2' }]
 * The filtering logic is:
 *   ((name === 'Co1' || name === 'Co2')
 *    && (source === 'Source1' || source === 'Source2'))
 */
const filterData = (data, filterTags) => {
  /*
   * Args:
   *   filterTags [Array]: [{ key: [string], value: [string] }, ...]
   * Returns:
   *   [Array]: [{ key: [string], values: [[string]] }, ...]
   */
  const getTagGroups = function(filterTags) {
    let tagGroups = [];
    filterTags.forEach(filterTag => {
      const tagGroupIdx = tagGroups.findIndex(t => t.key === filterTag.key);
      if (tagGroupIdx > -1) {
        tagGroups[tagGroupIdx].values.push(filterTag.value);
      }
      else {
        tagGroups.push({ key: filterTag.key, values: [filterTag.value] });
      }
    });
    return tagGroups;
  };

  const matchGroup = function(obj, tagKey, tagValues) {
    return tagValues.some(value =>
      obj[tagKey].toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  };

  const tagGroups = getTagGroups(filterTags);
  if (filterTags) {
    console.log('[DEBUG] Performing an expensive filter in filterData()');
    return data.filter(d => {
      return tagGroups.every(tagGroup =>
        matchGroup(d, tagGroup.key, tagGroup.values)
      );
    });
  }
  return data;
};

/*
 * text [string]: [Optional] Text to display on button.
 * iconClass [string]: [Optional] CSS class of the icon (e.g. 'ion-plus').
 *
 * onClick [function]: Function to be called when the button is clicked.
 *                     f([Object: Event object]) => null
 */
const SubnavButton = (props) => {
  return (
    <div className="ovc-component-subnav-button-container">
      <div className="ovc-component-subnav-button"
           onClick={props.onClick}>
        <i className={`${props.iconClass} subnav-button-icon`} />
        <span>{props.text}</span>
      </div>
    </div>
  );
};

/*
 * title [string]: Title of the dropdown section.
 * selectedItem [string]: eventKey of the currently selected MenuItem.
 * menuItems [Array]: List of selectable options:
 *                    [{ key: [string], display: [string] }]
 *
 * onSelect [function]: Function to be called when a new MenuItem is selected.
 *                      f([string: eventKey]) => null
 */
class SubnavDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.changeSection = this.changeSection.bind(this);
  }

  // React-Bootstrap component event
  changeSection(eventKey, e) {
    this.props.onSelect(eventKey);
  }

  render() {
    const menuItems = this.props.menuItems.map((menuItem) => {
      return (
        <MenuItem className="ovc-search-tab" key={menuItem.key}
                  eventKey={menuItem.key}
                  onSelect={this.changeSection}>
          {menuItem.display}
        </MenuItem>
      );
    });
    return (
      <div className="ovc-component-subnav-dropdown">
        <label>{this.props.title}</label>
        <DropdownButton className="dropdown-button"
                        title={this.props.selectedItem.display || 'None'}
                        id="ovc-component-subnav-dropdown">
          {menuItems}
        </DropdownButton>
      </div>
    );
  }
}

/*
 * filterList [Array]: List of filter fields to show on the Sidenav. This is
 *                     different from filterTags, which are objects with keys
 *                     'key' and 'value' instead of 'key' and 'display'.
 *                     [{ key: [string], display: [string] }, ...]
 *
 * onUpdate: [function]: Function to call when filter tags get added or removed.
 *                       f([Array]) => null
 */
class SubnavFilters extends React.Component {
  constructor(props) {
    super(props);

    let filterInputs = {};
    this.props.filterList.forEach((filterItem) => {
      filterInputs[filterItem.key] = '';
    });

    this.state = {
      filterInputs: filterInputs,
      filterTags: []
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
  }

  updateFilter(e) {
    const filterName = e.currentTarget.name;
    const filterValue = e.currentTarget.value;
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filterInputs', filterName], value => filterValue);
    this.setState(newState.toJS());
  }

  addFilterTag(e) {
    if (e.key === 'Enter') {
      const tag = {
        key: e.target.name,
        value: e.currentTarget.value.trim()
      };

      const newState = Immutable.fromJS(this.state)
        .update('filterTags', tags => tags.push(tag));
      const newStateCleared = newState.updateIn(
        ['filterInputs', tag.key], value => ''
      );
      this.setState(newStateCleared.toJS(), () => {
        if (this.props.onUpdate) {
          this.props.onUpdate(this.state.filterTags);
        }
      });
    }
  }

  removeFilterTag(e) {
    const tagIdx = Number(e.currentTarget.id);
    const newTags = this.state.filterTags.filter((tag, index) =>
      index !== tagIdx
    );

    const newState = Immutable.fromJS(this.state)
      .update('filterTags', value => newTags);
    this.setState(newState.toJS(), () => {
      if (this.props.onUpdate) {
        this.props.onUpdate(this.state.filterTags);
      }
    });
  }

  render() {
    const filterInputs = this.props.filterList.map((filterItem) => {
      return (
        <div key={filterItem.key}>
          <label>{filterItem.display}</label>
          <input type="text" name={filterItem.key}
                 value={this.state.filterInputs[filterItem.key]}
                 onChange={this.updateFilter}
                 onKeyPress={this.addFilterTag} />
        </div>
      );
    });
    const tags = this.state.filterTags.map((tag, index) => {
      return (
        <div className="filter-tag" key={index} id={index}
             onClick={this.removeFilterTag}>
          <div className="filter-close">
            <i className="ion-ios-close-empty" />
          </div>
          <span className="light">{tag.key}&nbsp;|&nbsp;</span> {tag.value}
        </div>
      );
    });

    return (
      <div>
        <div className="ovc-component-subnav-filter-inputs">
          {filterInputs}
        </div>
        <div className="ovc-component-subnav-filter-tags">
          {tags}
        </div>
      </div>
    );
  }
}

/*
 * Props:
 *   title [string]: (Optional) Subnav header title
 *   icon [string]: (Optional) Icon classname
 */
class Subnav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };

    this.toggleVisible = this.toggleVisible.bind(this);
  }

  toggleVisible(e) {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    const icon = this.props.icon || 'ion-ios-settings-strong';
    const title = this.props.title || 'Menu';
    let sideNav, toggleIcon;
    if (this.state.visible) {
      sideNav = (
        <div className="ovc-component-subnav">
          <div className="ovc-component-subnav-minimize"
               onClick={this.toggleVisible}>
            {title}
            <i className="ion-chevron-right" />
          </div>
          {this.props.children}
        </div>
      );
    }
    else {
      toggleIcon = (
        <div className="ovc-component-subnav-hidden"
             onClick={this.toggleVisible}>
          <i className={icon} />
        </div>
      );
    }
    return (
      <div>
        <CSSTransitionGroup transitionName="ovc-toggle-sidenav"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={500}>
          {sideNav}
        </CSSTransitionGroup>
        {toggleIcon}
      </div>
    );
  }
};

export {filterData, Subnav, SubnavButton, SubnavDropdown, SubnavFilters};

