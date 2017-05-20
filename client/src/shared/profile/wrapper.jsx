import React from 'react';
import ProfilePage from './profile.jsx';

const profileWrapper = function(WrappedComponent, config) {
  return (props) => {
    return (<WrappedComponent profileUrl={config.profileUrl(props)}
                              experienceUrl={config.experienceUrl(props)}
                              {...props} />);
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
    return `${SERVER_URL}/api/v1/contacts/self/${props.match.params.contactId}`;
  },
  experienceUrl: (props) => {
    return `${SERVER_URL}/api/v1/data/person/${props.match.params.contactId}/experience`;
  },
}

const UserProfilePage = profileWrapper(ProfilePage, userConfig);
const ContactProfilePage = profileWrapper(ProfilePage, contactConfig);

export {UserProfilePage, ContactProfilePage};

