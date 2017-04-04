import React from 'react';
import Immutable from 'immutable';
import {authFetch, formatAPIJSON, preprocessJSON} from '../utils/api.js';

import {EditField} from './editfield.jsx';

import './edittable.scss';

/*
 * props:
 *   API_URL [string]: Backend API endpoint to hit.
 *   FIELDS [Array]: List of API fields to show as table columns.
 *   FIELD_MAP [Object]: Mapping between API field names and field properties:
 *   {
 *     [fieldName]: {
 *       display: [displayName], // Column display text
 *       type: [fieldType],      // Data type
 *       model: [modelname],     // TODO: Model the field belongs to
 *       required: [boolean],    // Whether the value is required to create a
 *                               // new object
 *       editable: [boolean]     // TODO: Whether the field is editable
 *     }
 *   }
 *
 *   fieldType [string]: 'string', 'number', 'money', 'date', 'image', 'text',
 *                       'model'
 */
class EditTable extends React.Component {
  constructor(props) {
    super(props);

    this._NEW_ROW_INITIAL = {};
    this.props.FIELDS.forEach((field) => {
      this._NEW_ROW_INITIAL[field] = '';
    });

    this.state = {
      data: [],
      addRow: false,
      newRow: this._NEW_ROW_INITIAL
    };

    // Add new row handlers
    this.toggleAddRow = this.toggleAddRow.bind(this);
    this.handleCreateEntity = this.handleCreateEntity.bind(this);

    // Update existing row handlers
    this.handleUpdateEntity = this.handleUpdateEntity.bind(this);
    this.handleDeleteEntity = this.handleDeleteEntity.bind(this);

    // Entity API
    this.getEntityList = this.getEntityList.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);

    this.getEntityList();
  }

  /*
   * Add new row handlers
   */

  toggleAddRow(e) {
    e.stopPropagation();
    this.setState({
      addRow: !this.state.addRow,
      newRow: this._NEW_ROW_INITIAL
    });
  }

  handleCreateEntity(field, value) {
    // Optimistic update
    const newState = Immutable.fromJS(this.state)
      .setIn(['newRow', field], value);

    // Write to the backend in callback (dependent on state update)
    this.setState(newState.toJS(), () => {
      // Return an array whose length is the number of required fields that are
      // empty.
      const missingRequiredFields = Object.keys(this.props.FIELD_MAP)
        .filter(key => {
          if (this.props.FIELD_MAP[key].required === true)
            return this.state.newRow[key].trim() === '';
          return false;
        });
      if (missingRequiredFields.length === 0) {
        this.createEntity(this.state.newRow);
        this.setState({
          addRow: false,
          newRow: this._NEW_ROW_INITIAL
        });
      }
    });
  }

  /*
   * Update existing row handlers
   */

  handleUpdateEntity(field, value, entityId) {
    // Optimistic update
    const entityIdx = this.state.data.findIndex(entity =>
      entity.id === entityId
    );
    const newState = Immutable.fromJS(this.state)
      .setIn(['data', entityIdx, field], value);

    // Write to the backend in callback
    this.setState(newState.toJS(), () => {
      let body = {};
      body[field] = value;
      this.updateEntity(entityId, body);
    });
  }

  handleDeleteEntity(e) {
    this.deleteEntity(e.currentTarget.id);
  }

  /*
   * Entity API
   */

  getEntityList() {
    authFetch(this.props.API_URL)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = formatAPIJSON(preprocessJSON(json), this.props.FIELDS);
      this.setState({ data: json });
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  createEntity(entity) {
    authFetch(this.props.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(entity)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = formatAPIJSON(preprocessJSON(json), this.props.FIELDS);
      const newState = Immutable.fromJS(this.state)
        .update('data', data => data.push(json));

      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  updateEntity(entityId, entity) {
    authFetch(`${this.props.API_URL}/${entityId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(entity)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = formatAPIJSON(preprocessJSON(json), this.props.FIELDS);
      const entityIdx = this.state.data.findIndex(entity =>
        entity.id === json.id
      );

      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx], json);
      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  deleteEntity(entityId) {
    authFetch(`${this.props.API_URL}/${entityId}`, {
      method: 'DELETE'
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const deletedId = json.id;
      const newEntities = this.state.data.filter(entity =>
        entity.id !== deletedId
      );

      const newState = Immutable.fromJS(this.state)
        .set('data', newEntities);
      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  render() {
    const headers = this.props.FIELDS.map((field) => {
      return (<td key={field}>{this.props.FIELD_MAP[field].display}</td>);
    });

    const rows = this.state.data.map((row) => {
      const elements = this.props.FIELDS.map((field) => {
        const uniqueKey = `${row.id.toString()}-${field}`;
        return (
          <td key={uniqueKey}>
            <EditField field={field} id={row.id}
                       fieldType={this.props.FIELD_MAP[field].type}
                       originalValue={row[field]}
                       onSave={this.handleUpdateEntity} />
          </td>
        );
      });
      return (
        <tr key={row.id}>
          {elements}
          <td className="remove-entity" id={row.id}
              onClick={this.handleDeleteEntity}>
            <i className="ion-trash-a" />
          </td>
        </tr>
      );
    });

    const newRow = (
      this.state.addRow
      ? (
        <tr>{this.props.FIELDS.map((field) => {
          return (
            <td key={field}>
              <EditField field={field}
                         fieldType={this.props.FIELD_MAP[field].type}
                         originalValue={this.state.newRow[field]}
                         onSave={this.handleCreateEntity} />
            </td>
          );
        })}
        <td className="remove-entity" />
        </tr>
      )
      : null
    );
    const addRow = (
      <tr>
        <td className="add-entity" colSpan={this.props.FIELDS.length+1}
            onClick={this.toggleAddRow}>
          {this.state.addRow ? <i className="ion-minus" /> : <i className="ion-plus" />}
        </td>
      </tr>
    )

    return (
      <table className="ovc-edit-table">
        <thead>
          <tr>
            {headers}
            <td className="remove-entity" />
          </tr>
        </thead>
        <tbody>
          {rows}
          {newRow}
          {addRow}
        </tbody>
      </table>
    );
  }
}

export default EditTable;

