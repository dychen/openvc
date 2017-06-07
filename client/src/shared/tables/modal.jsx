import React from 'react';
import Immutable from 'immutable';
import {DropdownButton, MenuItem, ButtonToolbar, Button} from 'react-bootstrap';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'
import Scroll from 'react-scroll';
const ScrollScroller = Scroll.animateScroll;

import {createTable, updateTable, deleteTable,
        createField, updateField, deleteField, syncTable} from './api.js';
import {EditField, DropdownField} from '../../components/editfield.jsx';
import {DATA_TYPE_LIST, DATA_TYPE_MAP} from '../../utils/constants.js';

import './modal.scss';

const getSource = (sourceList, sourceKey) => {
  return sourceList.find(source => source.key === sourceKey);
};

const getSourceModel = (source, modelKey) => {
  if (source && source.models)
    return source.models.find(model => model.key === modelKey) || {};
  return {};
};

const getModelField = (model, fieldKey) => {
  if (model && model.fields)
    return model.fields.find(field => field.key === fieldKey) || {};
  return {};
};

// Data transforms
const getDefaultField = (fields, apiName) => {
  return fields.filter(field => field.apiName === apiName
                       && field.source && field.source.source === 'self');
};

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
    <div className="ovc-modal-header ovc-header-panel">
      <i className="ion-android-sync sync-table-button"
         onClick={props.syncTable} />
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


const FieldPanelFieldSection = (props) => {
  const dropdownFieldId = `ovc-table-modal-type-dropdown-${props.index}`;

  return (
    <div className="field-panel-section field-section">
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
}

const FieldPanelToggleSection = (props) => {
  const upIcon = (props.integrationsPanelVisible
                  ? <i className="ion-chevron-up" /> : '');
  const downIcon = (!props.integrationsPanelVisible
                    ? <i className="ion-chevron-down" /> : '');

  return (
    <div className="field-panel-section integrations-toggle-section"
         onClick={props.toggleIntegrationsPanel}>
      <div className="edit-integrations-button">
        <i className="ion-network" />
        {upIcon}
        {downIcon}
      </div>
      See Existing Integrations
    </div>
  );
}

const FieldPanelIntegrationsSection = (props) => {
  const updateTableField = (sourceKey, modelKey, fieldKey) => {
    let newList;
    // Create or update field source
    const sourceIdx = props.tableField.sources.findIndex(source =>
      source.source === sourceKey
    );
    const newSource = { source: sourceKey, model: modelKey, field: fieldKey };
    // Update
    if (sourceIdx > -1) {
      newList = Immutable.fromJS(props.tableField.sources)
        .set(sourceIdx, newSource).toJS();
    }
    // Create
    else {
      newList = props.tableField.sources.concat(newSource);
    }

    props.updateTableField('sources', newList, props.index);
  };
  const resetTableField = (sourceKey) => {
    // Remove field source
    const newList = props.tableField.sources.filter(field =>
      field.source !== sourceKey
    );
    props.updateTableField('sources', newList, props.index);
  }

  const integrations = props.SOURCES.map(sourceOptions => {
    const source = props.tableField.sources.find(source =>
      source.source === sourceOptions.key
    ) || {}; // Find the corresponding source object, or default to {}
    return (
      <IntegrationsListPanelItem source={source}
                                 sourceOptions={sourceOptions}
                                 SOURCES={props.SOURCES}
                                 updateTableField={updateTableField}
                                 resetTableField={resetTableField}
                                 key={sourceOptions.key} />
    );
  });
  return (
    <div className="field-panel-section integrations-list-section">
      {integrations}
    </div>
  );
}

/*
 * props:
 *   source [Object]:
 *   SOURCES [Array]:
 *   sourceOptions [Object]:
 *
 *   updateTableField [function]:
 *   resetTableField [function]:
 */
class IntegrationsListPanelItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedModelKey: this.props.source.model || '',
      selectedFieldKey: this.props.source.field || ''
    };

    this.selectModel = this.selectModel.bind(this);
    this.selectField = this.selectField.bind(this);
    this.resetSource = this.resetSource.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.source.model !== this.state.selectedModelKey
        || nextProps.source.field !== this.state.selectedFieldKey) {
      // Only load data when the modal shows
      this.setState({
        selectedModelKey: nextProps.source.model,
        selectedFieldKey: nextProps.source.field,
      });
    }
  }

  selectModel(eventKey, e) {
    this.setState({ selectedModelKey: eventKey });
  }

  selectField(eventKey, e) {
    this.setState({ selectedFieldKey: eventKey });
    this.props.updateTableField(this.props.sourceOptions.key,
                                this.state.selectedModelKey, eventKey);
  }

  resetSource(eventKey, e) {
    this.setState({ selectedModelKey: '', selectedFieldKey: '' });
    this.props.resetTableField(this.props.sourceOptions.key);
  }

  render() {
    const source = getSource(this.props.SOURCES, this.props.sourceOptions.key);
    const selectedModel = getSourceModel(source, this.state.selectedModelKey);
    const selectedField = getModelField(selectedModel,
                                        this.state.selectedFieldKey);
    const sourceModels = source && source.models ? source.models : [];
    const modelFields = (selectedModel && selectedModel.fields
                         ? selectedModel.fields : []);

    const modelList = sourceModels.map(model => (
      <MenuItem className="ovc-search-tab"
                key={model.key}
                eventKey={model.key}
                onSelect={this.selectModel}>
        {model.display}
      </MenuItem>
    ));
    const fieldList = modelFields.map(field => (
      <MenuItem className="ovc-search-tab"
                key={field.key}
                eventKey={field.key}
                onSelect={this.selectField}>
        {field.display}
      </MenuItem>
    ));
    return (
      <div className="integrations-list-row">
        <label>
          <i className={this.props.sourceOptions.icon} />
          {this.props.sourceOptions.display}
        </label>
        <ButtonToolbar>
          <DropdownButton className="dropdown-button"
                          title={selectedModel.display || 'Select a model'}
                          id={`ovc-integrations-panel-model-dropdown-
                               ${this.props.sourceOptions.key}`}>
            {modelList}
          </DropdownButton>
          <DropdownButton className="dropdown-button"
                          title={selectedField.display || 'Select a field'}
                          id={`ovc-integrations-panel-field-dropdown-
                               ${this.props.sourceOptions.key}`}>
            {fieldList}
          </DropdownButton>
          <Button bsStyle="danger"
                  onClick={this.resetSource}>Reset</Button>
        </ButtonToolbar>
      </div>
    );
  }
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
class TableModalFieldPanel extends React.Component {
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
    let integrationsPanel = (
      this.state.integrationsPanelVisible
      ? <FieldPanelIntegrationsSection
          index={this.props.index}
          SOURCES={this.props.SOURCES}
          tableField={this.props.tableField}
          updateTableField={this.props.updateTableField} />
      : undefined
    );

    return (
      <div className="ovc-table-modal-field-panel">
        <FieldPanelFieldSection {...this.props} />

        <FieldPanelToggleSection
          integrationsPanelVisible={this.state.integrationsPanelVisible}
          toggleIntegrationsPanel={this.toggleIntegrationsPanel} />

        <CSSTransitionGroup transitionName="ovc-integrations-panel"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={500}>
          {integrationsPanel}
        </CSSTransitionGroup>
      </div>
    );
  }
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
                                 SOURCES={props.SOURCES}
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
    this.syncTable = this.syncTable.bind(this);
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

  syncTable(e) {
    if (this.state.table.id) {
      syncTable(this.state.table.id).then((tableId) => {
        this.props.hideModal();
      });
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
                            deleteTable={this.deleteTable}
                            syncTable={this.syncTable} />
          <TableModalBody tableFields={this.state.tableFields}
                          SOURCES={this.props.SOURCES}
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

