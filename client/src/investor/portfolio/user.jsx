import React from 'react';
import {hashHistory} from 'react-router';
import numeral from 'numeral';
import moment from 'moment';

import CreateCompanyModal from '../../components/modals/company.jsx';

import './user.scss';

/*
 * props:
 *   title [string]: Title of subpanel.
 *   icon [string]: Icon class name.
 *   investment [Object]: {
 *     series [string]: Round of investment (e.g. 'Series A'),
 *     date [Date]: Round date,
 *     raised [number]: Amount raised,
 *     postMoney [number]: Post money valuation
 *   }
 */
class PortcoInvestmentSubpanel extends React.Component {
  render() {
    const investment = this.props.investment;
    const subpanelText = {
      series: investment.series ? investment.series : '',
      date: (investment.date ?
             ` on ${moment(investment.date).format('ll')}` : ''),
      raised: (investment.raised ?
               numeral(investment.raised).format('($0,0)') : ''),
      postMoney: (investment.postMoney ?
                  numeral(investment.postMoney).format('($0,0)') : '')
    };
    return (
      <div className="ovc-investor-portco-overview-subpanel">
        <div className="overview-subpanel-title">
          {this.props.title}
        </div>
        <div className="overview-subpanel-subsection long">
          <span className="overview-value">
            <i className={`${this.props.icon} icon-main`} />
          </span>
          <span className="overview-value">
            <div>{subpanelText.series}</div>
            <div>{subpanelText.date}</div>
          </span>
          <span className="overview-value">
            <div className="value-label">Raised:</div>
            <div>{subpanelText.raised}</div>
            <div className="value-label">Post:</div>
            <div>{subpanelText.postMoney}</div>
          </span>
        </div>
      </div>
    );
  }
}

/*
 * props:
 *   title [string]: Title of subpanel.
 *   company [Object]: {
 *     ...
 *     totalRaised [number]: Total raised to date,
 *     invested [number]: Total investment to date,
 *     ownership [number]: Ownership
 *   }
 */
class PortcoTotalSubpanel extends React.Component {
  render() {
    const company = this.props.company;
    const subpanelText = {
      totalRaised: (company.totalRaised ?
                    numeral(company.totalRaised).format('($0,0)') : ''),
      invested: (company.invested ?
                 numeral(company.invested).format('($0,0)') : ''),
      ownership: (company.ownership ?
                  numeral(company.ownership).format('(0.0%)') : '')
    };
    return (
      <div className="ovc-investor-portco-overview-subpanel">
        <div className="overview-subpanel-title">
          {this.props.title}
        </div>
        <div className="overview-subpanel-subsection long">
          <span className="overview-value">
            <i className="ion-arrow-graph-up-right icon-main" />
          </span>
          <span className="overview-value">
            <div className="value-label">Total Raised:</div>
            <div>{subpanelText.totalRaised}</div>
            <div className="value-label">Invested:</div>
            <div>{subpanelText.invested}</div>
            <div className="value-label">Ownership:</div>
            <div>{subpanelText.ownership}</div>
          </span>
        </div>
      </div>
    );
  }
}

/*
 * props:
 *   title [string]: Title of subpanel.
 *   metrics [Object]: {
 *     revenue [Object]: { date: [Date], value: [number] },
 *     burn [Object]: { date: [Date], value: [number] },
 *     cash [Object]: { date: [Date], value: [number] },
 *     headcount [Object]: { date: [Date], value: [number] }
 *   }
 */
class PortcoMetricSubpanel extends React.Component {
  render() {
    const metrics = this.props.metrics;
    const subpanelText = {
      revenue: (metrics.revenue.value ?
                numeral(metrics.revenue.value).format('($0,0)') : ''),
      burn: (metrics.burn.value ?
             numeral(metrics.burn.value).format('($0,0)') : ''),
      cash: (metrics.cash.value ?
             numeral(metrics.cash.value).format('($0,0)') : ''),
      headcount: (metrics.headcount.value ?
                  numeral(metrics.headcount.value).format('(0,0)') : '')
    };
    return (
      <div className="ovc-investor-portco-overview-subpanel">
        <div className="overview-subpanel-title">
          {this.props.title}
        </div>
        <div className="overview-subpanel-subsection short">
          <span className="overview-value">
            <div className="value-label">Revenue:</div>
            <div>{subpanelText.revenue}</div>
          </span>
          <span className="overview-value">
            <div className="value-label">Burn:</div>
            <div>{subpanelText.burn}</div>
          </span>
          <span className="overview-value">
            <div className="value-label">Cash:</div>
            <div>{subpanelText.cash}</div>
          </span>
          <span className="overview-value">
            <div className="value-label">Headcount:</div>
            <div>{subpanelText.headcount}</div>
          </span>
        </div>
      </div>
    );
  }
}

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

    this._createCompanyPanel = this._createCompanyPanel.bind(this);
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
        || <span className="ovc-no-data">Website unknown</span>
    };

    return (
      <div className="ovc-investor-portco-panel"
           id={company.id} key={company.id}
           onClick={this._goToCompanyPage}>
        <div className="ovc-investor-portco-left-subpanel">
          <img className="company-logo" src={companyDisplay.logoUrl} />
          <div className="company-text">
            <div className="company-name">
              {companyDisplay.name}
            </div>
            <div className="company-segment">
              {companyDisplay.segment}, {companyDisplay.sector}
            </div>
            <div className="company-location">
              {companyDisplay.location}
            </div>
          </div>
        </div>
        <div className="ovc-investor-portco-subpanel-container">
          <PortcoInvestmentSubpanel title="Last Round"
                                    icon="ion-calendar"
                                    investment={company.lastRound} />
          <PortcoInvestmentSubpanel title="Initial Round"
                                    icon="ion-cash"
                                    investment={company.firstRound} />
          <PortcoTotalSubpanel title="To Date"
                               company={company} />
          <PortcoMetricSubpanel title="KPIs"
                                metrics={company.lastMetrics} />
        </div>
        <i className="ion-ios-close remove-portco" id={company.id}
           onClick={this.handleDeletePortfolioCompany} />
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

