import React from 'react';
import Immutable from 'immutable';
import {hashHistory} from 'react-router';
import {authFetch, preprocessJSON} from '../../utils/api.js';

import SearchSection from './search.jsx';
import UserPortfolioSection from './user.jsx';
import PortfolioTableSection from './table.jsx';

import './portfolio.scss';

class InvestorPorfolioPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Options: 'user', 'all', 'table'
      section: 'user',
      groupBy: 'none',
      filterInputs: {
        name: '',
        segment: '',
        sector: '',
        tag: ''
      },
      filterTags: [],
      companies: []
    };

    // Search section
    this.changeSection = this.changeSection.bind(this);
    this.selectGroupBy = this.selectGroupBy.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);

    // CRUD API
    this.getPortfolioCompanyList = this.getPortfolioCompanyList.bind(this);
    this.createPortfolioCompany = this.createPortfolioCompany.bind(this);
    this.updatePortfolioCompany = this.updatePortfolioCompany.bind(this);
    this.deletePortfolioCompany = this.deletePortfolioCompany.bind(this);

    this._filterCompanies = this._filterCompanies.bind(this);

    this.getPortfolioCompanyList();
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

  /*
   * CRUD API
   */
  /*
   * Expected response: [{
   *   id: [number],
   *   location: [string],
   *   website: [string],
   *   logoUrl: [string],
   *   invested: [number],
   *   ownership: [number],
   *   totalRaised: [number],
   *   latestRoundSeries: [string],
   *   latestRoundDate: [Date string],
   *   latestRoundRaised: [number],
   *   latestRoundPostMoneyVal: [number]
   * }, ...]
   *
   */
  getPortfolioCompanyList() {
    authFetch(`${SERVER_URL}/api/v1/users/portfolio`)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            throw new Error(json);
          });
        }
      }).then(json => {
        // Success
        json = preprocessJSON(json);
        const newState = Immutable.fromJS(this.state).set('companies', json);
        this.setState(newState.toJS());
      }).catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  createPortfolioCompany(company) {
    authFetch(`${SERVER_URL}/api/v1/users/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(company)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state)
        .update('companies', companies => companies.push(json));

      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  updatePortfolioCompany(companyId, company) {
    authFetch(`${SERVER_URL}/api/v1/users/portfolio/${companyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(company)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const newState = Immutable.fromJS(this.state)
        .update('companies', companies => companies.push(json));
      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  deletePortfolioCompany(companyId) {
    authFetch(`${SERVER_URL}/api/v1/users/portfolio/${companyId}`, {
      method: 'DELETE'
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const deletedId = json.id;
      const newCompanies = this.state.companies.filter(company =>
        company.id !== deletedId
      );
      const newState = Immutable.fromJS(this.state)
        .set('companies', newCompanies);

      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  _filterCompanies(companies) {
    const filterAttribute = function(company, attr) {
      return company[attr].toLowerCase()
        .indexOf(this.state.filterInputs[attr].toLowerCase()) > -1;
    }.bind(this);

    const filterTags = function(company) {
      if (this.state.filterTags.length > 0) {
        const matchedTags = this.state.filterTags.filter(tag => {
          if (tag.type === 'tag') {
            return company.tags.map(tag => tag.toLowerCase())
              .indexOf(tag.value.toLowerCase()) > -1;
          }
          else {
            return company[tag.type].toLowerCase()
              .indexOf(tag.value.toLowerCase()) > -1;
          }
        });
        // Make sure all tags match
        return matchedTags.length === this.state.filterTags.length;
      }
      else {
        return true;
      }
    }.bind(this);

    return companies.filter(company => {
      const nameMatch = filterAttribute(company, 'name');
      const segmentMatch = filterAttribute(company, 'segment');
      const sectorMatch = filterAttribute(company, 'sector');
      const tagsMatch = filterTags(company);

      return nameMatch && segmentMatch && sectorMatch && tagsMatch;
    });
  }

  render() {
    const filteredCompanies = this._filterCompanies(this.state.companies);
    let visibleSection;
    switch (this.state.section) {
      case 'table':
        visibleSection = (<PortfolioTableSection />);
        break;
      case 'user':
      case 'default':
        visibleSection = (
          <UserPortfolioSection companies={filteredCompanies}
                                groupBy={this.state.groupBy}
                                createPortfolioCompany={this.createPortfolioCompany}
                                updatePortfolioCompany={this.updatePortfolioCompany}
                                deletePortfolioCompany={this.deletePortfolioCompany} />
        );
        break;
    }

    return (
      <div className="ovc-investor-portfolio-container">
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

export default InvestorPorfolioPage;
