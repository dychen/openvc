import React from 'react';
import numeral from 'numeral';
import moment from 'moment';

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
 *   className [string]: Any additional CSS classes to pass to the component.
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

    this.filterInputValue = this.createFilter(this.props.fieldType);
    this.unfilterInputValue = this.createReverseFilter(this.props.fieldType);
    this.filterDisplayValue = this.createDisplayFilter(this.props.fieldType);
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
    this.props.updateInput(this.props.field, e.currentTarget.value,
                           this.props.id);
  }

  saveInput(e) {
    // Force-convert numbers so all inputs can be trimmed
    const trimmedValue = this.props.editingValue.toString().trim();
    // Only submit if there is text; allow shift+enter to create a new line
    if (e.key === 'Enter' && trimmedValue !== '' && !e.shiftKey) {
      // this.props.id is passed for nested fields but is undefined for others
      this.props.saveInput(this.props.field,
                           this.unfilterInputValue(trimmedValue),
                           this.props.id);
    }
  }

  createFilter(fieldType) {
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

  createReverseFilter(fieldType) {
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

  render() {
    let editComponent, fieldFilter;
    const className = this.props.className || '' + ' ' + 'ovc-edit-field';

    if (this.props.editing) {
      if (this.props.field.includes('notes')) {
        editComponent = (
          <textarea rows="8"
                    className={className} autoFocus
                    placeholder={this.props.placeholder}
                    value={this.filterInputValue(this.props.editingValue)}
                    onChange={this.updateInput}
                    onKeyPress={this.saveInput}
                    onClick={this._stopPropagation} />
        );
      }
      else {
        editComponent = (
          <input className={className} autoFocus
                 placeholder={this.props.placeholder}
                 value={this.filterInputValue(this.props.editingValue)}
                 onChange={this.updateInput}
                 onKeyPress={this.saveInput}
                 onClick={this._stopPropagation} />
        );
      }
    }
    else {
      editComponent = (
        <span className={className}
              onClick={this.editField}>
          {this.filterDisplayValue((this.props.originalValue
                                    ? this.props.originalValue
                                    : this.props.placeholder))}
        </span>
      );
    }
    return editComponent;
  }
}

export default EditField;

