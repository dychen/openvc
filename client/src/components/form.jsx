import React from 'react';
import Immutable from 'immutable';

const Scroll = require('react-scroll');
const ScrollElement = Scroll.Element;
const ScrollScroller = Scroll.scroller;

import './form.scss';


class FormField extends React.Component {
  constructor(props) {
    super(props);
    this.focusInput = this.focusInput.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  // This is called for the initial element focus
  componentDidMount() {
    if (this.props.active) {
      this.focusInput();
    }
  }
  // This is called to refocus when the active element changes
  // Use componentDidUpdate instead of componentWillXXX because focusInput()
  // needs to fire after the rerender.
  componentDidUpdate(prevProps, prevState) {
    if (this.props.active) {
      this.focusInput();
    }
  }

  focusInput(e) {
    this.inputField.focus();
  }

  onSelect(e) {
    this.focusInput();
    this.props.setActiveField(this.props.field);
  }

  render() {
    const containerClass = (
      this.props.active ? 'ovc-form-field-bg active' : 'ovc-form-field-bg'
    );
    return (
      <div className={containerClass}
           onClick={this.onSelect}>
        <div className="ovc-form-field">
          <div className="form-field-header">
            {this.props.title}
          </div>
          <input className="form-field-input"
                 ref={input => this.inputField = input}
                 name={this.props.field}
                 value={this.props.value}
                 onChange={this.props.onChange} />
        </div>
      </div>
    );
  }
};

/*
 * props:
 *   FIELDS
 *   containerId [string]: (Optional)
 */
class FormContainer extends React.Component {
  constructor(props) {
    super(props);

    this.INITIAL_FORM_STATE = {};
    props.FIELDS.forEach(field => this.INITIAL_FORM_STATE[field.field] = '');

    this.state = {
      form: this.INITIAL_FORM_STATE,
      activeField: props.FIELDS[0].field
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.setActiveField = this.setActiveField.bind(this);
  }

  onChange(e) {
    let newState = {};
    newState[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ form: newState });
  }

  onKeyPress(e) {
    if (e.key === 'Enter') {
      const fieldIdx = this.props.FIELDS.findIndex(field =>
        field.field === this.state.activeField
      );
      if (!e.shiftKey) {
        if (fieldIdx === this.props.FIELDS.length - 1) {
          // TODO
        }
        else if (fieldIdx < this.props.FIELDS.length - 1) {
          this.setState({ activeField: this.props.FIELDS[fieldIdx+1].field });
          ScrollScroller.scrollTo(this.props.FIELDS[fieldIdx+1].elementId, {
            duration: 500,
            smooth: true,
            containerId: this.props.containerId || 'ovc-form-container'
          });
        }
      }
      else {
        if (fieldIdx > 0) {
          this.setState({ activeField: this.props.FIELDS[fieldIdx-1].field });
          ScrollScroller.scrollTo(this.props.FIELDS[fieldIdx-1].elementId, {
            duration: 500,
            smooth: true,
            containerId: this.props.containerId || 'ovc-form-container'
          });
        }
      }
    }
  }

  setActiveField(field) {
    this.setState({ activeField: field });
  }

  render() {
    const formFields = this.props.FIELDS.map(field => (
      <ScrollElement name={field.elementId} key={field.elementId}
                     className="ovc-form-field-scroll-wrapper">
        <FormField title={field.title}
                   field={field.field}
                   value={this.state.form[field.field]}
                   active={this.state.activeField === field.field}
                   setActiveField={this.setActiveField}
                   onChange={this.onChange} />
      </ScrollElement>
    ));
    return (
      <div id={this.props.containerId || 'ovc-form-container'}
           className="ovc-form-container"
           onKeyPress={this.onKeyPress} >
        {formFields}
      </div>
    );
  }
}

export {FormField, FormContainer};

