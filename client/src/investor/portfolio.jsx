import React from 'react';
import Immutable from 'immutable';
import {hashHistory} from 'react-router';
import {authFetch, preprocessJSON} from '../utils/api.js';

import CreateCompanyModal from '../components/modals/company.jsx';

import './portfolio.scss';

/*
 * props:
 *   companies [list]: List of company objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *
 *   getPortfolioCompanyList [function]: Function to load company data.
 *   deletePortfolioCompany [function]: Function to delete company data.
 */
class PorfolioSection extends React.Component {
  constructor(props) {
    super(props);

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this._goToCompanyPage = this._goToCompanyPage.bind(this);
    this.handleDeletePortfolioCompany = this.handleDeletePortfolioCompany.bind(this);

    // Fetch data
    this.props.getPortfolioCompanyList();
  }

  toggleExpanded(e) {
    e.stopPropagation();
    this.props.toggleExpanded(Number(e.currentTarget.id));
  }

  _goToCompanyPage(e) {
    // TODO: Refactor this route to /company
    const linkUrl = '/investor/portfolio/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
  }

  handleDeletePortfolioCompany(e) {
    e.stopPropagation();
    this.props.deletePortfolioCompany(Number(e.currentTarget.id));
  }

  render() {
    const companies = this.props.companies.map(company => {
      const companyDisplay = {
        logoUrl: company.logoUrl,
        name: company.name
          || <span className="ovc-no-data">Name unknown</span>,
        location: company.location
          || <span className="ovc-no-data">Location unknown</span>,
        website: company.website
          || <span className="ovc-no-data">Website unknown</span>,
        invested: company.invested
          || <span className="ovc-no-data">Investment unknown</span>,
        ownership: company.ownership
          || <span className="ovc-no-data">Ownership unknown</span>,
        totalRaised: company.totalRaised
          || <span className="ovc-no-data">Total Raised unknown</span>,
        latestRoundSeries: company.latestRoundSeries
          || <span className="ovc-no-data">Series unknown</span>,
        latestRoundDate: company.latestRoundDate
          || <span className="ovc-no-data">Date unknown</span>,
        latestRoundRaised: company.latestRoundRaised
          || <span className="ovc-no-data">Amount unknown</span>,
        latestRoundPostMoneyVal: company.latestRoundPostMoneyVal
          || <span className="ovc-no-data">Post money unknown</span>
      }

      return (
        <div className="ovc-investor-portco-panel"
             id={company.id} key={company.id}
             onClick={this._goToCompanyPage}>
          <img className="company-logo" src={companyDisplay.logoUrl} />
          <div className="portco-text">
            <div className="portco-name">
              {companyDisplay.name}
            </div>
            <div className="portco-metadata">
              {companyDisplay.location} {companyDisplay.website}
            </div>
            <div className="portco-fundraising">
              {companyDisplay.invested} {companyDisplay.ownership} {companyDisplay.totalRaised}
            </div>
            <div className="portco-last-round">
              Last Round: {companyDisplay.latestRoundSeries}
                &nbsp;({companyDisplay.latestRoundDate}):
                &nbsp;{companyDisplay.latestRoundRaised}
                &nbsp;at {companyDisplay.latestRoundPostMoneyVal}
            </div>
            <i className="ion-ios-close remove-portco" id={company.id}
               onClick={this.handleDeletePortfolioCompany} />
          </div>
        </div>
      );
    });

    return (
      <div className="ovc-investor-portco-list">
        {companies}
      </div>
    );
  }
}

class InvestorPorfolioPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Options: 'user', 'all', 'table'
      section: 'user',
      modalVisible: false,
      companies: []
    };

    this.addPortfolioCompany = this.addPortfolioCompany.bind(this);
    this.cancelPortfolioCompany = this.cancelPortfolioCompany.bind(this);

    this.getPortfolioCompanyList = this.getPortfolioCompanyList.bind(this);
    this.createPortfolioCompany = this.createPortfolioCompany.bind(this);
    this.updatePortfolioCompany = this.updatePortfolioCompany.bind(this);
    this.deletePortfolioCompany = this.deletePortfolioCompany.bind(this);
  }

  /*
   * New portfolio company component handlers
   */

  addPortfolioCompany(e) {
    this.setState({ modalVisible: true });
  }

  cancelPortfolioCompany(e) {
    this.setState({ modalVisible: false });
  }

  /* Load data */
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

  render() {
    return (
      <div>
        <div className="ovc-create-portco-button"
             onClick={this.addPortfolioCompany}>
          <i className="ion-plus create-portco" />
          <span>Add a portfolio company</span>
        </div>
        <PorfolioSection companies={this.state.companies}
                         getPortfolioCompanyList={this.getPortfolioCompanyList}
                         deletePortfolioCompany={this.deletePortfolioCompany} />
        <CreateCompanyModal visible={this.state.modalVisible}
                            hideModal={this.cancelPortfolioCompany}
                            createEntity={this.createPortfolioCompany}
                            updateEntity={this.updatePortfolioCompany} />
      </div>
    );
  }
}

export default InvestorPorfolioPage;
