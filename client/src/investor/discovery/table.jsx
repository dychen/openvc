import React from 'react';
import EditTable from '../../components/edittable/edittable.jsx';

class DiscoveryTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['name', 'logoUrl', 'location', 'website', 'segment',
                   'sector'];

    this.FIELD_MAP = {
      name: {
        display: 'Name',
        type: 'string',
        required: true
      },
      logoUrl: {
        display: 'Logo',
        type: 'image',
        required: false
      },
      location: {
        display: 'Location',
        type: 'string',
        required: false
      },
      website: {
        display: 'Website',
        type: 'string',
        required: false
      },
      segment: {
        display: 'Segment',
        type: 'string',
        required: false
      },
      sector: {
        display: 'Sector',
        type: 'string',
        required: false
      },
    };
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/users/leads`}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   {...this.props} />
      </div>
    );
  }
}

export default DiscoveryTableSection;

