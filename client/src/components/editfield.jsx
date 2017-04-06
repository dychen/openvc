import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import {truncateString} from '../utils/format.js';

import './editfield.scss';

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

    this._PLACEHOLDER = this.props.placeholder || '';

    this.enterEditMode = this.enterEditMode.bind(this);
    this.cancelEditMode = this.cancelEditMode.bind(this);

    this.onUpdate = this.onUpdate.bind(this);
    this.onSave = this.onSave.bind(this);

    // Display filters
    this.filterInputValue = this.createInputFilter(this.props.fieldType);
    this.unfilterInputValue = this.createReverseInputFilter(this.props.fieldType);
    this.filterDisplayValue = this.createDisplayFilter(this.props.fieldType);
    this.unfilterDisplayValue = this.createReverseDisplayFilter(this.props.fieldType);
  }

  enterEditMode(e) {
    e.stopPropagation();
    this.setState({ editing: true });
  }

  cancelEditMode(e) {
    e.stopPropagation();
    this.setState({ editing: false });
  }

  onUpdate(e) {
    const unfilteredValue = this.unfilterInputValue(e.currentTarget.value);
    this.setState({ value: unfilteredValue });

    // Propagate to parent
    if (this.props.onUpdate) {
      this.props.onUpdate(unfilteredValue);
    }
  }

  onSave(e) {
    // Force-convert numbers so all inputs can be trimmed
    const trimmedValue = this.state.value.toString().trim();
    // Only submit if there is text; allow shift+enter to create a new line
    if (e.key === 'Enter' && trimmedValue !== '' && !e.shiftKey) {
      this.cancelEditMode(e);

      // Propagate to parent
      this.props.onSave(this.unfilterDisplayValue(trimmedValue));
    }
  }

  /*
   * Filters:
   *
   * Filter logic
   * 1. Always filter/unfilter numbers (underlying representation should never
   *    see the numeric display format)
   * 2. Only filter/unfilter dates when switching between input/display modes
   *    (only try to convert dates after user is done inputting the date)
   */

  createInputFilter(fieldType) {
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

  createReverseInputFilter(fieldType) {
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

  createDisplayFilter(fieldType) {
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

  createReverseDisplayFilter(fieldType) {
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

  render() {
    let editComponent, fieldFilter;

    if (this.state.editing) {
      switch (this.props.fieldType) {
        case 'text':
        case 'text truncated':
          editComponent = (
            <textarea rows="8"
                      className="ovc-edit-field" autoFocus
                      placeholder={this._PLACEHOLDER}
                      value={this.filterInputValue(this.state.value)}
                      onChange={this.onUpdate}
                      onKeyPress={this.onSave}
                      onBlur={this.cancelEditMode} />
          );
          break;
        default:
          editComponent = (
            <input className="ovc-edit-field" autoFocus
                   placeholder={this._PLACEHOLDER}
                   value={this.filterInputValue(this.state.value)}
                   onChange={this.onUpdate}
                   onKeyPress={this.onSave}
                   onBlur={this.cancelEditMode} />
          );
          break;
      }
    }
    else {
      switch (this.props.fieldType) {
        case 'image':
          editComponent = (
            <img className="ovc-edit-field"
                 onClick={this.enterEditMode}
                 src={this.props.originalValue}>
            </img>
          );
          break;
        case 'text truncated':
          editComponent = (
            <span className="ovc-edit-field"
                  onClick={this.enterEditMode}>
              {this.filterDisplayValue(
                 truncateString(this.props.originalValue
                                ? this.props.originalValue
                                : this._PLACEHOLDER), 30
               )}
            </span>
          );
          break;
        default:
          editComponent = (
            <span className="ovc-edit-field"
                  onClick={this.enterEditMode}>
              {this.filterDisplayValue((this.props.originalValue
                                        ? this.props.originalValue
                                        : this._PLACEHOLDER))}
            </span>
          );
          break;
      }
    }
    return editComponent;
  }
}

/*
 * Same as the BaseEditField component, but wraps the onSave and onUpdate
 * methods in a more flexible API to allow parent components to more easily
 * interact:
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

export {BaseEditField, EditField};

