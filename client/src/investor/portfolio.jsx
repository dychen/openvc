import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../utils/api.js';

import './portfolio.scss';

/*
 * props:
 *   companies [list]: List of company objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *
 *   getUserCompanies [function]: Function to load company data.
 */
class PorfolioSection extends React.Component {
  constructor(props) {
    super(props);

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this._goToCompanyPage = this._goToCompanyPage.bind(this);

    // Fetch data
    this.props.getUserCompanies();
  }

  toggleExpanded(e) {
    e.stopPropagation();
    this.props.toggleExpanded(Number(e.currentTarget.id));
  }

  _goToCompanyPage(e) {
    // TODO: Refactor this route to /company
    const linkUrl = '/' + this.props._USER_TYPE + '/portfolio/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
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
             onClick={this._goToContactPage}>
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
      companies: []
    };

    this.getUserCompanies = this.getUserCompanies.bind(this);
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
  getUserCompanies() {
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
        console.log(json);
        json = preprocessJSON(json);
        const newState = Immutable.fromJS(this.state).set('companies', json);
        this.setState(newState.toJS());
      }).catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  render() {
    return (
      <div>
        <div className="ovc-create-portco-button"
             onClick={this.toggleCreatingContact}>
          <i className="ion-plus create-portco" />
          <span>Add a portfolio company</span>
        </div>
        <PorfolioSection companies={this.state.companies}
                         getUserCompanies={this.getUserCompanies} />
      </div>
    );
  }
}

export default InvestorPorfolioPage;
