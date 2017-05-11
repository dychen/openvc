import React from 'react';
import {createTable, updateTable, deleteTable,
        getFieldList, createField, updateField, deleteField} from './api.js';

import './modal.scss';

class TableModalHeader extends React.Component {
  render() {
    return (
      <div className="ovc-modal-header ovc-table-modal-header">
        {this.props.table.displayName}
        <i className="ion-trash-a delete-table-button" />
      </div>
    );
  }
}

class TableModalFieldPanel extends React.Component {
  render() {
    return (
      <div className="ovc-table-modal-field-panel">
        {this.props.tableField.displayName}
      </div>
    );
  }
}

class TableModalBody extends React.Component {
  render() {
    const fieldPanels = this.props.tableFields.map((tableField) => {
      return <TableModalFieldPanel key={tableField.apiName}
                                   tableField={tableField} />
    });
    return (
      <div className="ovc-modal-body">
        {fieldPanels}
      </div>
    );
  }
}

class TableModalFooter extends React.Component {
  render() {
    return (
      <div className="ovc-modal-footer ovc-table-modal-footer">
        <i className="ion-plus" />
        Add Field
      </div>
    );
  }
}

/*
 * props:
 *   visible
 *
 *   hideModal
 *   onSubmit
 */
const TableModal = (props) => {
  const _preventModalClose = (e) => {
    e.stopPropagation();
  }

  const modalShowClass = (
    props.visible
    ? 'ovc-modal-background show'
    : 'ovc-modal-background'
  );

  return (
    <div className={modalShowClass} onClick={props.hideModal}>
      <div className="ovc-modal modalfield-modal"
           onClick={_preventModalClose}>
        <TableModalHeader table={props.table} />
        <TableModalBody tableFields={props.tableFields} />
        <TableModalFooter />
      </div>
    </div>
  );
}

export default TableModal;

