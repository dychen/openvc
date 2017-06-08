import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';
import {filterData, Subnav, SubnavFilters} from '../../components/subnav.jsx';

//import UserPortfolioSection from './user.jsx';
import DealTableSection from './table.jsx';

import '../../components/subnav.scss';

class InvestorDealsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filterTags: []
    };

    this.updateFilterTags = this.updateFilterTags.bind(this);
    this.filterTableData = this.filterTableData.bind(this);
  }

  updateFilterTags(filterTags) {
    this.setState({ filterTags: filterTags });
  }

  filterTableData(data) {
    return filterData(data, this.state.filterTags);
  }

  render() {
    // TODO: filterData is an expensive function and should not get called on
    //       every re-render. Refactor to only call when needed.
    const filterList = ['name', 'source', 'type', 'status', 'stage'].map(k => {
      return { key: k, display: `Filter by ${k}` };
    });
    return (
      <div className="ovc-subnav-view-container">
        <DealTableSection filterData={this.filterTableData} />
        <Subnav title="Filters">
          <SubnavFilters filterList={filterList}
                         onUpdate={this.updateFilterTags} />
        </Subnav>
      </div>
    );
  }
}

export default InvestorDealsPage;
