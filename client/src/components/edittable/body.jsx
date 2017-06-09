import React from 'react';
import Immutable from 'immutable';

import {EditField} from '../editfield.jsx';
import {ModalField} from '../modalfield.jsx';

const CellPopover = (props) => {
  const sourceData = Object.keys(props.sourceData).map(source => (
    <div key={source}>{source}: {props.sourceData[source]}</div>
  ));
  return (
    <div className="ovc-cell-popover">
      <div className="ovc-cell-popover-header">{props.field}</div>
      <div className="ovc-cell-popover-body">{sourceData}</div>
    </div>
  );
};

class CellPopoverContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
    this.showPopover = this.showPopover.bind(this);
    this.hidePopover = this.hidePopover.bind(this);
  }
  showPopover(e) {
    this.setState({ visible: true });
  }
  hidePopover(e) {
    this.setState({ visible: false });
  }
  render() {
    const popover = (
      this.state.visible
      ? <CellPopover field={this.props.field}
                     data={this.props.data}
                     sourceData={this.props.sourceData} />
      : ''
    );
    return (
      <div className="ovc-cell-popover-container"
           onMouseEnter={this.showPopover}
           onMouseLeave={this.hidePopover}>
        {this.props.children}
        {popover}
      </div>
    );
  }
}

/*
 * props:
 *   API_URL, FIELDS, FIELD_MAP, MODEL_MAP: See documentation in EditTable
 *                                          component.
 *   row [Array]: List of objects to display: [{ field1: val1, ... }, ...]
 *   sourceData [Object]: (Optional) Row/object mapping to values from
 *                        different data sources.
 *     { field1: { source1: val1, source2: val2, ... }, ... }
 *
 *   onUpdate, onModalUpdate, onDelete: See documentation in EditTable
 *                                      component.
 */
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
    else if (props.sourceData) {
      return (
        <td key={uniqueKey}>
          <CellPopoverContainer field={field}
                                data={props.row[field]}
                                sourceData={props.sourceData[field]}>
            <EditField field={field} id={props.row.id}
                       fieldType={props.FIELD_MAP[field].type}
                       originalValue={props.row[field]}
                       onSave={props.onUpdate} />
          </CellPopoverContainer>
        </td>
      );
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

/*
 * props:
 *   API_URL, FIELDS, FIELD_MAP, MODEL_MAP: See documentation in EditTable
 *                                          component.
 *   data [Array]: List of objects to display: [{ field1: val1, ... }, ...]
 *   dataSourceMap [Object]: (Optional) Row/object mapping to values from
 *                           different data sources.
 *     { objId: { field1: { source1: val1, source2: val2, ... }, ... }, }
 *
 *   onCreate, onUpdate, onModalUpdate, onDelete: See documentation in
 *                                                EditTable component.
 *   filterData [function]: (Optional) Function that filters the table dataset.
 *     f([Array]) => [Array]
 */
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
    const rows = filteredData.map(row => {
      const sourceData = (this.props.dataSourceMap
                          ? this.props.dataSourceMap[row.id] : undefined);
      return (
        <EditTableRow key={row.id}
                      FIELDS={this.props.FIELDS}
                      FIELD_MAP={this.props.FIELD_MAP}
                      MODEL_MAP={this.props.MODEL_MAP}
                      API_URL={this.props.API_URL}
                      row={row}
                      sourceData={sourceData}
                      onUpdate={this.props.onUpdate}
                      onModalUpdate={this.props.onModalUpdate}
                      onDelete={this.props.onDelete} />
      );
    });

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
