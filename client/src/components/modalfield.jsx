import React from 'react';
import CreateCompanyModal from './modals/company.jsx';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../utils/api.js';

import {EditField, StaticField} from './editfield.jsx';

import './modalfield.scss';

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
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([Object: new object data]) => null
 */
class CompanyTableModal extends React.Component {
  constructor(props) {
    super(props);

    this._API_URL = `${SERVER_URL}/api/v1/data/company`;
    this._MATCH_FIELDS = ['name', 'location', 'website', 'logoUrl'];
    this._MATCH_LIMIT = 100;

    this.state = {
      data: this.props.data || {},
      searchInput: '',
      matches: []
    };

    /* Helpers */
    this._preventModalClose = this._preventModalClose.bind(this);
    this._filterMatches = this._filterMatches.bind(this);

    /* Search methods */
    this.handleUpdateSearch = this.handleUpdateSearch.bind(this);
    this.handleSelectNewEntity = this.handleSelectNewEntity.bind(this);
    this.handleSelectEntity = this.handleSelectEntity.bind(this);

    /* Update methods */
    // Called when EditField inputs are saved
    this.handleUpdateEntity = this.handleUpdateEntity.bind(this);
    // Called when the "Save" button is clicked
    this.handleSave = this.handleSave.bind(this);

    /* API methods */
    this.getEntityList = this.getEntityList.bind(this);
    this.getEntity = this.getEntity.bind(this);
    // Called when the "Save" button is clicked
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.visible === false
        && nextProps.visible
        && nextProps.visible === true) {
      // Only load data when the modal shows - not when the modal is mounted
      // because every modal is mounted at the same time on component
      // initialization
      this.getEntityList();
    }
  }

  _preventModalClose(e) {
    e.stopPropagation();
  }

  /* Search methods */

  handleUpdateSearch(e) {
    this.setState({ searchInput: e.currentTarget.value });
  }

  handleSelectNewEntity(e) {
    this.setState({ data: {} });
  }

  handleSelectEntity(e) {
    this.getEntity(e.currentTarget.id);
  }

  /* Update methods */

  handleUpdateEntity(field, value) {
    const newState = Immutable.fromJS(this.state).setIn(['data', field], value);
    this.setState(newState.toJS());
  }

  handleSave(e) {
    // Update
    if (this.state.data.id) {
      this.updateEntity(this.state.data.id, this.state.data).then((data) => {
        this.props.onSave(data);
        this.props.hideModal(e);
      });
    }
    // Create
    else {
      this.createEntity(this.state.data).then((data) => {
        this.props.onSave(data);
        this.props.hideModal(e);
      });
    }
  }

  /* API methods */

  getEntityList() {
    return authFetch(this._API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: { fields: this._MATCH_FIELDS }
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
      this.setState({ matches: json });
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  getEntity(objId) {
    return authFetch(`${this._API_URL}/${objId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: { fields: this.props.FIELDS }
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
      this.setState({ data: json });
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  // Returns a Promise so the caller can use the returned data
  createEntity(obj) {
    return authFetch(this._API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: { fields: this.props.FIELDS },
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
      return json;
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  // Returns a Promise so the caller can use the returned data
  updateEntity(objId, obj) {
    return authFetch(`${this._API_URL}/${objId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: { fields: this.props.FIELDS },
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
      return json;
    })
    .catch(err => {
      // Failure
      return err;
    });
  }

  _filterMatches(matches) {
    if (this.state.searchInput) {
      return matches.filter((match) => {
        return ((match.name
                 && match.name.toLowerCase()
                              .indexOf(this.state.searchInput) > -1)
                || (match.website
                    && match.website.toLowerCase()
                                    .indexOf(this.state.searchInput) > -1)
                || (match.location
                    && match.location.toLowerCase()
                                     .indexOf(this.state.searchInput) > -1));
      });
    }
    return matches;
  }

  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    const inputFields = this.props.FIELDS.map((field) => {
      return (
        <div className="modal-input-field" key={field}>
          <div className="modal-input-title">
            {this.props.FIELD_MAP[field].display}
          </div>
          <EditField field={field} id={this.props.modelId}
                     fieldType={this.props.FIELD_MAP[field].type}
                     placeholder="Click to update"
                     originalValue={this.state.data[field]}
                     onSave={this.handleUpdateEntity} />
        </div>
      );
    });

    const createNewEntity = (
      <div className="modal-field-match"
           onClick={this.handleSelectNewEntity}>
        <span className="modal-field-create-new-icon">
          <i className="ion-plus" />
        </span>
        <div className="modal-field-match-text">
          <span className="bold">Click to create a new Company</span>
          <span className="small gray">Website</span>
          <span className="small">Location</span>
        </div>
      </div>
    );
    const matchedEntities = this._filterMatches(this.state.matches)
                                .slice(0, this._MATCH_LIMIT)
                                .map((entity) => {
      return (
        <div className="modal-field-match" key={entity.id} id={entity.id}
             onClick={this.handleSelectEntity}>
          <img src={entity.logoUrl} />
          <div className="modal-field-match-text">
            <span className="bold">{entity.name}</span>
            <span className="small gray">{entity.website}</span>
            <span className="small">{entity.location}</span>
          </div>
        </div>
      );
    });

    return (
      <div className={modalShowClass} onClick={this.props.hideModal}>
        <div className="ovc-modal modal-field-modal"
             onClick={this._preventModalClose}>
          <div className="modal-field-modal-header">
            Update a related company
          </div>
          <div className="modal-field-modal-body">
            <div className="modal-body-section left">
              <input placeholder="Search here"
                     value={this.state.searchInput}
                     onChange={this.handleUpdateSearch} />
              {createNewEntity}
              <div className="modal-field-modal-matches">
                {matchedEntities}
              </div>
            </div>
            <div className="modal-body-section right">
              {inputFields}
            </div>
          </div>
          <div className="modal-field-modal-footer">
            <div className="modal-footer-button left"
                 onClick={this.props.hideModal}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button right"
                 onClick={this.handleSave}>
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

  /*
   * Request body example:
   *   A map of just the model field name and the model id
   *   { owner: [int] }
   */
  updateEntity(obj) {
    let body = {};
    body[this.props.modelKey] = obj.id;

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
        break;
      case 'company':
      default:
        modal = (
          <CompanyTableModal FIELDS={this.props.FIELDS}
                             FIELD_MAP={this.props.FIELD_MAP}
                             data={this.props.data}
                             visible={this.state.modalVisible}
                             hideModal={this.hideModal}
                             onSave={this.updateEntity} />
        );
        break;
    }

    return (
      <span className="ovc-modal-field">
        <StaticField originalValue={this.props.data[this.props.field]}
                     fieldType={this.props.FIELD_MAP[this.props.field].type}
                     enterEditMode={this.showModal} />
        {modal}
      </span>
    );
  }
}

export {ModalField};

