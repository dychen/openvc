import React from 'react';
import Immutable from 'immutable';

import {EditField} from '../editfield.jsx';
import {ModalField} from '../modalfield.jsx';

const EditTableRow = (props) => {
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
  const generateModalFieldCell = (field, row, uniqueKey) => {
    const modelKey = props.FIELD_MAP[field].model;
    const FIELDS = props.MODEL_MAP[modelKey].fields.map(field => field.apiName);
    let FIELD_MAP = {};
    props.MODEL_MAP[modelKey].fields.forEach((field) => {
      FIELD_MAP[field.apiName] = props.FIELD_MAP[field.fieldMapName];
    });
    return (
      <td key={uniqueKey}>
        <ModalField API_URL={props.API_URL} rowId={row.id}
                    modelType={props.MODEL_MAP[modelKey].type}
                    modelKey={modelKey}
                    FIELDS={FIELDS}
                    FIELD_MAP={FIELD_MAP}
                    field={props.FIELD_MAP[field].modelField}
                    data={row[modelKey]}
                    onSave={props.onModalUpdate} />
      </td>
    );
  };

  const elements = props.FIELDS.map((field) => {
    const uniqueKey = `${props.row.id.toString()}-${field}`;
    if (props.FIELD_MAP[field].model
        && props.MODEL_MAP[props.FIELD_MAP[field].model]) {
      return generateModalFieldCell(field, props.row, uniqueKey);
    }
    else {
      return (
        <td key={uniqueKey}>
          <EditField field={field} id={props.row.id}
                     fieldType={props.FIELD_MAP[field].type}
                     originalValue={props.row[field]}
                     onSave={props.onUpdate} />
        </td>
      );
    }
  });
  return (
    <tr key={props.row.id}>
      {elements}
      <td className="remove-entity" id={props.row.id}
          onClick={props.onDelete}>
        <i className="ion-trash-a" />
      </td>
    </tr>
  );
};

const EditTableNewRow = (props) => {
  return (
    <tr>{props.FIELDS.map((field) => {
      return (
        <td key={field}>
          <EditField field={field}
                     fieldType={props.FIELD_MAP[field].type}
                     originalValue={props.row[field]}
                     onSave={props.onSave} />
        </td>
      );
    })}
    <td className="remove-entity" />
    </tr>
  );
};

const EditTableAddRow = (props) => {
  return (
    <tr>
      <td className="add-entity" colSpan={props.FIELDS.length+1}
          onClick={props.onClick}>
        {props.addingRow ? <i className="ion-minus" /> : <i className="ion-plus" />}
      </td>
    </tr>
  );
};

class EditTableBody extends React.Component {
  constructor(props) {
    super(props);

    this._NEW_ROW_INITIAL = {};
    this.props.FIELDS.forEach((field) => {
      this._NEW_ROW_INITIAL[field] = '';
    });

    this.state = {
      addingRow: false,
      newRow: this._NEW_ROW_INITIAL
    };

    // Add new row handlers
    this.toggleAddingRow = this.toggleAddingRow.bind(this);
    this.handleCreateEntity = this.handleCreateEntity.bind(this);
  }

  /*
   * Add new row handlers
   */

  toggleAddingRow(e) {
    e.stopPropagation();
    this.setState({
      addingRow: !this.state.addingRow,
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
        this.props.onCreate(this.state.newRow);
        this.setState({
          addingRow: false,
          newRow: this._NEW_ROW_INITIAL
        });
      }
    });
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
                          ? this.props.filterData(this.props.data)
                          : this.props.data);
    const rows = filteredData.map(row =>
      <EditTableRow key={row.id}
                    FIELDS={this.props.FIELDS}
                    FIELD_MAP={this.props.FIELD_MAP}
                    MODEL_MAP={this.props.MODEL_MAP}
                    API_URL={this.props.API_URL}
                    row={row}
                    onUpdate={this.props.onUpdate}
                    onModalUpdate={this.props.onModalUpdate}
                    onDelete={this.props.onDelete} />
    );

    const newRow = (
      this.state.addingRow
      ? (
        <EditTableNewRow FIELDS={this.props.FIELDS}
                         FIELD_MAP={this.props.FIELD_MAP}
                         row={this.state.newRow}
                         onSave={this.handleCreateEntity} />
      )
      : null
    );

    return (
      <tbody>
        {rows}
        {newRow}
        <EditTableAddRow FIELDS={this.props.FIELDS}
                         onClick={this.toggleAddingRow}
                         addingRow={this.state.addingRow} />
      </tbody>
    );
  }
};

export {EditTableBody};
