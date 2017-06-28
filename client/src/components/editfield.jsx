import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import 'react-dates/lib/css/_datepicker.css';
import {SingleDatePicker} from 'react-dates';
import onClickOutside from 'react-onclickoutside';

import {truncateString} from '../utils/format.js';

import './editfield.scss';

/*
 * Input/Output filters
 *
 * All functions have the following signature:
 *   f([string: field type]) => [function: function that converts an input]
 *   The output function has the signature:
 *     f([string: initial value]) => [string: filtered value]
 *
 * Filter logic
 * 1. Always filter/unfilter numbers (underlying representation should never
 *    see the numeric display format)
 * 2. Only filter/unfilter dates when switching between input/display modes
 *    (only try to convert dates after user is done inputting the date)
 */
const createInputFilter = function(fieldType) {
  switch (fieldType) {
    case 'money':
      numeral.zeroFormat('-');
      return ((value) => numeral(value).format('($0,0)'));
    case 'date':
      return ((value) => value);
    // #nofilter
    default:
      return ((value) => value);
  }
}

const createReverseInputFilter = function(fieldType) {
  switch (fieldType) {
    case 'money':
      return ((value) => numeral(value).value());
    case 'date':
      return ((value) => value);
    // #nofilter
    default:
      return ((value) => value);
  }
}

const createDisplayFilter = function(fieldType) {
  switch (fieldType) {
    case 'money':
      numeral.zeroFormat('-');
      return ((value) => numeral(value).format('($0,0)'));
    case 'date':
      return ((value) => {
        const momentValue = moment(value);
        if (value && momentValue.isValid())
          return value ? moment(value).format('ll') : '';
        else
          return value; // Allow null/empty values and placeholder values
      });
    // #nofilter
    default:
      return ((value) => value);
  }
}

const createReverseDisplayFilter = function(fieldType) {
  switch (fieldType) {
    case 'money':
      return ((value) => numeral(value).value());
    case 'date':
      return ((value) => moment(value)); // Ensure it's a date
    // #nofilter
    default:
      return ((value) => value);
  }
}

/*
 * props:
 *   fieldType [string]: Type of the underlying data (e.g. 'string', 'image')
 *   placeholder [string]: Value of show if the data is empty
 *   value [string]: Underlying data
 *
 *   onUpdate [function]: Action when the data is changed
 *     f([string: value]) => null
 *   onSave [function]: Action when the enter key is pressed
 *     f([string: value]) => null
 *   cancelEditMode [function]: Action when the input is blurred
 *     f([Object: Event]) => null
 */
const InputField = (props) => {
  const filterInputValue = createInputFilter(props.fieldType);

  const onUpdate = (e) => {
    props.onUpdate(e.currentTarget.value);
  };
  const onSave = (e) => {
    // Force-convert numbers so all inputs can be trimmed
    const trimmedValue = e.currentTarget.value.toString().trim();
    // Only submit if there is text; allow shift+enter to create a new line
    if (e.key === 'Enter' && trimmedValue !== '' && !e.shiftKey) {
      props.onSave(trimmedValue);
    }
  };
  const datePickerOnSave = (dateObj) => {
    props.onSave(dateObj);
  };
  const datePickerOnBlur = (focusedObj) => {
    if (!focusedObj.focused)
      props.cancelEditMode();
  };

  switch (props.fieldType) {
    case 'text':
    case 'text truncated':
      return (
        <textarea rows="8" className="ovc-edit-field" autoFocus
                  placeholder={props.placeholder}
                  value={filterInputValue(props.value)}
                  onChange={onUpdate}
                  onKeyPress={onSave}
                  onBlur={props.cancelEditMode} />
      );
    case 'date':
      return (
        <SingleDatePicker date={props.value}
                          onDateChange={datePickerOnSave}
                          focused={true}
                          onFocusChange={datePickerOnBlur}
                          numberOfMonths={1}
                          hideKeyboardShortcutsPanel={true}
                          enableOutsideDays={true}
                          isOutsideRange={() => false } />
      );
    default:
      return (
        <input className="ovc-edit-field" autoFocus
               placeholder={props.placeholder}
               value={filterInputValue(props.value)}
               onChange={onUpdate}
               onKeyPress={onSave}
               onBlur={props.cancelEditMode} />
      );
  }
}

/*
 * props:
 *   fieldType [string]: Type of the underlying data (e.g. 'string', 'image')
 *   placeholder [string]: Value of show if the data is empty
 *   originalValue [string]: Underlying data
 *
 *   enterEditMode [function]: [Optional] Action when the element is clicked
 *     f([Object: Event]) => null
 */
class StaticField extends React.Component {
  constructor(props) {
    super(props);

    this.enterEditMode = this.enterEditMode.bind(this);
    // Display filters
    this.filterDisplayValue = createDisplayFilter(this.props.fieldType);
  }

  enterEditMode(e) {
    // Optional - do nothing if this is undefined
    if (this.props.enterEditMode)
      this.props.enterEditMode(e);
  }

  render() {
    switch (this.props.fieldType) {
      case 'image':
        return (
          <img className="ovc-edit-field"
               onClick={this.enterEditMode}
               src={this.props.originalValue}>
          </img>
        );
      case 'text truncated':
        return (
          <span className="ovc-edit-field"
                onClick={this.enterEditMode}>
            {this.filterDisplayValue(
               truncateString(this.props.originalValue
                              ? this.props.originalValue
                              : this.props.placeholder), 30
             )}
          </span>
        );
      default:
        return (
          <span className="ovc-edit-field"
                onClick={this.enterEditMode}>
            {this.filterDisplayValue((this.props.originalValue
                                      ? this.props.originalValue
                                      : this.props.placeholder))}
          </span>
        );
    }
  }
}

/*
 * Abstraction:
 *   <DropdownField>
 *     <DropdownButton /> // If field is in edit mode
 *     <StaticField />    // If field is not in edit mode
 *   </DropdownField>
 */

/*
 * buttonId [string]: Id of the dropdown button (most of the time, should be
 *                    the field id.
 * title [string]: Default dropdown display.
 * options [Array]: List of [{ key: [string], display: [string] }, ...] options
 *                  to choose from.
 * onSelect [function]: Function to call when an option is selected.
 * onCancel [function]: [Optional] Function to call when the menu is exited.
 */
const WrappedDropdownButton = onClickOutside(
  class extends React.Component {
    handleClickOutside(e) {
      if (this.props.onCancel)
        this.props.onCancel(e);
    }
    render() {
      const menuItems = this.props.options.map(option => {
        // Check type rather than checking object keys b/c key values can be
        // falsy (e.g. empty string).
        if (typeof option === 'object') {
          return (
            <MenuItem key={option.key} eventKey={option.key}
                      onSelect={this.props.onSelect}>
              {option.display}
            </MenuItem>
          );
        }
        else {
          return (
            <MenuItem key={option} eventKey={option}
                      onSelect={this.props.onSelect}>
              {option}
            </MenuItem>
          );
        }
      });
      return (
        <DropdownButton id={this.props.buttonId}
                        title={this.props.title}>
          {menuItems}
        </DropdownButton>
      );
    }
  }
);

/*
 * props:
 *   elementId [string]: HTML DOM id attribute.
 *   originalValue [string]: Initial value of the field.
 *   placeholder [string]: [Optional] String to display if field value is
 *                                    empty. This should be immutable.
 *   options [Array]: List of options in one of two formats:
 *     ['Option1', 'Option2', ...] or
 *     [{ key: 'option1', display: 'Option1' }, ...]
 *     Where 'display' is what is shown in the UI and key is what is returned
 *     to the onSelect handler.
 *
 *   onSelect [function]: Function to execute when an option is selected.
 *     f([string: field value]) => null
 */
class BaseDropdownField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      value: this.props.originalValue || ''
    };

    // StaticField method
    this.enterEditMode = this.enterEditMode.bind(this);

    // DropdownButton methods
    this.cancelEditMode = this.cancelEditMode.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // TODO: See if this impacts performance
    this.setState({ value: nextProps.originalValue || '' });
  }

  enterEditMode(e) {
    if (e && e.stopPropagation)
      e.stopPropagation();
    this.setState({ editing: true });
  }

  cancelEditMode(e) {
    if (e && e.stopPropagation)
      e.stopPropagation();
    this.setState({ editing: false });
  }

  onSelect(eventKey, e) {
    this.props.onSelect(eventKey);
    this.cancelEditMode(e);
  }

  render() {
    let editComponent;

    if (this.state.editing) {
      editComponent = (
        <div className="ovc-edit-field-dropdown">
          <WrappedDropdownButton options={this.props.options}
                                 buttonId={this.props.elementId}
                                 title={this.props.originalValue}
                                 onSelect={this.onSelect}
                                 onCancel={this.cancelEditMode} />
        </div>
      );
    }
    else {
      editComponent = (
        <StaticField fieldType="string"
                     placeholder={this.props.placeholder || ''}
                     originalValue={this.props.originalValue}
                     enterEditMode={this.enterEditMode} />
      );
    }
    return editComponent;
  }
}

/*
 * Same as the BaseDropdownField component, but wraps the onSelect method in a
 * more flexible API to allow parent components (e.g. EditTable) to more easily
 * interact:
 *   onSelect [function]: f([string: field name], [string: field value],
 *                          [string: object id]) => null
 *
 * Adds the following props to the DropdownField component:
 *   field [string]: Field name that's being edited.
 *   id [string]: [Optional] Id of the object that's being updated. Undefined
 *                for new row table cells that create new objects.
 *
 * Inherited props:
 *   elementId [string]: HTML DOM id attribute.
 *   originalValue [string]: Initial value of the field.
 *   placeholder [string]: [Optional] String to display if field value is
 *                                    empty. This should be immutable.
 *
 *   onSelect [function]: Function to execute when an option is selected.
 *     f([string: field value]) => null
 */
class DropdownField extends React.Component {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(value) {
    this.props.onSelect(this.props.field, value, this.props.id);
  }

  render() {
    // Override onSave and onUpdate with wrapped method.
    return (
      <BaseDropdownField {...this.props}
                         onSelect={this.onSelect} />
    );
  }
}

/*
 * Abstraction:
 *   <EditField>
 *     <InputField />  // If field is in edit mode
 *     <StaticField /> // If field is not in edit mode
 *   </EditField>
 */

/*
 * props:
 *   fieldType [string]: Type of the underlying value. Determines which filter
 *                       should be applied. This should be immutable. Options:
 *                       'string', 'number', 'money', 'date', 'image', 'text',
 *                       'model'
 *   originalValue [string]: Initial value of the field.
 *   placeholder [string]: [Optional] String to display if field value is
 *                                    empty. This should be immutable.
 *
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([string: field value]) => null
 *   onUpdate [function]: [Optional] Function that lets the parent component
 *                        respond to changes in the underlying data.
 *     f([string: field value]) => null
 */
class BaseEditField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      value: this.props.originalValue || ''
    };

    // StaticField method
    this.enterEditMode = this.enterEditMode.bind(this);

    // InputField methods
    this.cancelEditMode = this.cancelEditMode.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onSave = this.onSave.bind(this);

    // Filters
    this.unfilterInputValue = createReverseInputFilter(this.props.fieldType);
    this.unfilterDisplayValue = createReverseDisplayFilter(this.props.fieldType);
  }

  componentWillReceiveProps(nextProps) {
    // TODO: See if this impacts performance
    this.setState({ value: nextProps.originalValue || '' });
  }

  enterEditMode(e) {
    if (e && e.stopPropagation)
      e.stopPropagation();
    this.setState({ editing: true });
  }

  cancelEditMode(e) {
    if (e && e.stopPropagation)
      e.stopPropagation();
    this.setState({ editing: false });
  }

  onUpdate(value) {
    const unfilteredValue = this.unfilterInputValue(value);
    this.setState({ value: unfilteredValue });

    // Propagate to parent
    if (this.props.onUpdate) {
      this.props.onUpdate(unfilteredValue);
    }
  }

  onSave(value) {
    this.cancelEditMode();
    // Propagate to parent
    this.props.onSave(this.unfilterDisplayValue(value));
  }

  render() {
    let editComponent;

    if (this.state.editing) {
      editComponent = (
        <InputField fieldType={this.props.fieldType}
                    placeholder={this.props.placeholder || ''}
                    value={this.state.value}
                    onUpdate={this.onUpdate}
                    onSave={this.onSave}
                    cancelEditMode={this.cancelEditMode} />
      );
    }
    else {
      editComponent = (
        <StaticField fieldType={this.props.fieldType}
                     placeholder={this.props.placeholder || ''}
                     originalValue={this.props.originalValue}
                     enterEditMode={this.enterEditMode} />
      );
    }
    return editComponent;
  }
}

/*
 * Same as the BaseEditField component, but wraps the onSave and onUpdate
 * methods in a more flexible API to allow parent components (e.g. EditTable)
 * to more easily interact:
 *   onSave [function]: f([string: field name], [string: field value],
 *                        [string: object id]) => null
 *   onUpdate [function]: f([string: field name], [string: field value],
 *                          [string: object id]) => null
 *
 * Adds the following props to the EditField component:
 *   field [string]: Field name that's being edited.
 *   id [string]: [Optional] Id of the object that's being updated. Undefined
 *                for new row table cells that create new objects.
 *
 * Inherited props:
 *   fieldType [string]: Type of the underlying value. Determines which filter
 *                       should be applied. This should be immutable. Options:
 *                       'string', 'number', 'money', 'date', 'image', 'text',
 *                       'model'
 *   originalValue [string]: Initial value of the field.
 *   placeholder [string]: [Optional] String to display if field value is
 *                                    empty. This should be immutable.
 *
 *   onSave [function]: Function that lets the parent component respond to
 *                      "save" events in the data.
 *     f([string: field value]) => null
 *   onUpdate [function]: [Optional] Function that lets the parent component
 *                        respond to changes in the underlying data.
 *     f([string: field value]) => null
 */
class EditField extends React.Component {
  constructor(props) {
    super(props);

    this.onSave = this.onSave.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
  }

  onSave(value) {
    this.props.onSave(this.props.field, value, this.props.id);
  }

  onUpdate(value) {
    if (this.props.onUpdate)
      this.props.onUpdate(this.props.field, value, this.props.id);
  }

  render() {
    // Override onSave and onUpdate with wrapped method.
    return (
      <BaseEditField {...this.props}
                     onSave={this.onSave}
                     onUpdate={this.onUpdate} />
    );
  }
}

export {BaseEditField, EditField, BaseDropdownField, DropdownField, InputField,
        StaticField};

