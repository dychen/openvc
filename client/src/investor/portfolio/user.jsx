import React from 'react';
import {hashHistory} from 'react-router';

import CreateCompanyModal from '../../components/modals/company.jsx';

import './user.scss';

/*
 * props:
 *   companies [list]: List of company objects.
 *   groupBy [string]: Field to group contacts by (e.g. 'company' or 'title').
 *
 *   createPortfolioCompany [function]: Function to create a new company (from
 *                                      modal).
 *   updatePortfolioCompany [function]: Function to update an existing company
 *                                      (from modal).
 *   deletePortfolioCompany [function]: Function to delete company data.
 */
class UserPortfolioSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    };

    this._goToCompanyPage = this._goToCompanyPage.bind(this);

    // Modal actions
    this.addPortfolioCompany = this.addPortfolioCompany.bind(this);
    this.cancelPortfolioCompany = this.cancelPortfolioCompany.bind(this);
    this.handleDeletePortfolioCompany = this.handleDeletePortfolioCompany.bind(this);
  }

  _goToCompanyPage(e) {
    // TODO: Refactor this route to /company
    const linkUrl = '/investor/portfolio/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
  }

  /*
   * Modal actions
   */

  addPortfolioCompany(e) {
    this.setState({ modalVisible: true });
  }

  cancelPortfolioCompany(e) {
    this.setState({ modalVisible: false });
  }

  handleDeletePortfolioCompany(e) {
    e.stopPropagation();
    this.props.deletePortfolioCompany(Number(e.currentTarget.id));
  }

  _createCompanyPanel(company) {
    const companyDisplay = {
      logoUrl: company.logoUrl,
      name: company.name
        || <span className="ovc-no-data">Name unknown</span>,
      segment: company.segment
        || <span className="ovc-no-data">Segment unknown</span>,
      sector: company.sector
        || <span className="ovc-no-data">Sector unknown</span>,
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
    };

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
            {companyDisplay.segment} {companyDisplay.sector} {companyDisplay.location}
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
  }

  render() {
    let companies;
    if (this.props.groupBy === 'none') {
      companies = this.props.companies.map(company =>
        this._createCompanyPanel(company)
      );
    }
    else {
      const companyGroupLabels = Array.from(
        new Set(this.props.companies.map(company => company[this.props.groupBy]))
      );
      companyGroupLabels.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      companies = companyGroupLabels.map(label => {
        const companyGroup = this.props.companies.filter(company =>
          company[this.props.groupBy] === label
        ).map(company => this._createCompanyPanel(company));
        return (
          <div key={label}>
            <h3>{label}</h3>
            <div className="ovc-investor-portco-sublist">
              {companyGroup}
            </div>
          </div>
        );
      });
    }

    return (
      <div className="ovc-investor-portco-list">
        <div className="ovc-create-portco-button"
             onClick={this.addPortfolioCompany}>
          <i className="ion-plus create-portco" />
          <span>Add a portfolio company</span>
        </div>
        {companies}
        <CreateCompanyModal visible={this.state.modalVisible}
                            hideModal={this.cancelPortfolioCompany}
                            createEntity={this.props.createPortfolioCompany}
                            updateEntity={this.props.updatePortfolioCompany} />
      </div>
    );
  }
}

export default UserPortfolioSection;

