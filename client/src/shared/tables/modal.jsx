import React from 'react';
import Immutable from 'immutable';
import Scroll from 'react-scroll';
const ScrollScroller = Scroll.animateScroll;

import {createTable, updateTable, deleteTable,
        getFieldList, createField, updateField, deleteField} from './api.js';
import {EditField} from '../../components/editfield.jsx';

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
const TableModalHeader = (props) => {
  return (
    <div className="ovc-modal-header ovc-table-modal-header">
      <EditField field="displayName"
                 fieldType="string"
                 originalValue={props.table.displayName}
                 placeholder="Click to edit"
                 onSave={props.updateTable} />
      <i className="ion-trash-a delete-table-button"
         onClick={props.deleteTable} />
    </div>
  );
};

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
  return (
    <div className="ovc-table-modal-field-panel">
      <EditField id={props.index}
                 field="displayName"
                 fieldType="string"
                 originalValue={props.tableField.displayName}
                 placeholder="Click to edit"
                 onSave={props.updateTableField} />
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
 *   visible [boolean]: Whether or not to show the modal.
 *
 *   hideModal [function]: Function to hide the modal.
 *     f([Object: Event object]) => null
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([Object: new object data]) => null
 */
class TableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: {},
      tableFields: []
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
        tableFields: nextProps.tableFields
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
      id: new Date().getTime(), // Temporary id, used to modify/delete the field
      displayName: '',
      type: 'string'
    };
    const newState = Immutable.fromJS(this.state)
      .update('tableFields', tableFields => tableFields.push(field));
    this.setState(newState.toJS());

    ScrollScroller.scrollToBottom({ containerId: 'ovc-table-modal-body' });
  }

  removeTableField(e) {
    const newFields = this.state.tableFields.filter((field, index) =>
      index !== Number(e.currentTarget.id)
    );
    const newState = Immutable.fromJS(this.state)
      .set('tableFields', newFields);
    this.setState(newState.toJS());
  }

  saveTable(e) {
    const saveField = (field) => {
      if (field.id) {
        return updateField(this.state.table.id, field.id, field);
      }
      else {
        return updateField(this.state.table.id, field);
      }
    };

    // Update existing table
    if (this.state.table.id) {
      updateTable(this.state.table.id, this.state.table)
        .then((table) => {
          this.state.tableFields.forEach((field) => {
            saveField(field, this.state.table.id);
          });
        })
        .then(this.props.hideModal);
    }
    // Create new table
    else {
      createTable(this.state.table.id)
        .then((table) => {
          this.state.tableFields.forEach((field) => {
            saveField(field, table.id);
          });
        })
        .then(this.props.hideModal);
    }
  }

  deleteTable(e) {
    if (this.state.table.id) {
      this.props.hideModal();
    }
    else {
      deleteTable(this.state.table.id).then(this.props.hideModal);
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
        <div className="ovc-modal modalfield-modal"
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

