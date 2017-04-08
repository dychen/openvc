import React from 'react';
import EditTable from '../../components/edittable.jsx';

class DealTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['name', 'companyName', 'companyLogoUrl', 'companySector',
                   'date', 'source', 'type', 'status', 'stage'];
    this.FIELD_MAP = {
      name: {
        display: 'Name',
        type: 'string',
        required: true
      },
      companyName: {
        display: 'Company',
        type: 'string',
        model: 'company',
        modelField: 'name',
        required: false
      },
      companyLogoUrl: {
        display: 'Logo',
        type: 'image',
        model: 'company',
        modelField: 'logoUrl',
        required: false
      },
      companySector: {
        display: 'Sector',
        type: 'string',
        model: 'company',
        modelField: 'sector',
        required: false
      },
      date: {
        display: 'Date',
        type: 'date',
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
      }
    };
    this.MODEL_MAP = {
      company: {
        type: 'company',
        fields: [
          { fieldMapName: 'companyName', apiName: 'name' },
          { fieldMapName: 'companyLogoUrl', apiName: 'logoUrl' },
          { fieldMapName: 'companySector', apiName: 'sector' }
        ]
      }
    };
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/users/deals`}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   MODEL_MAP={this.MODEL_MAP}
                   {...this.props} />
      </div>
    );
  }
}

export default DealTableSection;

