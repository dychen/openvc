import React from 'react';
import EditTable from '../../components/edittable/edittable.jsx';

class ContactsTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['photoUrl', 'firstName', 'lastName', 'company', 'title',
                   'email', 'location', 'linkedinUrl'];
    this.FIELD_MAP = {
      firstName: {
        display: 'First Name',
        type: 'string',
        required: true
      },
      lastName: {
        display: 'Last Name',
        type: 'string',
        required: true
      },
      company: {
        display: 'Company',
        type: 'string',
        required: false
      },
      title: {
        display: 'Title',
        type: 'string',
        required: false
      },
      email: {
        display: 'Email',
        type: 'email',
        required: false
      },
      location: {
        display: 'Location',
        type: 'string',
        required: false
      },
      linkedinUrl: {
        display: 'LinkedIn',
        type: 'string',
        required: false
      },
      photoUrl: {
        display: 'Photo',
        type: 'image',
        required: false
      }
    };
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/contacts/self`}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   {...this.props} />
      </div>
    );
  }
}

export default ContactsTableSection;

