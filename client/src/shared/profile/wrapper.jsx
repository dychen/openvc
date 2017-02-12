import React from 'react';
import ProfilePage from './profile.jsx';

const profileWrapper = function(WrappedComponent, config) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this._GET_URL = config.getUrl(this.props);
      this._UPDATE_URL = config.updateUrl(this.props);
      this._CREATE_EXPERIENCE_URL = config.createExperienceUrl(this.props);
      this._UPDATE_EXPERIENCE_URL = config.updateExperienceUrl(this.props);
      this._DELETE_EXPERIENCE_URL = config.deleteExperienceUrl(this.props);
    }

    render() {
      return <WrappedComponent getUrl={this._GET_URL}
                               updateUrl={this._UPDATE_URL}
                               createExperienceUrl={this._CREATE_EXPERIENCE_URL}
                               updateExperienceUrl={this._UPDATE_EXPERIENCE_URL}
                               deleteExperienceUrl={this._DELETE_EXPERIENCE_URL}
                               {...this.props} />;
    }
  };
}

const userConfig = {
  getUrl: () => {
    return `${SERVER_URL}/api/v1/users/self`;
  },
  updateUrl: () => {
    return `${SERVER_URL}/api/v1/users/self`;
  },
  createExperienceUrl: () => {
    return `${SERVER_URL}/api/v1/users/experience`;
  },
  updateExperienceUrl: () => {
    // Append /:experienceId
    return `${SERVER_URL}/api/v1/users/experience`;
  },
  deleteExperienceUrl: () => {
    // Append /:experienceId
    return `${SERVER_URL}/api/v1/users/experience`;
  }
};

const contactConfig = {
  getUrl: (props) => {
    return `${SERVER_URL}/api/v1/contacts/self/${props.params.contactId}`;
  },
  updateUrl: (props) => {
    return `${SERVER_URL}/api/v1/contacts/self/${props.params.contactId}`;
  },
  createExperienceUrl: (props) => {
    return `${SERVER_URL}/api/v1/data/person/${props.params.contactId}/experience`;
  },
  updateExperienceUrl: (props) => {
    // Append /:experienceId
    return `${SERVER_URL}/api/v1/data/person/${props.params.contactId}/experience`;
  },
  deleteExperienceUrl: (props) => {
    // Append /:experienceId
    return `${SERVER_URL}/api/v1/data/person/${props.params.contactId}/experience`;
  }
}

const UserProfilePage = profileWrapper(ProfilePage, userConfig);
const ContactProfilePage = profileWrapper(ProfilePage, contactConfig);

export {UserProfilePage, ContactProfilePage};

