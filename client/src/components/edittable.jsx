import React from 'react';
import Immutable from 'immutable';
import {authFetch, handleResponse} from '../utils/api.js';

import {EditField} from './editfield.jsx';
import {ModalField} from './modalfield.jsx';
import {DATA_TYPE_MAP} from '../utils/constants.js';

import './edittable.scss';

/*
 * props:
 *   FIELDS [Array]: List of API fields to show as table columns.
 *   FIELD_MAP [Object]: Object that maps fields to their metadata:
 *   {
 *     [field name]: { display: [string], model: [string],
 *                     modelField: [string], required: [boolean],
 *                     type: [string] }
 *   }
 *
 *   sortByField [function]: Function that sorts the data by field name.
 *   onHeaderClick [function]: (Optional) Function that runs when a header cell
 *                             is clicked.
 *     f([Event object]) => CustomField object { displayName: [string], ... }
 */
class EditTableHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSort: {
        field: '',
        direction: ''
      }
    };

    this.onSortAscClick = this.onSortAscClick.bind(this);
    this.onSortDescClick = this.onSortDescClick.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
  }

  onSortAscClick(e) {
    e.stopPropagation();
    const fieldName = e.currentTarget.id;

    this.props.sortByField(fieldName, 'asc', this.props.FIELD_MAP[fieldName]);
    this.setState({ activeSort: { field: fieldName, direction: 'asc' }});
  }

  onSortDescClick(e) {
    e.stopPropagation();
    const fieldName = e.currentTarget.id;

    this.props.sortByField(fieldName, 'desc', this.props.FIELD_MAP[fieldName]);
    this.setState({ activeSort: { field: fieldName, direction: 'desc' }});
  }

  onHeaderClick(e) {
    if (this.props.onHeaderClick) {
      const activeField = this.props.FIELDS[e.currentTarget.id];
      // activeField is undefined in the remove-entity onClick handler
      this.props.onHeaderClick(activeField);
    }
  }

  render() {
    const className = this.onHeaderClick ? 'clickable' : '';
    const headers = this.props.FIELDS.map(field => {
      const sortAscClass = (this.state.activeSort.field === field
                            && this.state.activeSort.direction === 'asc'
                            ? 'active' : '');
      const sortDescClass = (this.state.activeSort.field === field
                             && this.state.activeSort.direction === 'desc'
                             ? 'active' : '');
      return (
        <td key={field} id={field} className={className}
            onClick={this.onHeaderClick}>
          {this.props.FIELD_MAP[field].display}
          <div className="subtext">
            {DATA_TYPE_MAP[this.props.FIELD_MAP[field].type]}
          </div>
          <i className={`ion-arrow-up-b sort-table sort-asc ${sortAscClass}`}
             id={field} onClick={this.onSortAscClick} />
          <i className={`ion-arrow-down-b sort-table sort-desc ${sortDescClass}`}
             id={field} onClick={this.onSortDescClick} />
        </td>
      );
    });

    return (
      <thead>
        <tr>
          {headers}
          <td className={`remove-entity ${className}`} onClick={this.onHeaderClick}>
            <i className="ion-plus" />
          </td>
        </tr>
      </thead>
    );
  }
}

/*
 * props:
 *   API_URL [string]: Backend API endpoint to hit.
 *   FIELDS [Array]: List of API fields to show as table columns.
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
 *   MODEL_MAP [Object]: Mapping between table field names and model properties
 *                       if part of a related object.
 *   {
 *     [fieldName]: {
 *       type: [string]  // Model type ('company', 'person')
 *       group: [string] // Model name in API data, e.g. 'owner', 'company'
 *       field: [string] // Field name in API data, e.g. 'firstName', 'sector'
 *     }
 *   }
 *
 *   Field type is one of: 'string', 'number', 'money', 'date', 'image', 'text'
 *
 *   filterData [function]: (Optional) Function that filters the table dataset.
 *     f([Array]) => [Array]
 *   onHeaderClick [function]: (Optional) Function that runs when a header cell
 *                             is clicked.
 *     f([Event object]) => CustomField object { displayName: [string], ... }
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
    this.handleUpdateModalEntity = this.handleUpdateModalEntity.bind(this);
    this.handleDeleteEntity = this.handleDeleteEntity.bind(this);

    // Entity API
    this.getEntityList = this.getEntityList.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);

    // Transform the data
    this.sortByField = this.sortByField.bind(this);

    // Helpers
    this._generateModalFieldCell = this._generateModalFieldCell.bind(this);

    this.getEntityList();
  }

  // React docs suggest this is a good place to do network requests:
  //   https://facebook.github.io/react/docs/react-component.html
  //     #componentdidupdate
  // Only call the endpoint after the props are updated, not before.
  componentDidUpdate(prevProps, prevState) {
    if (this.props.API_URL !== prevProps.API_URL) {
      // Reload the table every time the API endpoint changes
      this.getEntityList();
    }
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

  /*
   * modelKey [string]: modelKey in the API response (e.g. 'company', 'owner')
   * obj [Object]: Updated model object
   * entityId [string]: Row id
   */
  handleUpdateModalEntity(modelKey, obj, entityId) {
    // Optimistic update, update all matching entities
    const entityIdx = this.state.data.findIndex(entity =>
      entity.id === entityId
    );
    const newState = Immutable.fromJS(this.state)
      .setIn(['data', entityIdx, modelKey], obj);
    /* TODO: Update all other objects in the list with the same nested id
    const newState = Immutable.fromJS(this.state)
      .update('data', (row) => {
        console.log(row, row[modelKey]);
        if (row[modelKey].id === obj.id) {
          row[modelKey] = obj;
        }
        return row
      });
    */
    this.setState(newState.toJS());
  }

  handleDeleteEntity(e) {
    this.deleteEntity(e.currentTarget.id);
  }

  /*
   * Entity API
   */

  getEntityList() {
    authFetch(this.props.API_URL)
      .then(handleResponse)
      .then(json => {
        // Success
        console.log('Table data', json);
        this.setState({ data: json });
      });
  }

  createEntity(entity) {
    authFetch(this.props.API_URL, {
      method: 'POST',
      body: JSON.stringify(entity)
    })
    .then(handleResponse)
    .then(json => {
      const newState = Immutable.fromJS(this.state)
        .update('data', data => data.push(json));
      this.setState(newState.toJS());
    });
  }

  updateEntity(entityId, entity) {
    authFetch(`${this.props.API_URL}/${entityId}`, {
      method: 'POST',
      body: JSON.stringify(entity)
    })
    .then(handleResponse)
    .then(json => {
      const entityIdx = this.state.data.findIndex(entity =>
        entity.id === json.id
      );
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx], json);
      this.setState(newState.toJS());
    });
  }

  deleteEntity(entityId) {
    authFetch(`${this.props.API_URL}/${entityId}`, {
      method: 'DELETE'
    })
    .then(handleResponse)
    .then(json => {
      // Success
      const deletedId = json.id;
      const newEntities = this.state.data.filter(entity =>
        entity.id !== deletedId
      );
      const newState = Immutable.fromJS(this.state)
        .set('data', newEntities);
      this.setState(newState.toJS());
    });
  }

  /*
   * Args:
   *   field [string/Array]: Field name (e.g. 'stage', 'date', 'name') or list
   *                         of names for a nested lookup.
   *   direction [string]: Either 'asc' or 'desc' - the sort direction.
   *   fieldData [Object]: (Optional) Hash of field attributes, including model
   *                                  and modelField.
   */
  sortByField(field, direction, fieldData) {
    const getField = (obj, field) => {
      if (fieldData && fieldData.model && fieldData.modelField) {
        return obj.getIn([fieldData.model, fieldData.modelField]) || '';
      }
      return obj.get(field) || '';
    }

    direction = direction || 'asc'; // Default sort direction is ascending
    // TODO: Different sorts by type
    const oldState = Immutable.fromJS(this.state.data);
    if (direction === 'desc') {
      const newState = oldState.sort((a, b) =>
        getField(b, field).localeCompare(getField(a, field))
      );
      this.setState({ data: newState.toJS() });
    }
    else {
      const newState = oldState.sort((a, b) =>
        getField(a, field).localeCompare(getField(b, field))
      );
      this.setState({ data: newState.toJS() });
    }
  }

  /*
   * Args:
   *   field [string]: Field name (e.g. 'stage', 'date', 'name').
   *   row [Array]: Row data.
   *   uniqueKey [string]: Unique identifier for the cell.
   *
   * Generated objects using this.props.FIELD_MAP and this.props.MODEL_MAP:
   *   FIELDS [Array]: [[external name 1], [external name 2], ...]
   *   FIELD_MAP [Object]: {
   *     [external name 1]: { display: [string], type: [string], ... },
   *     ...
   *   }
   */
  _generateModalFieldCell(field, row, uniqueKey) {
    const modelKey = this.props.FIELD_MAP[field].model;
    const FIELDS = this.props.MODEL_MAP[modelKey].fields.map((field) =>
      field.apiName
    );
    let FIELD_MAP = {};
    this.props.MODEL_MAP[modelKey].fields.forEach((field) => {
      FIELD_MAP[field.apiName] = this.props.FIELD_MAP[field.fieldMapName];
    });
    return (
      <td key={uniqueKey}>
        <ModalField API_URL={this.props.API_URL} rowId={row.id}
                    modelType={this.props.MODEL_MAP[modelKey].type}
                    modelKey={modelKey}
                    FIELDS={FIELDS}
                    FIELD_MAP={FIELD_MAP}
                    field={this.props.FIELD_MAP[field].modelField}
                    data={row[modelKey]}
                    onSave={this.handleUpdateModalEntity} />
      </td>
    );
  }

  /*
   * EditField row format:
   *   { [field name]: [field value] }
   * E.g.:
   *   { segment: 'Enterprise', ... }
   *
   * ModalField row format:
   *   { [model group name]: { [field name]: [field value] }
   * E.g.:
   *   { owner: { id: 123, firstName: 'John', ... } }
   */
  render() {
    const filteredData = (this.props.filterData
                          ? this.props.filterData(this.state.data)
                          : this.state.data);
    const rows = filteredData.map((row) => {
      const elements = this.props.FIELDS.map((field) => {
        const uniqueKey = `${row.id.toString()}-${field}`;
        if (this.props.FIELD_MAP[field].model
            && this.props.MODEL_MAP[this.props.FIELD_MAP[field].model]) {
          return this._generateModalFieldCell(field, row, uniqueKey);
        }
        else {
          return (
            <td key={uniqueKey}>
              <EditField field={field} id={row.id}
                         fieldType={this.props.FIELD_MAP[field].type}
                         originalValue={row[field]}
                         onSave={this.handleUpdateEntity} />
            </td>
          );
        }
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
    );

    return (
      <table className="ovc-edit-table">
        <EditTableHeader FIELDS={this.props.FIELDS}
                         FIELD_MAP={this.props.FIELD_MAP}
                         sortByField={this.sortByField}
                         onHeaderClick={this.props.onHeaderClick} />
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

