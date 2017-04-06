import React from 'react';
import CreateCompanyModal from './modals/company.jsx';
import {CreateContactModal} from './modals/person.jsx';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../utils/api.js';

/*
 * props:
 *   API_URL [string]: API endpoints the server should be calling for creating
 *                     or updating an entity.
 *   modelType [string]: Type of the underlying model. Determines which modal
 *                       should show. Options: 'company', 'person'
 *   field [string]: Field name that's being edited. Should end in 'Id' (e.g.
 *                   'companyId')
 *   id [string]: [Optional] Id of the object that's being updated. Undefined
 *                for new row table cells that create new objects.
 *   originalValue [string]: Initial value of the field.
 *
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([string: field value]) => null
 */
class BaseModalField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.originalValue || '',
      modalVisible: false
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
  }

  showModal(e) {
    this.setState({ modalVisible: true });
  }

  hideModal(e) {
    this.setState({ modalVisible: false });
  }

  createEntity(obj) {
    authFetch(this.props.API_URL, {
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
          console.log(json);
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      this.setState({ value: json[this.props.field] }, () => {
        this.props.onSave(json[this.props.field]);
      });
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  updateEntity(objId, obj) {
    let body = {}
    body[this.props.field] = objId;
    authFetch(`${this.props.API_URL}/${this.props.id}`, {
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
          console.log(json);
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      this.setState({ value: json[this.props.field] }, () => {
        this.props.onSave(json[this.props.field]);
      });
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
          <CreateCompanyModal visible={this.state.modalVisible}
                              hideModal={this.hideModal}
                              createEntity={this.createEntity}
                              updateEntity={this.updateEntity} />
        );
        break;
    }

    return (
      <span className="ovc-edit-field"
            onClick={this.showModal}>
        {this.state.value}
        {modal}
      </span>
    );
  }
}

/*
 * Same as the BaseModalField component, but wraps the onSave method in a more
 * flexible API to allow parent components to more easily interact:
 *   onSave [function]: f([string: field name], [string: field value],
 *                        [string: object id]) => null
 *
 * Inherited props:
 *   API_URL [string]: API endpoints the server should be calling for creating
 *                     or updating an entity.
 *   modelType [string]: Type of the underlying model. Determines which modal
 *                       should show. Options: 'company', 'person'
 *   field [string]: Field name that's being edited. Should end in 'Id' (e.g.
 *                   'companyId')
 *   id [string]: [Optional] Id of the object that's being updated. Undefined
 *                for new row table cells that create new objects.
 *   originalValue [string]: Initial value of the field.
 *
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([string: field value]) => null
 */
class ModalField extends React.Component {
  constructor(props) {
    super(props);

    this.onSave = this.onSave.bind(this);
  }

  onSave(value) {
    this.props.onSave(this.props.field, value, this.props.id);
  }

  render() {
    // Override onSave and onUpdate with wrapped method.
    return (
      <BaseModalField {...this.props}
                      onSave={this.onSave} />
    );
  }
}

export {BaseModalField, ModalField};

