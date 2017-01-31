import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './fundraising.scss';

class SearchSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'openedSectionIdx': -1
    };

    this.openSection = this.openSection.bind(this);
  }

  openSection(e) {
    const clickedIdx = Number(e.currentTarget.id);
    // Click on an unopened section: Close section
    if (this.state.openedSectionIdx === clickedIdx) {
      this.setState({ 'openedSectionIdx': -1 });
    }
    // Click on an opened section: Open section
    else {
      this.setState({ 'openedSectionIdx': clickedIdx });
    }
  }

  render() {
    const stageNames = this.props.stageNames.map((stageName, index) => {
      if (index === this.state.openedSectionIdx) {
        var investorNames = this.props.filterInvestorsByIdx(
          this.props.investors, index
        ).map(investor =>
          (<span key={investor.id} id={investor.id}>
             {investor.name} {investor.initialDate}
           </span>)
        );
      }
      else {
        var investorNames = '';
      }

      return (
        <span className="search-menu-stage-section" key={index}>
          <span className="search-menu-stage-name" id={index}
                onClick={this.openSection}>
            {stageName}&nbsp;
            ({this.props.filterInvestorsByIdx(this.props.investors, index).length})
          </span>
          <span className="search-menu-stage-investors">
            {investorNames}
          </span>
        </span>
      );
    });

    const showLiveClassName = (
      this.props.filters.showLive ? 'show-button selected' : 'show-button'
    );
    const showRejectedClassName = (
      this.props.filters.showRejected ? 'show-button selected' : 'show-button'
    );

    return (
      <div className="ovc-fundraising-search-menu">
        <div className="ovc-fundraising-search-show-buttons">
          <div className={showLiveClassName} id="showLive"
               onClick={this.props.toggleShowFilter}>
            Live Deals
          </div>
          <div className={showRejectedClassName} id="showRejected"
               onClick={this.props.toggleShowFilter}>
            Rejected
          </div>
        </div>
        <div className="ovc-fundraising-search-inputs">
          <label>Search for an investor</label>
          <input type="text" name="investor" value={this.props.filters.investor}
                 onChange={this.props.updateFilter} />
        </div>
        <div className="ovc-fundraising-search-stages">
          {stageNames}
        </div>
      </div>
    );
  }
}

class InvestorSection extends React.Component {
  render() {
    const investors = this.props.investors.map((investor, index) => {
      const className = (investor.rejected
                         ? 'ovc-fundraising-investor-panel rejected'
                         : 'ovc-fundraising-investor-panel');
      return (
        <div className={className} key={investor.id}>
          <img className="company-logo" src={investor.photoUrl} />
          <div className="investor-text">
            <div>
              <span>{investor.name}</span> {investor.initialDate}
            </div>
            <div>
              {investor.location}
            </div>
            <div>
              Contact: {investor.contact}
            </div>
            <div>
              Check Size: {investor.checkMin} - {investor.checkMax}
            </div>
          </div>
        </div>
      );
    });

    return (
      <div>
        <h3>{this.props.stageName} ({this.props.investors.length})</h3>
        {investors}
      </div>
    );
  }
}

class FounderFundraisingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'filters': {
        'investor': '',
        'showLive': true,
        'showRejected': false
      },
      'stageNames': ['Inbound', 'Initial Triage', 'Partner Meeting',
                     'Partnership Meeting', 'Termsheet Issued',
                     'Documents Signed', 'Money Wired', 'Closed'],
      'investors': []
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.toggleShowFilter = this.toggleShowFilter.bind(this);
    this.filterInvestors = this.filterInvestors.bind(this);
    this.filterInvestorsByIdx = this.filterInvestorsByIdx.bind(this);

    fetch('/data/founder/fundraising/investors.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'investors': json });
    }); // TODO: Handle errors
  }

  updateFilter(e) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filters', e.target.name], value => e.target.value);
    this.setState(newState.toJS());
  }

  toggleShowFilter(e) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filters', e.target.id], value => !value);
    this.setState(newState.toJS());
  }

  filterInvestors(investors) {
    return investors.filter((investor, index) => {
      const nameMatch = investor.name.toLowerCase()
        .indexOf(this.state.filters.investor.toLowerCase()) > -1;
      const showLiveMatch = this.state.filters.showLive && !investor.rejected;
      const showRejectedMatch = (this.state.filters.showRejected
                                 && investor.rejected);

      return nameMatch && (showLiveMatch || showRejectedMatch);
    });
  }

  filterInvestorsByIdx(investors, stageIdx) {
    return investors.filter(investor => investor.stageIdx === stageIdx);
  }

  render() {
    /* TODO: Rejections */
    const investorsMinimal = this.filterInvestors(this.state.investors)
                                 .map(investor => {
      return { id: investor.id, name: investor.name,
               stageIdx: investor.stageIdx, initialDate: investor.initialDate };
    });
    const investorSections = this.state.stageNames.map((stageName, index) =>
      (<InvestorSection key={index}
                        investors={this.filterInvestors(
                                   this.filterInvestorsByIdx(
                                   this.state.investors, index))}
                        stageName={this.state.stageNames[index]} />)
    );

    return (
      <div className="ovc-founder-fundraising-container">
        <SearchSection filters={this.state.filters}
                       stageNames={this.state.stageNames}
                       investors={investorsMinimal}
                       filterInvestorsByIdx={this.filterInvestorsByIdx}
                       updateFilter={this.updateFilter}
                       toggleShowFilter={this.toggleShowFilter} />
        <div className="ovc-founder-fundraising-investor-list">
          {investorSections}
        </div>
      </div>
    );
  }
}

export default FounderFundraisingPage;
