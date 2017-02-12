import React from 'react';
import ProfilePage from './profile.jsx';

const profileWrapper = function(WrappedComponent, config) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this._GET_URL = config.getUrl(this.props);
      this._UPDATE_URL = config.getUrl(this.props);
    }

    render() {
      return <WrappedComponent getUrl={this._GET_URL}
                               updateUrl={this._UPDATE_URL}
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
  }
};

const contactConfig = {
  getUrl: (props) => {
    return `${SERVER_URL}/api/v1/contacts/self/${props.params.contactId}`;
  },
  updateUrl: (props) => {
    return `${SERVER_URL}/api/v1/contacts/self/${props.params.contactId}`;
  }
}

const UserProfilePage = profileWrapper(ProfilePage, userConfig);
const ContactProfilePage = profileWrapper(ProfilePage, contactConfig);

export {UserProfilePage, ContactProfilePage};

