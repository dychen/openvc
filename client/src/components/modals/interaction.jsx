import React from 'react';
import Immutable from 'immutable';
import moment from 'moment';

import {createEntityModalWrapper} from './create.jsx';

/*
 * props:
 *   data [Object]: Entity object to create or update.
 *   CREATE_HEADLINE [string]: Modal title.
 *
 *   preventModalClose [function]: Function to stop closeModal from triggering.
 *   closeModal [function]: Function to close the modal and reset the state.
 *   updateInput [function]: Function to update user inputs.
 *   createEntity [function]: Function to write new entity to database.
 */
class CreateInteractionModalBase extends React.Component {
  render() {
    const modalShowClass = (
      this.props.visible
      ? 'ovc-modal-background show'
      : 'ovc-modal-background'
    );

    return (
      <div className={modalShowClass} onClick={this.props.closeModal}>
        <div className="ovc-modal create-entity-modal"
             onClick={this.props.preventModalClose}>
          <div className="create-entity-modal-header">
            {this.props.CREATE_HEADLINE}
          </div>
          <div className="create-entity-modal-body">
            <div className="create-entity-input-section">
              <div className="create-entity-input-group">
                <input className="entity-input" name="type"
                       value={this.props.data.type}
                       placeholder="Interaction type (e.g. Meeting)"
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="label"
                       value={this.props.data.label}
                       placeholder="Label (e.g. John/Dan Call)"
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="date"
                       value={this.props.data.date}
                       placeholder="Date (e.g. 2017/1/1)"
                       onChange={this.props.updateInput} />
                <input className="entity-input" name="duration"
                       value={this.props.data.duration}
                       placeholder="Duration (minutes) (e.g. 60)"
                       onChange={this.props.updateInput} />
              </div>
              <div className="create-entity-input-group">
                <textarea className="entity-input" name="notes" rows="8"
                          value={this.props.data.notes}
                          placeholder="Notes"
                          onChange={this.props.updateInput} />
              </div>
            </div>
          </div>
          <div className="create-entity-modal-footer">
            <div className="modal-footer-button left"
                 onClick={this.props.closeModal}>
              <i className="ion-close" />
              <span>Cancel</span>
            </div>
            <div className="modal-footer-button right"
                 onClick={this.props.createEntity}>
              <i className="ion-plus" />
              <span>Create</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const CreateInteractionModal = createEntityModalWrapper(CreateInteractionModalBase, {
  initialState: {
    data: {
      type: '',
      label: '',
      date: moment().format('ll'),
      notes: '',
      duration: ''
    }
  },
  CREATE_HEADLINE: 'Create a new interaction',
});

export default CreateInteractionModal;

