import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON, transformEditJSON} from '../utils/api.js';

import EditField from './editfield.jsx';

import './edittable.scss';

/*
 * props:
 *   API_URL [string]: Backend API endpoint to hit.
 *   FIELDS [Array]: List of API fields to show as table columns.
 *   FIELD_DISPLAY_MAP [Object]: Mapping between API field names and table
 *                               header display names.
 */
class EditTable extends React.Component {
  constructor(props) {
    super(props);

    this._NEW_ROW_INITIAL = {};
    this.props.FIELDS.forEach((field) => { this._NEW_ROW_INITIAL[field] = '' });

    this.state = {
      data: [],
      addRow: false,
      newRow: this._NEW_ROW_INITIAL
    };

    this._cancelEdits = this._cancelEdits.bind(this);

    // Add new row handlers
    this.toggleAddRow = this.toggleAddRow.bind(this);
    this.updateAddRowInput = this.updateAddRowInput.bind(this);
    this.handleCreateEntity = this.handleCreateEntity.bind(this);

    // Update existing row handlers
    this.editEntity = this.editEntity.bind(this);
    this.updateEntityInput = this.updateEntityInput.bind(this);
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
   * WARNING: This can cause unexpected bugs because it's bound to the
   *          the container div and modifies state. Be sure to stop propagation
   *          on subcomponent clicks, and consider only firing if an "in edit
   *          mode" flag is set.
   * TODO: Find a better pattern than callbacks
   * TODO: Hook this into parent element
   */
  _cancelEdits(callback) {
    console.log('DEBUG: _cancelEdits()');
    const resetData = this.state.data.map(row => {
      let newRow = { id: row.id };
      this.props.FIELDS.forEach((field) => {
        newRow[field] = {
          value: row[field].value,
          editValue: row[field].value,
          editing: false
        }
      });
      return newRow;
    });

    if (callback && typeof(callback) === 'function')
      this.setState({ data: resetData }, callback);
    else
      this.setState({ data: resetData });
  }

  /*
   * Add new row handlers
   */

  toggleAddRow(e) {
    e.stopPropagation();
    this.setState({ addRow: !this.state.addRow });
  }

  updateAddRowInput(e) {
    const fieldName = e.currentTarget.name;
    const fieldValue = e.currentTarget.value;
    const newState = Immutable.fromJS(this.state)
      .setIn(['newRow', fieldName], fieldValue);
    this.setState(newState.toJS());
  }

  handleCreateEntity(e) {
    const trimmedSeriesValue = this.state.newRow.series.trim();
    if (e.key === 'Enter' && trimmedSeriesValue !== '') {
      this.createEntity(this.state.newRow);
      this.setState({
        addRow: false,
        newRow: this._NEW_ROW_INITIAL
      });
    }
  }

  /*
   * Update existing row handlers
   */

  editEntity(field, entityId) {
    this._cancelEdits(() => {
      const entityIdx = this.state.data.findIndex(entity =>
        entity.id === entityId
      );
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx, field, 'editing'], true);
      this.setState(newState.toJS());
    });
  }

  updateEntityInput(field, value, entityId) {
    const entityIdx = this.state.data.findIndex(entity =>
      entity.id === entityId
    );
    const newState = Immutable.fromJS(this.state)
      .setIn(['data', entityIdx, field, 'editValue'], value);
    this.setState(newState.toJS());
  }

  handleUpdateEntity(field, value, entityId) {
    let body = {};
    body[field] = value;
    this.updateEntity(entityId, body);
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
      json = transformEditJSON(preprocessJSON(json));
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
      json = transformEditJSON(preprocessJSON(json));
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
    console.log(entity);
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
      json = transformEditJSON(preprocessJSON(json));
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
      return (<td key={field}>{this.props.FIELD_DISPLAY_MAP[field]}</td>);
    });

    const rows = this.state.data.map((row) => {
      const elements = this.props.FIELDS.map((field) => {
        const uniqueKey = `${row.id.toString()}-${field}`
        return (
          <td key={uniqueKey}>
            <EditField field={field} id={row.id}
                       originalValue={row[field].value}
                       editingValue={row[field].editValue}
                       editing={row[field].editing}
                       editField={this.editEntity}
                       updateInput={this.updateEntityInput}
                       saveInput={this.handleUpdateEntity} />
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

    const newRow = this.props.FIELDS.map((field) => {
      return (
        <td key={field}>
          <input className="ovc-edit-field"
                 name={field}
                 value={this.state.newRow[field]}
                 onChange={this.updateAddRowInput}
                 onKeyPress={this.handleCreateEntity} />
        </td>
      );
    });
    const addRow = (
      <td className="add-entity" colSpan={this.props.FIELDS.length}
          onClick={this.toggleAddRow}>
        <i className="ion-plus" />
      </td>
    )

    const footerRow = (
      this.state.addRow
      ? (<tr>{newRow}<td className="remove-entity" /></tr>)
      : (<tr>{addRow}<td className="remove-entity" /></tr>)
    );

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
          {footerRow}
        </tbody>
      </table>
    );
  }
}

export default EditTable;

