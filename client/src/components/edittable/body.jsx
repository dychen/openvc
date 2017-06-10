import React from 'react';
import Immutable from 'immutable';

import {EditField} from '../editfield.jsx';
import {ModalField} from '../modalfield.jsx';

/*
 * props:
 *   sourceData [Array]: [
 *     { sourceKey: [string], sourceDisplay: [string],
 *       value: [string/Object/Number] }, ...
 *   ]
 *   source [string]: Source key of the currently selected source object (e.g.
 *                    'crunchbase', 'self')
 *   onPopoverClick [function]: (Optional) Function to execute when a popover
 *                              element is clicked. Passes value to the parent
 *                              function with the same name.
 *     f([Event: e]) => null
 */
const CellPopover = (props) => {
  const updateData = (e) => {
    if (props.onPopoverClick) {
      const selectedIdx = props.sourceData.findIndex(d =>
        d.sourceKey === e.currentTarget.id
      );
      if (selectedIdx > -1)
        props.onPopoverClick(props.sourceData[selectedIdx].value);
    }
  };
  const getSourceClassName = (sourceObj, sourceValue) => {
    if (sourceObj.sourceKey === props.source)
      return 'ovc-cell-popover-row selected';
    else if (sourceObj.value === sourceValue)
      return 'ovc-cell-popover-row valid';
    else
      return 'ovc-cell-popover-row invalid';
  };

  // Find the value of the currently selected source
  const sourceValueIdx = props.sourceData.findIndex(d =>
    d.sourceKey === props.source
  );
  const sourceValue = props.sourceData[sourceValueIdx].value;
  const sourceData = props.sourceData.map(sourceObj => (
    <div key={sourceObj.sourceKey}
         className={getSourceClassName(sourceObj, sourceValue)}>
      <span className="popover-source">{sourceObj.sourceDisplay}: &nbsp;</span>
      <span className="popover-value"
            id={sourceObj.sourceKey}
            onClick={updateData}>{sourceObj.value}</span>
    </div>
  ));
  return (
    <div className="ovc-cell-popover">
      <div className="ovc-cell-popover-header">{props.field}</div>
      <div className="ovc-cell-popover-body">{sourceData}</div>
    </div>
  );
};

/*
 * props:
 *   sourceData [Array]: [
 *     { sourceKey: [string], sourceDisplay: [string],
 *       value: [string/Object/Number] }, ...
 *   ]
 *   source [string]: Source key of the currently selected source object (e.g.
 *                    'crunchbase', 'self')
 *   onPopoverClick [function]: (Optional) Function to execute when a popover
 *                              element is clicked. Passes value to the parent
 *                              function with the same name.
 *     f([string: field], [???: value]) => null
 */
class CellPopoverContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
    this.showPopover = this.showPopover.bind(this);
    this.hidePopover = this.hidePopover.bind(this);
    this.onPopoverClick = this.onPopoverClick.bind(this);
  }
  showPopover(e) {
    this.setState({ visible: true });
  }
  hidePopover(e) {
    this.setState({ visible: false });
  }
  onPopoverClick(value) {
    if (this.props.onPopoverClick)
      this.props.onPopoverClick(this.props.field, value);
  }
  render() {
    const popover = (
      this.state.visible
      ? <CellPopover field={this.props.field}
                     data={this.props.data}
                     sourceData={this.props.sourceData}
                     source={this.props.source}
                     onPopoverClick={this.onPopoverClick} />
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
 *
 *   source [string]: (Optional) String of the currently selected source key
 *                    (e.g. 'crunchbase', 'self')
 *   sourceData [Object]: (Optional) Row/object mapping to values from
 *                        different data sources.
 *     { field1: [{ sourceKey: [string], sourceDisplay: [string],
 *                  value: [string/Object/Number] }, ...], ... }
 *
 *   onUpdate, onModalUpdate, onDelete: See documentation in EditTable
 *                                      component.
 */
const EditTableRow = (props) => {
  const onPopoverClick = (field, value) => {
    if (props.onUpdate)
      props.onUpdate(field, value, props.row.id);
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
                                sourceData={props.sourceData[field]}
                                source={props.source}
                                onPopoverClick={onPopoverClick}>
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
 *
 *   source [string]: (Optional) String of the currently selected source key
 *                    (e.g. 'crunchbase', 'self')
 *   dataSourceMap [Object]: (Optional) Row/object mapping to values from
 *                           different data sources.
 *     {
 *       objId: { field1: [{ sourceKey: [string], sourceDisplay: [string],
 *                           value: [string/Object/Number] }, ...], ... },
 *       ...
 *     }
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
                      source={this.props.source}
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
