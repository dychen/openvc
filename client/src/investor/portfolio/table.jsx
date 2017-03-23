import React from 'react';
import EditTable from '../../components/edittable.jsx';

class PortfolioTableSection extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = ['logoUrl', 'name', 'segment', 'sector', 'location',
                   'website', 'invested', 'ownership', 'latestRoundSeries',
                   'latestRoundDate', 'latestRoundRaised',
                   'latestRoundPostMoneyVal'];
    this.FIELD_MAP = {
      name: {
        display: 'Name',
        type: 'string',
        required: true
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
      logoUrl: {
        display: 'Logo',
        type: 'image',
        required: false
      },
      invested: {
        display: 'Invested',
        type: 'money',
        required: false
      },
      ownership: {
        display: 'Ownership',
        type: 'number',
        required: false
      },
      latestRoundSeries: {
        display: 'Last Round',
        type: 'string',
        required: false
      },
      latestRoundDate: {
        display: 'Raised At',
        type: 'date',
        required: false
      },
      latestRoundRaised: {
        display: '$ Raised',
        type: 'money',
        required: false
      },
      latestRoundPostMoneyVal: {
        display: 'Post Money',
        type: 'money',
        required: false
      }
    };
  }

  render() {
    return (
      <div className="ovc-edit-table-container">
        <EditTable API_URL={`${SERVER_URL}/api/v1/users/portfolio`}
                   FIELDS={this.FIELDS}
                   FIELD_MAP={this.FIELD_MAP}
                   {...this.props} />
      </div>
    );
  }
}

export default PortfolioTableSection;

