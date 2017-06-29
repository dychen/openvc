import React from 'react';
import Immutable from 'immutable';
import onClickOutside from 'react-onclickoutside';

import {getFieldList, createField, updateField, deleteField,
        getSourceList} from './api.js';
import EditTable from '../../components/edittable/edittable.jsx';
import {DATA_TYPE_MAP, DATA_TYPE_LIST} from '../../utils/constants.js';
import {EditField, DropdownField} from '../../components/editfield.jsx';

import './table.scss';

const CellPopover = onClickOutside(
  class extends React.Component {
    handleClickOutside(e) {
      if (this.props.onCancel)
        this.props.onCancel(e);
    }
    render() {
      return (
        <div className="ovc-header-popover">
          <div className="ovc-header-popover-header">
            Update {this.props.field.display}
          </div>
          <div className="ovc-header-popover-body">
            <div className="ovc-header-popover-group">
              <div className="row-title">Field Name</div>
              <div className="row-input">
                <EditField field="display"
                           fieldType="string"
                           originalValue={this.props.field.display}
                           placeholder="Click to edit"
                           onSave={this.props.onSave} />
              </div>
            </div>
            <div className="ovc-header-popover-group">
              <div className="row-title">Field Type</div>
              <div className="row-input">
                <DropdownField id={this.props.field.name}
                               field="type"
                               elementId={`ovc-header-popover-${this.props.field.name}-type`}
                               originalValue={DATA_TYPE_MAP[this.props.field.type]}
                               placeholder="Click to edit"
                               options={DATA_TYPE_LIST}
                               onSelect={this.props.onSave} />
              </div>
            </div>
            <div className="ovc-header-popover-group">
              <div className="row-title">Field Source</div>
              <div className="row-input">
                <DropdownField id={this.props.field.name}
                               field="type"
                               elementId={`ovc-header-popover-${this.props.field.name}-type`}
                               originalValue={DATA_TYPE_MAP[this.props.field.type]}
                               placeholder="Click to edit"
                               options={DATA_TYPE_LIST}
                               onSelect={this.props.onSave} />
              </div>
            </div>
            <div className="ovc-header-popover-group">
              <div className="row-title">Source Model</div>
              <div className="row-input">
                <DropdownField id={this.props.field.name}
                               field="type"
                               elementId={`ovc-header-popover-${this.props.field.name}-type`}
                               originalValue={DATA_TYPE_MAP[this.props.field.type]}
                               placeholder="Click to edit"
                               options={DATA_TYPE_LIST}
                               onSelect={this.props.onSave} />
              </div>
            </div>
            <div className="ovc-header-popover-group">
              <div className="row-title">Source Field</div>
              <div className="row-input">
                <DropdownField id={this.props.field.name}
                               field="type"
                               elementId={`ovc-header-popover-${this.props.field.name}-type`}
                               originalValue={DATA_TYPE_MAP[this.props.field.type]}
                               placeholder="Click to edit"
                               options={DATA_TYPE_LIST}
                               onSelect={this.props.onSave} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
);

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
 *   onCellUpdate [function]: Function to call when the cell data is updated
 *                            (makes an API call to backend)
 */
class DiscoveryTableHeaderCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editPopover: { visible: false },
    };

    this.showEditPopover = this.showEditPopover.bind(this);
    this.hideEditPopover = this.hideEditPopover.bind(this);
    this.onPopoverSave = this.onPopoverSave.bind(this);
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
  onPopoverSave(fieldName, fieldValue) {
    const newField = Immutable.fromJS(this.props.field)
      .set(fieldName, fieldValue)
      .toJS();
    // Update
    if (newField.id) {
      this.props.onCellUpdate(newField.id, newField);
    }
    // Create
    else {
      this.props.onCellUpdate(newField);
    }
  }

  render() {
    const sortAscClass = (this.props.activeSort.field === this.props.fieldName
                          && this.props.activeSort.direction === 'asc'
                          ? 'active' : '');
    const sortDescClass = (this.props.activeSort.field === this.props.fieldName
                           && this.props.activeSort.direction === 'desc'
                           ? 'active' : '');
    const editPopover = (this.state.editPopover.visible
                         ? <CellPopover field={this.props.field}
                                        onSave={this.onPopoverSave}
                                        onCancel={this.hideEditPopover} />
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
        <i className="header-icon edit-field ion-compose"
           onClick={this.showEditPopover}>
          {editPopover}
        </i>
        <i className={`header-icon edit-source
                       ${this.props.field.icon || 'ion-network'}`} />
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
 *
 *   createField [function]
 *   updateField [function]
 */
class DiscoveryTableHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSort: {
        field: '',
        direction: ''
      },
      addingField: false,
      newField: {
        display: 'New Field',
        type: 'string',
        required: false,
        icon: 'ion-arrow-graph-up-right'
      }
    };

    this.onSortAscClick = this.onSortAscClick.bind(this);
    this.onSortDescClick = this.onSortDescClick.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);

    this.createField = this.createField.bind(this);
    this.updateField = this.updateField.bind(this);

    this.toggleAddField = this.toggleAddField.bind(this);
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

  toggleAddField(e) {
    this.setState({ addingField: !this.state.addingField });
  }

  createField(field) {
    this.props.createField(field);
    this.setState({ addingField: false }); // No longer creating a new field
  }
  // For symmetry with createField
  updateField(field) {
    this.props.updateField(fieldId, field);
  }

  render() {
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
        onSortDescClick={this.onSortDescClick}
        onCellUpdate={this.updateField} />
    );

    const newColumn = (
      this.state.addingField
      ? (
        <DiscoveryTableHeaderCell
          key="newField"
          clickableClass={clickableClass}
          fieldName="newField"
          field={this.state.newField}
          activeSort={this.state.activeSort}
          onHeaderClick={this.onHeaderClick}
          onSortAscClick={this.onSortAscClick}
          onSortDescClick={this.onSortDescClick}
          onCellUpdate={this.createField} />
      ) : ''
    );

    return (
      <thead>
        <tr>
          {headers}
          {newColumn}
          <td className={`remove-entity ${clickableClass}`}
              onClick={this.toggleAddField}>
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

    this.state = {
      fieldList: [],
      fieldMap: {}
    };

    this.getFields = this.getFields.bind(this);
    this.createField = this.createField.bind(this);
    this.updateField = this.updateField.bind(this);


    this.getFields();
  }

  getFields() {
    getFieldList().then(fields => {
      const fieldList = fields.map(field => field.apiName);
      let fieldMap = {};
      fields.forEach(field => {
        fieldMap[field.apiName] = field;
      });
      const newState = Immutable.fromJS(this.state)
        .set('fieldList', fieldList)
        .set('fieldMap', fieldMap)
        .toJS();
      this.setState(newState);
    });
  }

  createField(field) {
    field.displayName = field.display;
    createField(field)
      .then(field => {
        const newState = Immutable.fromJS(this.state)
          .update('fieldList', fieldList => fieldList.push(field.apiName))
          .update('fieldMap', fieldMap => fieldMap.set(field.apiName, field))
          .toJS();
        this.setState(newState);
      });
  }

  updateField(fieldId, field) {
    field.displayName = field.display;
    /*
    updateField(fieldId, field)
      .then(fields => {
        const newState = this._getNewFieldState(fields);
        this.setState(newState);
      });
    */
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/users/leads`}
                   HeaderComponent={DiscoveryTableHeader}
                   FIELDS={this.state.fieldList}
                   FIELD_MAP={this.state.fieldMap}
                   createField={this.createField}
                   updateField={this.updateField}
                   {...this.props} />
      </div>
    );
  }
}

export default DiscoveryTableSection;

