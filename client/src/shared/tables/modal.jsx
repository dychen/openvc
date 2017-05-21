import React from 'react';
import Immutable from 'immutable';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'
import Scroll from 'react-scroll';
const ScrollScroller = Scroll.animateScroll;

import {createTable, updateTable, deleteTable,
        createField, updateField, deleteField} from './api.js';
import {EditField, DropdownField} from '../../components/editfield.jsx';
import {DATA_TYPE_LIST, DATA_TYPE_MAP} from '../../utils/constants.js';

import './modal.scss';

/*
 * props:
 *   table [Object]: Table object { displayName: [string], ... }
 *
 *   updateTable [function]: Function that gets called when the table display
 *                           name is edited, as specified in the EditField
 *                           component.
 *                           f([string: field name], [string: field value],
 *                             [string: object id]) => null
 *   deleteTable [function]: Function that gets called when the delete button
 *                           is clicked.
 *                           f([Object: Event object]) => null
 */
class TableModalHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      integrationsPanelVisible: false
    };

    this.toggleIntegrationsPanel = this.toggleIntegrationsPanel.bind(this);
  }

  toggleIntegrationsPanel(e) {
    this.setState({
      integrationsPanelVisible: !this.state.integrationsPanelVisible
    });
  }

  render() {
    const integrationsPanel = (
      this.state.integrationsPanelVisible
      ? <IntegrationsPanel />
      : undefined
    );
    return (
      <div>
        <HeaderPanel integrationsPanelVisible={this.state.integrationsPanelVisible}
                     toggleIntegrationsPanel={this.toggleIntegrationsPanel}
                     {...this.props} />
        <CSSTransitionGroup transitionName="ovc-integrations-panel"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={500}>
          {integrationsPanel}
        </CSSTransitionGroup>
      </div>
    );
  }
};

const HeaderPanel = (props) => {
  const upIcon = (props.integrationsPanelVisible
                  ? <i className="ion-chevron-up" /> : '');
  const downIcon = (!props.integrationsPanelVisible
                    ? <i className="ion-chevron-down" /> : '');
  return (
    <div className="ovc-modal-header ovc-header-panel">
      <div className="edit-integrations-button"
           onClick={props.toggleIntegrationsPanel}>
        <i className="ion-network" />
        {upIcon}
        {downIcon}
      </div>
      <EditField field="displayName"
                 fieldType="string"
                 originalValue={props.table.displayName}
                 placeholder="Click to edit"
                 onSave={props.updateTable} />
      <i className="ion-trash-a delete-table-button"
         onClick={props.deleteTable} />
    </div>
  );
}

const IntegrationsPanel = (props) => {
  return (
    <div className="ovc-modal-header ovc-integrations-panel">
      <div className="ovc-component-subnav-dropdown">
        <label>APIs</label>
        <DropdownButton className="dropdown-button"
                        title="Select an Integration"
                        id="ovc-component-subnav-dropdown">
          <MenuItem className="ovc-search-tab"
                    eventKey="crunchbase"
                    onSelect={props.changeSection}>
            Crunchbase
          </MenuItem>
          <MenuItem className="ovc-search-tab"
                    eventKey="salesforce"
                    onSelect={props.changeSection}>
            Salesforce
          </MenuItem>
          <MenuItem className="ovc-search-tab"
                    eventKey="pitchbook"
                    onSelect={props.changeSection}>
            Pitchbook
          </MenuItem>
        </DropdownButton>
      </div>

      <div className="ovc-component-subnav-dropdown">
        <label>Models</label>
        <DropdownButton className="dropdown-button"
                        title="Select a Model"
                        id="ovc-component-subnav-dropdown">
          <MenuItem className="ovc-search-tab"
                    eventKey="company"
                    onSelect={props.changeSection}>
            Company
          </MenuItem>
          <MenuItem className="ovc-search-tab"
                    eventKey="person"
                    onSelect={props.changeSection}>
            Person
          </MenuItem>
          <MenuItem className="ovc-search-tab"
                    eventKey="investment"
                    onSelect={props.changeSection}>
            Investment
          </MenuItem>
        </DropdownButton>
      </div>
    </div>
  );
}

/*
 * Use index instead of id because newly added (unsaved) fields will not have
 * an id. Null ids are used to create new fields (versus update existing ones)
 * when the table is saved.
 *
 * props:
 *   index [int]: Index of the field in the tableFields array.
 *   tableField [Object]: TableField object { displayName: ... }
 *
 *   updateTableField [function]: Function that gets called when the field
 *                                properties are edited, as specified in the
 *                                EditField component.
 *                                f([string: field name], [string: field value],
 *                                  [string: object id]) => null
 *   removeTableField [function]: Function that gets called when the delete
 *                                button is clicked.
 *                                f([Object: Event object]) => null
 */
const TableModalFieldPanel = (props) => {
  const dropdownFieldId = `ovc-table-modal-type-dropdown-${props.index}`;
  return (
    <div className="ovc-table-modal-field-panel">
      <div className="field-panel-name">
        <EditField id={props.index}
                   field="displayName"
                   fieldType="string"
                   originalValue={props.tableField.displayName}
                   placeholder="Click to edit"
                   onSave={props.updateTableField} />
      </div>
      <div className="field-panel-type">
        <DropdownField id={props.index} className="field-panel-type"
                       field="type"
                       elementId={dropdownFieldId}
                       originalValue={DATA_TYPE_MAP[props.tableField.type]}
                       placeholder="Click to edit"
                       options={DATA_TYPE_LIST}
                       onSelect={props.updateTableField} />
      </div>
      <i className="ion-android-close delete-field-button"
         id={props.index}
         onClick={props.removeTableField} />
    </div>
  );
};

/*
 * Use index instead of id because newly added (unsaved) fields will not have
 * an id. Null ids are used to create new fields (versus update existing ones)
 * when the table is saved.
 *
 * props:
 *   tableFields [Array]: List of TableField objects [{ displayName: ... }, ...]
 *
 *   updateTableField [function]: Function that gets called when the field
 *                                properties are edited, as specified in the
 *                                EditField component.
 *                                f([string: field name], [string: field value],
 *                                  [string: object id]) => null
 *   removeTableField [function]: Function that gets called when the delete
 *                                button is clicked.
 *                                f([Object: Event object]) => null
 */
const TableModalBody = (props) => {
  const fieldPanels = props.tableFields.map((tableField, index) => {
    return <TableModalFieldPanel index={index} key={index}
                                 tableField={tableField}
                                 updateTableField={props.updateTableField}
                                 removeTableField={props.removeTableField} />
  });
  return (
    <div className="ovc-modal-body ovc-table-modal-body"
         id="ovc-table-modal-body">
      {fieldPanels}
    </div>
  );
};

/*
 * props:
 *   addTableField [function]: Function that gets called when the Add Field
 *                             button is clicked.
 *     f([Object: Event object]) => null
 *   hideModal [function]: Function that gets called when the Cancel button is
 *                         clicked.
 *     f([Object: Event object]) => null
 *   saveTable [function]: Function that gets called when the Save button is
 *                         clicked.
 *     f([Object: Event object]) => null
 */
const TableModalFooter = (props) => {
  return (
    <div className="ovc-modal-footer ovc-table-modal-footer">
      <div className="ovc-table-modal-add-field"
           onClick={props.addTableField}>
        <i className="ion-plus" />
        Add Field
      </div>
      <div className="ovc-table-modal-buttons">
        <div className="modal-footer-button"
             onClick={props.hideModal}>
          <i className="ion-close" />
          Cancel
        </div>
        <div className="modal-footer-button"
             onClick={props.saveTable}>
          <i className="ion-plus" />
          Save
        </div>
      </div>
    </div>
  );
};

/*
 * props:
 *   table [Object]: Custom Table object { displayName: [string], ... }
 *   tableFields [Array]: List of Custom Field objects { displayName: ..., }
 *   visible [boolean]: Whether or not to show the modal.
 *
 *   hideModal [function]: Function to hide the modal.
 *     f([Object: Event object]) => null
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([Object: new object data]) => null
 *   onDelete [function]: Function that lets the parent component respond to
 *                        "delete" events in the data.
 *     f([Object: deleted object data]) => null
 */
class TableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: {},
      tableFields: [],
      fieldsToDelete: []
    };

    this._preventModalClose = this._preventModalClose.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.updateTableField = this.updateTableField.bind(this);
    this.addTableField = this.addTableField.bind(this);
    this.removeTableField = this.removeTableField.bind(this);

    this.saveTable = this.saveTable.bind(this);
    this.deleteTable = this.deleteTable.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible === false && nextProps.visible === true) {
      // Only load data when the modal shows
      this.setState({
        table: nextProps.table,
        tableFields: nextProps.tableFields,
        fieldsToDelete: []
      });
    }
  }

  _preventModalClose(e) {
    e.stopPropagation();
  }

  updateTable(tablePropertyName, tablePropertyValue) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['table', tablePropertyName], tablePropertyValue);
    this.setState(newState.toJS());
  }

  updateTableField(fieldPropertyName, fieldPropertyValue, fieldIdx) {
    const newState = Immutable.fromJS(this.state)
      .setIn(['tableFields', fieldIdx, fieldPropertyName], fieldPropertyValue);
    this.setState(newState.toJS());
  }

  addTableField(e) {
    const field = {
      displayName: '',
      type: 'string'
    };
    const newState = Immutable.fromJS(this.state)
      .update('tableFields', tableFields => tableFields.push(field));
    this.setState(newState.toJS());

    ScrollScroller.scrollToBottom({ containerId: 'ovc-table-modal-body' });
  }

  removeTableField(e) {
    const fieldIdx = Number(e.currentTarget.id);
    const field = this.state.tableFields[fieldIdx];
    const newFields = this.state.tableFields.filter((field, index) =>
      index !== fieldIdx
    );
    const newState = Immutable.fromJS(this.state)
      .set('tableFields', newFields);

    // If the field already exists, queue it for deletion
    if (field.id) {
      const removeFieldsState = Immutable.fromJS(newState)
        .update('fieldsToDelete', fieldsToDelete => fieldsToDelete.push(field));
      this.setState(removeFieldsState.toJS());
    }
    // Otherwise, ignore
    else {
      this.setState(newState.toJS());
    }
  }

  saveTable(e) {
    const saveField = (tableId, field) => {
      if (field.id) {
        return updateField(tableId, field.id, field);
      }
      else {
        return createField(tableId, field);
      }
    };

    // Update existing table
    if (this.state.table.id) {
      updateTable(this.state.table.id, this.state.table)
        .then((table) => {
          // Create/update existing fields
          this.state.tableFields.forEach((field) => {
            saveField(this.state.table.id, field);
          });
          // Delete removed fields
          // TODO: Make this synchronous
          this.state.fieldsToDelete.forEach((field) => {
            deleteField(this.state.table.id, field.id);
          });
          this.setState({ fieldsToDelete: [] }); // Possible race condition?
          // Update parent
          if (this.props.onSave) {
            this.props.onSave(table);
          }
        })
        .catch((err) => {
          console.log('Error', err);
          return (err);
        })
        .then(this.props.hideModal);
    }
    // Create new table
    else {
      createTable(this.state.table)
        .then((table) => {
          // Create/update existing fields
          this.state.tableFields.forEach((field) => {
            saveField(table.id, field);
          });
          // Delete removed fields
          // TODO: Make this synchronous
          this.state.fieldsToDelete.forEach((field) => {
            deleteField(this.state.table.id, field.id);
          });
          this.setState({ fieldsToDelete: [] }); // Possible race condition?
          // Update parent
          if (this.props.onSave) {
            this.props.onSave(table);
          }
        })
        .catch((err) => {
          console.log('Error', err);
          return (err);
        })
        .then(this.props.hideModal);
    }
  }

  deleteTable(e) {
    if (this.state.table.id) {
      deleteTable(this.state.table.id).then((tableId) => {
        if (this.props.onDelete) {
          // This reloads tables from the server. No need to pass tableId -
          // the entire table list gets refreshed
          this.props.onDelete();
        }
      })
      .then(this.props.hideModal);
    }
    else {
      this.props.hideModal();
    }
  }

  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    return (
      <div className={modalShowClass} onClick={this.props.hideModal}>
        <div className="ovc-modal ovc-table-modal"
             onClick={this._preventModalClose}>
          <TableModalHeader table={this.state.table}
                            updateTable={this.updateTable}
                            deleteTable={this.deleteTable} />
          <TableModalBody tableFields={this.state.tableFields}
                          updateTableField={this.updateTableField}
                          removeTableField={this.removeTableField} />
          <TableModalFooter hideModal={this.props.hideModal}
                            addTableField={this.addTableField}
                            saveTable={this.saveTable} />
        </div>
      </div>
    );
  }
}

export default TableModal;

