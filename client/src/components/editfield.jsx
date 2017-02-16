import React from 'react';

import './editfield.scss';

/*
 * props:
 *   field [string]: Name of field being edited (e.g. 'title'), the name of
 *                   the innermost key for nested fields.
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
    const trimmedValue = this.props.editingValue.trim();
    // Only submit if there is text; allow shift+enter to create a new line
    if (e.key === 'Enter' && trimmedValue !== '' && !e.shiftKey) {
      // this.props.id is passed for nested fields but is undefined for others
      this.props.saveInput(this.props.field, trimmedValue, this.props.id);
    }
  }

  render() {
    let editComponent;
    const className = this.props.className || '' + ' ' + 'ovc-edit-field';
    if (this.props.editing) {
      if (this.props.field.includes('notes')) {
        editComponent = (
          <textarea rows="8"
                    className={className} autoFocus
                    placeholder={this.props.placeholder}
                    value={this.props.editingValue}
                    onChange={this.updateInput}
                    onKeyPress={this.saveInput}
                    onClick={this._stopPropagation} />
        );
      }
      else {
        editComponent = (
          <input className={className} autoFocus
                 placeholder={this.props.placeholder}
                 value={this.props.editingValue}
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
          {this.props.originalValue ? this.props.originalValue
                                    : this.props.placeholder}
        </span>
      );
    }
    return editComponent;
  }
}

export default EditField;

