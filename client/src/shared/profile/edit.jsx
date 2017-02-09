import React from 'react';

import './edit.scss';

/*
 * props:
 *   field [string]: Name of field being edited (e.g. 'title'), the name of
 *                   the innermost key for nested fields.
 *   value [string]: Value of the field being edited (e.g. 'Google').
 *   id [string]: [Optional] Id of the parent object, used if the object is in
 *                           a list of objects, such as for experience objects.
 *   editing [Object]: { editing: [boolean], value: [string] }
 *   placeholder [string]: String to display if field value is empty.
 *   className [string]: Any additional CSS classes to pass to the component.
 *
 *   editField [function]: Function to enter editing mode.
 *   updateInput [function]: Function to update field based on user input.
 *   saveInput [function]: Function to write updated field to database.
 */
class EditField extends React.Component {
  constructor(props) {
    super(props);

    this._stopPropagation = this._stopPropagation.bind(this);
    this.editField = this.editField.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.saveInput = this.saveInput.bind(this);
  }

  _stopPropagation(e) {
    e.stopPropagation();
  }

  editField(e) {
    e.stopPropagation();
    // this.props.id is passed for experience fields but is undefined for
    // profile fields
    this.props.editField(this.props.field, this.props.id);
  }

  updateInput(e) {
    // this.props.id is passed for experience fields but is undefined for
    // profile fields
    this.props.updateInput(this.props.field, e.currentTarget.value,
                           this.props.id);
  }

  saveInput(e) {
    const trimmedValue = this.props.editing.value.trim();
    // Only submit if there is text; allow shift+enter to create a new line
    if (e.key === 'Enter' && trimmedValue !== '' && !e.shiftKey) {
      // this.props.id is passed for experience fields but is undefined for
      // profile fields
      this.props.saveInput(this.props.field, trimmedValue, this.props.id);
    }
  }

  render() {
    let editComponent;
    const className = this.props.className + ' ' + 'info-edit';
    if (this.props.editing && this.props.editing.editing) {
      if (this.props.field.includes('notes')) {
        editComponent = (
          <textarea rows="8"
                    className={className}
                    placeholder={this.props.placeholder}
                    value={this.props.editing.value}
                    onChange={this.updateInput}
                    onKeyPress={this.saveInput}
                    onClick={this._stopPropagation} />
        );
      }
      else {
        editComponent = (
          <input className={className}
                 placeholder={this.props.placeholder}
                 value={this.props.editing.value}
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
          {this.props.value ? this.props.value : this.props.placeholder}
        </span>
      );
    }
    return editComponent;
  }
}

export default EditField;

