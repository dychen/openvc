import React from 'react';
import Immutable from 'immutable';
import EditTable from '../../components/edittable/edittable.jsx';
import {DATA_TYPE_MAP} from '../../utils/constants.js';

import './table.scss';

const CellPopover = (props) => {
  return (
    <div className="ovc-header-popover">
      <div className="ovc-header-popover-header">Update {props.field.display}</div>
      <div className="ovc-header-popover-body">Body</div>
    </div>
  );
};

/*
 * props:
 *   fieldName [string]: E.g. 'name'
 *   field [Object]: Field object, e.g. { display: 'Name', ... },
 *   activeSort [Object]: E.g., { field: 'name', direction: 'desc' }
 *   clickableClass [string]: Optional classname of 'clickable' that controls
 *                            hover effects for the cell based on whether the
 *                            cell is clickable
 *
 *   onHeaderClick [function]: Function to call when the cell is clicked
 *   onSortAscClick, onSortDescClick [function]: Sorts the table
 */
class DiscoveryTableHeaderCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editPopover: { visible: false },
      sourcePopover: { visible: false }
    };

    this.showEditPopover = this.showEditPopover.bind(this);
    this.hideEditPopover = this.hideEditPopover.bind(this);
    this.showSourcePopover = this.showSourcePopover.bind(this);
    this.hideSourcePopover = this.hideSourcePopover.bind(this);
  }

  showEditPopover(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['editPopover', 'visible'], true);
    this.setState(newState.toJS());
  }
  hideEditPopover(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['editPopover', 'visible'], false);
    this.setState(newState.toJS());
  }
  showSourcePopover(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['sourcePopover', 'visible'], true);
    this.setState(newState.toJS());
  }
  hideSourcePopover(e) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['sourcePopover', 'visible'], false);
    this.setState(newState.toJS());
  }

  render() {
    const sortAscClass = (this.props.activeSort.field === this.props.fieldName
                          && this.props.activeSort.direction === 'asc'
                          ? 'active' : '');
    const sortDescClass = (this.props.activeSort.field === this.props.fieldName
                           && this.props.activeSort.direction === 'desc'
                           ? 'active' : '');
    const editPopover = (this.state.editPopover.visible
                         ? <CellPopover field={this.props.field} />
                         : '');
    const sourcePopover = (this.state.sourcePopover.visible
                           ? <CellPopover field={this.props.field} />
                           : '');
    // See SO discussion for handling outside clicks:
    // https://stackoverflow.com/questions/32553158/
    //   detect-click-outside-react-component
    return (
      <td id={this.props.fieldName} className={this.props.clickableClass}
          onClick={this.props.onHeaderClick}>
        {this.props.field.display}
        <div className="subtext">
          {DATA_TYPE_MAP[this.props.field.type]}
        </div>
        <i className={`header-icon edit-source
                       ${this.props.field.icon || 'ion-network'}`}
           onClick={this.showSourcePopover}>
          {sourcePopover}
        </i>
        <i className="header-icon edit-field ion-compose"
           onClick={this.showEditPopover}>
          {editPopover}
        </i>
        <i className={`ion-arrow-up-b header-icon sort-table sort-asc ${sortAscClass}`}
           id={this.props.fieldName} onClick={this.props.onSortAscClick} />
        <i className={`ion-arrow-down-b header-icon sort-table sort-desc ${sortDescClass}`}
           id={this.props.fieldName} onClick={this.props.onSortDescClick} />
      </td>
    );
  }
};

/*
 * props:
 *   FIELDS [Array]: List of API fields to show as table columns.
 *   FIELD_MAP [Object]: Object that maps fields to their metadata:
 *   {
 *     [field name]: { display: [string], model: [string],
 *                     modelField: [string], required: [boolean],
 *                     type: [string] }
 *   }
 *
 *   sortByField [function]: Function that sorts the data by field name.
 *   onHeaderClick [function]: (Optional) Function that runs when a header cell
 *                             is clicked.
 *     f([Event object]) => CustomField object { displayName: [string], ... }
 */
class DiscoveryTableHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSort: {
        field: '',
        direction: ''
      },
      editPopover: {
        visible: false
      },
      sourcePopover: {
        visible: false
      }
    };

    this.onSortAscClick = this.onSortAscClick.bind(this);
    this.onSortDescClick = this.onSortDescClick.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
  }

  onSortAscClick(e) {
    e.stopPropagation();
    const fieldName = e.currentTarget.id;

    this.props.sortByField(fieldName, 'asc', this.props.FIELD_MAP[fieldName]);
    this.setState({ activeSort: { field: fieldName, direction: 'asc' }});
  }

  onSortDescClick(e) {
    e.stopPropagation();
    const fieldName = e.currentTarget.id;

    this.props.sortByField(fieldName, 'desc', this.props.FIELD_MAP[fieldName]);
    this.setState({ activeSort: { field: fieldName, direction: 'desc' }});
  }

  onHeaderClick(e) {
    if (this.props.onHeaderClick) {
      const activeField = this.props.FIELDS[e.currentTarget.id];
      // activeField is undefined in the remove-entity onClick handler
      this.props.onHeaderClick(activeField);
    }
  }

  render() {
    console.log(this.state.editPopover.visible);
    const clickableClass = this.onHeaderClick ? 'clickable' : '';
    const headers = this.props.FIELDS.map(fieldName =>
      <DiscoveryTableHeaderCell
        key={fieldName}
        clickableClass={clickableClass}
        fieldName={fieldName}
        field={this.props.FIELD_MAP[fieldName]}
        activeSort={this.state.activeSort}
        onHeaderClick={this.onHeaderClick}
        onSortAscClick={this.onSortAscClick}
        onSortDescClick={this.onSortDescClick} />
    );

    return (
      <thead>
        <tr>
          {headers}
          <td className={`remove-entity ${clickableClass}`}
              onClick={this.onHeaderClick}>
            <i className="ion-plus" />
          </td>
        </tr>
      </thead>
    );
  }
}

class DiscoveryTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['name', 'logoUrl', 'location', 'website', 'segment',
                   'sector'];

    this.FIELD_MAP = {
      name: {
        display: 'Name',
        type: 'string',
        required: true,
        icon: 'ion-arrow-graph-up-right'
      },
      logoUrl: {
        display: 'Logo',
        type: 'image',
        required: false,
        icon: 'ion-arrow-graph-up-right'
      },
      location: {
        display: 'Location',
        type: 'string',
        required: false,
        icon: 'ion-arrow-graph-up-right'
      },
      website: {
        display: 'Website',
        type: 'string',
        required: false,
        icon: 'ion-arrow-graph-up-right'
      },
      segment: {
        display: 'Segment',
        type: 'string',
        required: false,
        icon: 'ion-cloud'
      },
      sector: {
        display: 'Sector',
        type: 'string',
        required: false,
        icon: 'ion-cloud'
      },
    };
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/users/leads`}
                   HeaderComponent={DiscoveryTableHeader}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   {...this.props} />
      </div>
    );
  }
}

export default DiscoveryTableSection;

