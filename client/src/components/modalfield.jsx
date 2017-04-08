import React from 'react';
import CreateCompanyModal from './modals/company.jsx';
import {CreateContactModal} from './modals/person.jsx';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../utils/api.js';

import {EditField, StaticField} from './editfield.jsx';

/*
 * props:
 *   FIELDS [Array]: List of API fields to show as edit fields.
 *   FIELD_MAP [Object]: Mapping between table field names and field properties.
 *   {
 *     [fieldName]: {
 *       display: [string],      // Column display text
 *       type: [string],         // Data type - see below
 *       required: [boolean],    // Whether the value is required to create a
 *                               // new object
 *       editable: [boolean]     // TODO: Whether the field is editable
 *     }
 *   }
 *   data [Object]: Initial object values: { [fieldName]: [value], ... }
 *   visible [boolean]: Whether or not to show the modal.
 *
 *   hideModal [function]: Function to hide the modal.
 *     f([Object: Event object]) => null
 *   createEntity [function]: Function that creates a new object in the
 *                            database.
 *     f([Object: new object data]) => null
 *   updateEntity [function]: Function that updates an existing object in the
 *                            database.
 *     f([string]: object id] ,[Object: new object data]) => null
 */
class CompanyTableModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data || {}
    };

    this._preventModalClose = this._preventModalClose.bind(this);
    // Called when EditField inputs are saved
    this.handleUpdateEntity = this.handleUpdateEntity.bind(this);
    // Called when the "Save" button is clicked
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
  }

  _preventModalClose(e) {
    e.stopPropagation();
  }

  handleUpdateEntity(field, value) {
    const newState = Immutable.fromJS(this.state).setIn(['data', field], value);
    this.setState(newState.toJS());
  }

  createEntity(e) {
    this.props.createEntity(this.state.data);
    this.props.hideModal(e);
  }

  updateEntity(e) {
    this.props.updateEntity(this.state.data.id, this.state.data);
    this.props.hideModal(e);
  }

  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    const inputFields = this.props.FIELDS.map((field) => {
      return (
        <EditField className="entity-input"
                   field={field} id={this.props.modelId} key={field}
                   fieldType={this.props.FIELD_MAP[field].type}
                   originalValue={this.state.data[field]}
                   onSave={this.handleUpdateEntity} />
      );
    });

    return (
      <div className={modalShowClass} onClick={this.props.hideModal}>
        <div className="ovc-modal create-entity-modal"
             onClick={this._preventModalClose}>
          <div className="create-entity-modal-header">
            Update a related company
          </div>
          <div className="create-entity-modal-body">
            {inputFields}
          </div>
          <div className="create-entity-modal-footer">
            <div className="modal-footer-button left"
                 onClick={this.props.hideModal}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button right"
                 onClick={this.updateEntity}>
              <i className="ion-plus" />
              <span>Save</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/*
 * props:
 *   API_URL [string]: API endpoints the server should be calling for creating
 *                     or updating an entity.
 *   rowId [string]: [Optional] Id of the parent object that's being updated.
 *                   E.g., if the Modal is to update a company related to a
 *                   deal object, rowId would be the id of the deal object.
 *                   Undefined for new row table cells that create new objects.
 *   modelType [string]: Type of the underlying model. Determines which modal
 *                       should show. Options: 'company', 'person'
 *   modelKey [string]: Name of the underlying model from the API.
 *   field [string]: Name of the field, used for displaying the underlying
 *                   value.
 *
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([string: modelKey], [Object: new object data],
 *       [string: object id]) => null
 *
 * props passed to TableModal components:
 *   FIELDS [Array]: List of API fields to show as edit fields.
 *   FIELD_MAP [Object]: Mapping between table field names and field properties.
 *   {
 *     [fieldName]: {
 *       display: [string],      // Column display text
 *       type: [string],         // Data type - see below
 *       required: [boolean],    // Whether the value is required to create a
 *                               // new object
 *       editable: [boolean]     // TODO: Whether the field is editable
 *     }
 *   }
 *   data [Object]: Initial object values: { [fieldName]: [value], ... }
 */
class ModalField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
  }

  showModal(e) {
    e.stopPropagation(); // Don't propagate to hideModal() handlers
    this.setState({ modalVisible: true });
  }

  hideModal(e) {
    e.stopPropagation(); // Don't propagate to showModal() handlers
    this.setState({ modalVisible: false });
  }

  // TODO: Currently UNUSED. Finish this when implementing object creation
  //       functionality
  createEntity(obj) {
    authFetch(`${this.props.API_URL}/${this.props.rowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          console.error(json);
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      this.props.onSave(json);
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  /*
   * Request body example: {
   *   owner: {
   *     id: [string],
   *     firstName: [string],
   *     lastName: [string],
   *     ...
   *   }
   * }
   */
  updateEntity(objId, obj) {
    let body = {};
    body[this.props.modelKey + 'Id'] = obj.id;
    body[this.props.modelKey] = obj;

    authFetch(`${this.props.API_URL}/${this.props.rowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          console.error(json);
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      this.props.onSave(this.props.modelKey, json[this.props.modelKey],
                        this.props.rowId);
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  render() {
    let modal;
    switch (this.props.modelType) {
      case 'person':
        modal = (
          <CreateContactModal visible={this.state.modalVisible}
                              hideModal={this.hideModal}
                              createEntity={this.createEntity}
                              updateEntity={this.updateEntity} />
        );
        break;
      case 'company':
      default:
        modal = (
          <CompanyTableModal FIELDS={this.props.FIELDS}
                             FIELD_MAP={this.props.FIELD_MAP}
                             data={this.props.data}
                             visible={this.state.modalVisible}
                             hideModal={this.hideModal}
                             createEntity={this.createEntity}
                             updateEntity={this.updateEntity} />
        );
        break;
    }

    return (
      <span className="ovc-edit-field">
        <StaticField originalValue={this.props.data[this.props.field]}
                     fieldType={this.props.FIELD_MAP[this.props.field].type}
                     enterEditMode={this.showModal} />
        {modal}
      </span>
    );
  }
}

export {ModalField};

