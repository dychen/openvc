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

const INTEGRATIONS = [
  {
    key: 'crunchbase',
    icon: 'ion-arrow-graph-up-right',
    display: 'Crunchbase',
    models: [
      {
        key: 'company',
        display: 'Company',
        fields: [
          { key: 'name', display: 'Name' },
          { key: 'description', display: 'Description' },
          { key: 'logoUrl', display: 'Logo URL' },
          { key: 'website', display: 'Website' },
          { key: 'location', display: 'Location' }
        ]
      }, {
        key: 'person',
        display: 'Person',
        fields: []
      }
    ]
  }, {
    key: 'salesforce',
    icon: 'ion-cloud',
    display: 'Salesforce',
    models: [
      {
        key: 'account',
        display: 'Account',
        fields: [
          { key: 'name', display: 'Name' },
          { key: 'description', display: 'Description' },
          { key: 'segment', display: 'Segment' },
          { key: 'sector', display: 'Sector' },
          { key: 'website', display: 'Website' },
          { key: 'location', display: 'Location' }
        ]
      }
    ]
  }
];

const getIntegration = (integrationKey) => {
  return INTEGRATIONS.find(integration => integration.key === integrationKey);
};

const getIntegrationModel = (integration, modelKey) => {
  if (integration && integration.models)
    return integration.models.find(model => model.key === modelKey) || {};
  return {};
};

const getModelField = (model, fieldKey) => {
  if (model && model.fields)
    return model.fields.find(field => field.key === fieldKey) || {};
  return {};
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

class FieldPanelIntegrationsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      integrations: {

      }
    };
  }

  updateTableField(eventKey, e) {
    const integrationList = [];
    this.setState({ integrations: integrationsList });
    this.props.updateTableField('integrations', integrationList,
                                this.props.index);
  }

  render() {
    const integrations = INTEGRATIONS.map(integration => (
      <IntegrationsListPanelItem integration={integration}
                                 key={integration.key} />
    ));
    return (
      <div className="field-panel-section integrations-list-section">
        {integrations}
      </div>
    );
  }
}

/*
 * props:
 *   integration
 */
class IntegrationsListPanelItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedModelKey: '',
      selectedFieldKey: ''
    };

    this.selectModel = this.selectModel.bind(this);
    this.selectField = this.selectField.bind(this);
  }

  selectModel(eventKey, e) {
    this.setState({ selectedModelKey: eventKey });
  }

  selectField(eventKey, e) {
    this.setState({ selectedFieldKey: eventKey });
  }

  render() {
    const integration = getIntegration(this.props.integration.key);
    const selectedModel = getIntegrationModel(integration,
                                              this.state.selectedModelKey);
    const selectedField = getModelField(selectedModel,
                                        this.state.selectedFieldKey);
    const integrationModels = (integration && integration.models
                               ? integration.models : []);
    const modelFields = (selectedModel && selectedModel.fields
                         ? selectedModel.fields : []);

    const modelList = integrationModels.map(model => (
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
          <i className={this.props.integration.icon} />
          {this.props.integration.display}
        </label>
        <div>
          <DropdownButton className="dropdown-button"
                          title={selectedModel.display || 'Select a model'}
                          id={`ovc-integrations-panel-model-dropdown-
                               ${this.props.integration.key}`}>
            {modelList}
          </DropdownButton>
          <DropdownButton className="dropdown-button"
                          title={selectedField.display || 'Select a field'}
                          id={`ovc-integrations-panel-field-dropdown-
                               ${this.props.integration.key}`}>
            {fieldList}
          </DropdownButton>
        </div>
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

