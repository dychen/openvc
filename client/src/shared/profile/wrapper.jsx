import React from 'react';
import ProfilePage from './profile.jsx';

const profileWrapper = function(WrappedComponent, config) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this._PROFILE_URL = config.profileUrl(this.props);
      this._EXPERIENCE_URL = config.experienceUrl(this.props);
    }

    render() {
      return <WrappedComponent profileUrl={this._PROFILE_URL}
                               experienceUrl={this._EXPERIENCE_URL}
                               {...this.props} />;
    }
  };
}

const userConfig = {
  profileUrl: () => {
    return `${SERVER_URL}/api/v1/users/self`;
  },
  experienceUrl: () => {
    return `${SERVER_URL}/api/v1/users/experience`;
  },
};

const contactConfig = {
  profileUrl: (props) => {
    return `${SERVER_URL}/api/v1/contacts/self/${props.params.contactId}`;
  },
  experienceUrl: (props) => {
    return `${SERVER_URL}/api/v1/data/person/${props.params.contactId}/experience`;
  },
}

const UserProfilePage = profileWrapper(ProfilePage, userConfig);
const ContactProfilePage = profileWrapper(ProfilePage, contactConfig);

export {UserProfilePage, ContactProfilePage};

