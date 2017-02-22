import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import './create.scss';

const createEntityModalWrapper = function(WrappedComponent, config) {
  /*
   * props:
   *   visible [boolean]: Whether or not to show the modal.
   *
   *   hideModal [function]: Function to hide the modal.
   *   createEntity [function]: Function to write new entity to database.
   *   updateEntity [function]: Function to update existing entity in database.
   */
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = config.initialState;

      this.preventModalClose = this.preventModalClose.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.updateInput = this.updateInput.bind(this);
      this.createEntity = this.createEntity.bind(this);
      this.updateEntity = this.updateEntity.bind(this);
      this.matchEntity = this.matchEntity.bind(this);
    }

    preventModalClose(e) {
      e.stopPropagation();
    }

    closeModal() {
      this.setState(config.initialState, () => { this.props.hideModal(); });
    }

    updateInput(e) {
      const newState = Immutable.fromJS(this.state)
        .setIn(['data', e.currentTarget.name], e.currentTarget.value);
      this.setState(newState.toJS());
    }

    createEntity(e) {
      this.props.createEntity(this.state.data);
      this.closeModal();
    }

    updateEntity(e) {
      // this.props.updateEntity should close the modal
      const matchIdx = this.state.matches.findIndex((match) =>
        match.id === Number(e.currentTarget.id)
      );
      const match = this.state.matches[matchIdx];

      this.props.updateEntity(match.id, match);
      this.closeModal();
    }

    matchEntity(e) {
      if (config.matchCondition(this.state.data)) {
        authFetch(config.matchUrl, {
          params: this.state.data
        })
        .then(function(response) {
          if (response.ok) {
            return response.json();
          }
          else {
            return response.json().then(json => {
              throw new Error(json);
            });
          }
        })
        .then(json => {
          // Success
          json = preprocessJSON(json);
          this.setState({ matches: json });
        })
        .catch(err => {
          // Failure
          console.log(err);
          return err;
        });
      }
    }

    render() {
      return <WrappedComponent data={this.state.data}
                               matches={this.state.matches}
                               visible={this.props.visible}
                               CREATE_HEADLINE={config.CREATE_HEADLINE}
                               UPDATE_HEADLINE={config.UPDATE_HEADLINE}

                               preventModalClose={this.preventModalClose}
                               closeModal={this.closeModal}
                               updateInput={this.updateInput}
                               createEntity={this.createEntity}
                               updateEntity={this.updateEntity}
                               matchEntity={this.matchEntity} />;
    }
  };
}

export {createEntityModalWrapper};
