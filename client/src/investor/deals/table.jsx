import React from 'react';
import EditTable from '../../components/edittable.jsx';

class DealTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['name', 'companyId', 'date', 'ownerId', 'source', 'type',
                   'status', 'stage'];
    this.FIELD_MAP = {
      name: {
        display: 'Name',
        type: 'string',
        required: true
      },
      companyId: {
        display: 'Company',
        type: 'model',
        modelType: 'company',
        required: false
      },
      date: {
        display: 'Date',
        type: 'date',
        required: false
      },
      ownerId: {
        display: 'Person',
        type: 'model',
        modelType: 'person',
        required: false
      },
      source: {
        display: 'Source',
        type: 'string',
        required: false
      },
      type: {
        display: 'Type',
        type: 'string',
        required: false
      },
      status: {
        display: 'Status',
        type: 'string',
        required: false
      },
      stage: {
        display: 'Stage',
        type: 'string',
        required: false
      },
      logoUrl: {
        display: 'Logo',
        type: 'image',
        required: false
      }
    };
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/users/deals`}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   {...this.props} />
      </div>
    );
  }
}

export default DealTableSection;

