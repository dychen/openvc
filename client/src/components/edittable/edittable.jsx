import React from 'react';
import Immutable from 'immutable';
import {authFetch, handleResponse} from '../../utils/api.js';

import {EditTableHeader} from './header.jsx';
import {EditTableBody} from './body.jsx';

import './edittable.scss';

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

    this.state = {
      /*
       * data: [
       *   { field1: val1, field2: val2, ... },
       *   ...
       * ]
       * sourceData: {
       *   source1: [{ field1: val1, field2: val2, ... }, ...],
       *   source2: [{ field1: val1, field2: val2, ... }, ...],
       *   ...
       * }
       */
      data: [],
      sourceData: {}
    };

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
   * Update existing row handlers
   */

  /*
   * Args:
   *   field [string], value [string]: Field name and value
   *   entityId [string]: Id of the object to be updated
   *   source [string]: (Optional) The source of the data (e.g. 'crunchbase')
   *                    if using the alternate data format
   */
  handleUpdateEntity(field, value, entityId, source) {
    // Optimistic update
    const entityIdx = this.state.data.findIndex(entity =>
      entity.id === entityId
    );

    if (source) {
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx, '_sources', source, field], value);

      // Write to the backend in callback
      this.setState(newState.toJS(), () => {
        let body = { _source: source };
        body[field] = value;
        this.updateEntity(entityId, body);
      });
    }
    else {
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx, field], value);

      // Write to the backend in callback
      this.setState(newState.toJS(), () => {
        let body = {};
        body[field] = value;
        this.updateEntity(entityId, body);
      });
    }
  }

  /*
   * Args:
   *   modelKey [string]: modelKey in the API response (e.g. 'company', 'owner')
   *   obj [Object]: Updated model object
   *   entityId [string]: Row id
   *   source [string]: (Optional) The source of the data (e.g. 'crunchbase')
   *                    if using the alternate data format
   */
  handleUpdateModalEntity(modelKey, obj, entityId, source) {
    // Optimistic update, update all matching entities
    const entityIdx = this.state.data.findIndex(entity =>
      entity.id === entityId
    );

    if (source) {
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx, '_sources', source, modelKey], obj);
      const newRelatedState = newState.update('data', rows => {
          return rows.map(row =>
            ((row.getIn([modelKey, 'id']) === obj.id)
             ? row.setIn(['_sources', source, modelKey], obj) : row)
          );
        });
      this.setState(newRelatedState.toJS());
    }
    else {
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', entityIdx, modelKey], obj);
      const newRelatedState = newState.update('data', rows => {
          return rows.map(row =>
            ((row.getIn([modelKey, 'id']) === obj.id)
             ? row.set(modelKey, obj) : row)
          );
        });
      this.setState(newRelatedState.toJS());
    }
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
        if (json.hasOwnProperty('_sources')) {
          this.setState({
            data: json._sources.self,
            sources: json._sources
          });
        }
        else {
          this.setState({ data: json });
        }
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

  render() {
    return (
      <table className="ovc-edit-table">
        <EditTableHeader FIELDS={this.props.FIELDS}
                         FIELD_MAP={this.props.FIELD_MAP}
                         sortByField={this.sortByField}
                         onHeaderClick={this.props.onHeaderClick} />
        <EditTableBody API_URL={this.props.API_URL}
                       FIELDS={this.props.FIELDS}
                       FIELD_MAP={this.props.FIELD_MAP}
                       MODEL_MAP={this.props.MODEL_MAP}
                       data={this.state.data}
                       onCreate={this.createEntity}
                       onUpdate={this.handleUpdateEntity}
                       onModalUpdate={this.handleUpdateModalEntity}
                       onDelete={this.handleDeleteEntity}
                       filterData={this.props.filterData} />
      </table>
    );
  }
}

export default EditTable;

