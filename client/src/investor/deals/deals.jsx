import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import SearchSection from './search.jsx';
//import UserPortfolioSection from './user.jsx';
import DealTableSection from './table.jsx';

import '../../components/subnav.scss';

class InvestorDealsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Options: 'user', 'table'
      section: 'table',
      groupBy: 'none',
      filterInputs: {
        name: '',
        segment: '',
        sector: '',
        tag: ''
      },
      filterTags: []
    };

    // Search section
    this.changeSection = this.changeSection.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
  }

  /*
   * Search section
   */

  changeSection(newSection) {
    this.setState({ section: newSection });
  }

  selectGroupBy(field) {
    this.setState({ groupBy: field });
  }

  updateFilter(filterName, filterValue) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filterInputs', filterName], value => filterValue);
    this.setState(newState.toJS());
  }

  addFilterTag(tag) {
    const newState = Immutable.fromJS(this.state)
      .update('filterTags', tags => tags.push(tag));
    const newStateCleared = newState.updateIn(
      ['filterInputs', tag.type], value => ''
    );
    this.setState(newStateCleared.toJS());
  }

  removeFilterTag(tagId) {
    const memberIdx = tagId;
    const newTags = this.state.filterTags.filter((tag, index) =>
      index !== memberIdx
    );
    const newState = Immutable.fromJS(this.state)
      .update('filterTags', value => newTags);
    this.setState(newState.toJS());
  }

  render() {
    let visibleSection;
    switch (this.state.section) {
      case 'table':
        visibleSection = (<DealTableSection />);
        break;
      case 'user':
      case 'default':
        break;
    }

    return (
      <div className="ovc-subnav-view-container">
        <SearchSection section={this.state.section}
                       groupBy={this.state.groupBy}
                       filterInputs={this.state.filterInputs}
                       filterTags={this.state.filterTags}
                       changeSection={this.changeSection}
                       selectGroupBy={this.selectGroupBy}
                       updateFilter={this.updateFilter}
                       addFilterTag={this.addFilterTag}
                       removeFilterTag={this.removeFilterTag} />
        {visibleSection}
      </div>
    );
  }
}

export default InvestorDealsPage;
