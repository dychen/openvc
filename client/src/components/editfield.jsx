import React from 'react';
import numeral from 'numeral';
import moment from 'moment';
import {truncateString} from '../utils/format.js';

import './editfield.scss';

/*
 * props:
 *   field [string]: Name of field being edited (e.g. 'title'), the name of
 *                   the innermost key for nested fields.
 *   fieldType [string]: Field type - determines which filter should be applied
 *                       to the field value (e.g. "money" or "date").
 *   originalValue [string]: Original value of the field being edited.
 *   editingValue [string]: Current value of the field being edited.
 *   editing [boolean]: Whether or not the field is being edited.
 *   id [string]: [Optional] Id of the parent object, used if the object is in
 *                           a list of objects, such as for experience objects.
 *   placeholder [string]: [Optional] String to display if field value is
 *                                    empty.
 *
 *   editField [function]: Function to enter editing mode.
 *     f([field name], [id, optional]) => null
 *   updateInput [function]: Function to update field based on user input.
 *     f([field name], [field value], [id, optional]) => null
 *   saveInput [function]: Function to write updated field to database.
 *     f([field name], [field value], [id, optional]) => null
 */
class EditField extends React.Component {
  constructor(props) {
    super(props);

    this._stopPropagation = this._stopPropagation.bind(this);
    this.editField = this.editField.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.saveInput = this.saveInput.bind(this);

    this.filterInputValue = this.createInputFilter(this.props.fieldType);
    this.unfilterInputValue = this.createReverseInputFilter(this.props.fieldType);
    this.filterDisplayValue = this.createDisplayFilter(this.props.fieldType);
    this.unfilterDisplayValue = this.createReverseDisplayFilter(this.props.fieldType);
  }

  _stopPropagation(e) {
    e.stopPropagation();
  }

  editField(e) {
    e.stopPropagation();
    // this.props.id is passed for nested fields but is undefined for others
    this.props.editField(this.props.field, this.props.id);
  }

  updateInput(e) {
    // this.props.id is passed for nested fields but is undefined for others
    this.props.updateInput(this.props.field,
                           this.unfilterInputValue(e.currentTarget.value),
                           this.props.id);
  }

  saveInput(e) {
    // Force-convert numbers so all inputs can be trimmed
    const trimmedValue = this.props.editingValue.toString().trim();
    // Only submit if there is text; allow shift+enter to create a new line
    if (e.key === 'Enter' && trimmedValue !== '' && !e.shiftKey) {
      // this.props.id is passed for nested fields but is undefined for others
      this.props.saveInput(this.props.field,
                           this.unfilterDisplayValue(trimmedValue),
                           this.props.id);
    }
  }

  /*
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

    if (this.props.editing) {
      switch (this.props.fieldType) {
        case 'text':
        case 'text truncated':
          editComponent = (
            <textarea rows="8"
                      className="ovc-edit-field" autoFocus
                      placeholder={this.props.placeholder}
                      value={this.filterInputValue(this.props.editingValue)}
                      onChange={this.updateInput}
                      onKeyPress={this.saveInput}
                      onClick={this._stopPropagation} />
          );
          break;
        default:
          editComponent = (
            <input className="ovc-edit-field" autoFocus
                   placeholder={this.props.placeholder}
                   value={this.filterInputValue(this.props.editingValue)}
                   onChange={this.updateInput}
                   onKeyPress={this.saveInput}
                   onClick={this._stopPropagation} />
          );
          break;
      }
    }
    else {
      switch (this.props.fieldType) {
        case 'image':
          editComponent = (
            <img className="ovc-edit-field"
                 onClick={this.editField}
                 src={this.props.originalValue}>
            </img>
          );
          break;
        case 'text truncated':
          editComponent = (
            <span className="ovc-edit-field"
                  onClick={this.editField}>
              {this.filterDisplayValue(
                 truncateString(this.props.originalValue
                                ? this.props.originalValue
                                : this.props.placeholder), 30
               )}
            </span>
          );
          break;
        default:
          editComponent = (
            <span className="ovc-edit-field"
                  onClick={this.editField}>
              {this.filterDisplayValue((this.props.originalValue
                                        ? this.props.originalValue
                                        : this.props.placeholder))}
            </span>
          );
          break;
      }
    }
    return editComponent;
  }
}

export default EditField;

