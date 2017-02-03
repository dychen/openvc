import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './deals.scss';

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
        var dealNames = this.props.filterDealsByIdx(this.props.deals, index)
          .map(deal =>
            (<span key={deal.id} id={deal.id}>
               {deal.company} {deal.initialDate}
             </span>)
        );
      }
      else {
        var dealNames = '';
      }

      return (
        <span className="search-menu-stage-section" key={index}>
          <span className="search-menu-stage-name" id={index}
                onClick={this.openSection}>
            {stageName}&nbsp;
            ({this.props.filterDealsByIdx(this.props.deals, index).length})
          </span>
          <span className="search-menu-stage-deals">
            {dealNames}
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
      <div className="ovc-deals-search-menu">
        <div className="ovc-deals-search-show-buttons">
          <div className={showLiveClassName} id="showLive"
               onClick={this.props.toggleShowFilter}>
            Live Deals
          </div>
          <div className={showRejectedClassName} id="showRejected"
               onClick={this.props.toggleShowFilter}>
            Rejected
          </div>
        </div>
        <div className="ovc-deals-search-inputs">
          <label>Search for a startup</label>
          <input type="text" name="company" value={this.props.filters.company}
                 onChange={this.props.updateFilter} />
          <label>Search by opportunity owner</label>
          <input type="text" name="owner" value={this.props.filters.owner}
                 onChange={this.props.updateFilter} />
        </div>
        <div className="ovc-deals-search-stages">
          {stageNames}
        </div>
      </div>
    );
  }
}

class DealSection extends React.Component {
  render() {
    const deals = this.props.deals.map(deal => {
      const sourceStr = [
        deal.referrer,
        deal.source,
        deal.referralType,
        deal.outreachType
      ].filter(e => e).join(', ');
      const className = (deal.rejected
                         ? 'ovc-investor-deal-panel rejected'
                         : 'ovc-investor-deal-panel');
      const moveDealButtons = (deal.rejected ? '' : (
        <div className="move-deal">
          <i className="ion-ios-arrow-up" id={deal.id}
             onClick={this.props.moveDealBackward} />
          <i className="ion-ios-arrow-down" id={deal.id}
             onClick={this.props.moveDealForward} />
        </div>
      ));
      return (
        <div className={className} key={deal.id}>
          <img className="company-logo" src={deal.photoUrl} />
          <div className="deal-text">
            <div>
              <span>{deal.company}</span> {deal.initialDate}
            </div>
            <div>
              Source: {sourceStr}
            </div>
            <div>
              Owner: {deal.owner}
            </div>
            <div>
              {deal.type} {deal.amount}
            </div>
          </div>
          {moveDealButtons}
        </div>
      );
    });

    return (
      <div>
        <h3>{this.props.stageName} ({this.props.deals.length})</h3>
        {deals}
      </div>
    );
  }
}

class InvestorDealPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'filters': {
        'company': '',
        'owner': '',
        'showLive': true,
        'showRejected': false
      },
      'stageNames': ['Inbound', 'Initial Triage', 'Partner Meeting',
                     'Partnership Meeting', 'Termsheet Issued',
                     'Documents Signed', 'Money Wired', 'Closed'],
      'deals': []
    };

    this.moveDealForward = this.moveDealForward.bind(this);
    this.moveDealBackward = this.moveDealBackward.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.toggleShowFilter = this.toggleShowFilter.bind(this);
    this.filterDeals = this.filterDeals.bind(this);
    this.filterDealsByIdx = this.filterDealsByIdx.bind(this);

    fetch('/data/investor/deals/deals.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'deals': json });
    }); // TODO: Handle errors
  }

  moveDealForward(e) {
    const memberIdx = this.state.deals.findIndex(deal =>
      deal.id === Number(e.currentTarget.id)
    );
    if (this.state.deals[memberIdx].stageIdx
        < this.state.stageNames.length - 1) {
      const newState = Immutable.fromJS(this.state)
        .updateIn(['deals', memberIdx, 'stageIdx'], value => value + 1);
      this.setState(newState.toJS());
    }
  }

  moveDealBackward(e) {
    const memberIdx = this.state.deals.findIndex(deal =>
      deal.id === Number(e.currentTarget.id)
    );
    if (this.state.deals[memberIdx].stageIdx > 0) {
      const newState = Immutable.fromJS(this.state)
        .updateIn(['deals', memberIdx, 'stageIdx'], value => value - 1);
      this.setState(newState.toJS());
    }
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

  filterDeals(deals) {
    return deals.filter(deal  => {
      const companyMatch = deal.company.toLowerCase()
        .indexOf(this.state.filters.company.toLowerCase()) > -1;
      const ownerMatch = deal.owner.toLowerCase()
        .indexOf(this.state.filters.owner.toLowerCase()) > -1;
      const showLiveMatch = this.state.filters.showLive && !deal.rejected;
      const showRejectedMatch = (this.state.filters.showRejected
                                 && deal.rejected);

      return companyMatch && ownerMatch && (showLiveMatch || showRejectedMatch);
    });
  }

  filterDealsByIdx(deals, stageIdx) {
    return deals.filter(deal => deal.stageIdx === stageIdx);
  }

  render() {
    /* TODO: Rejections */
    const dealsMinimal = this.filterDeals(this.state.deals).map(deal => {
      return { id: deal.id, company: deal.company, stageIdx: deal.stageIdx,
               initialDate: deal.initialDate };
    });
    const dealSections = this.state.stageNames.map((stageName, index) =>
      (<DealSection key={index}
                    deals={this.filterDeals(
                           this.filterDealsByIdx(this.state.deals, index))}
                    stageName={this.state.stageNames[index]}
                    moveDealForward={this.moveDealForward}
                    moveDealBackward={this.moveDealBackward} />)
    );

    return (
      <div className="ovc-investor-deal-container">
        <SearchSection filters={this.state.filters}
                       stageNames={this.state.stageNames}
                       deals={dealsMinimal}
                       filterDealsByIdx={this.filterDealsByIdx}
                       updateFilter={this.updateFilter}
                       toggleShowFilter={this.toggleShowFilter} />
        <div className="ovc-investor-deal-list">
          {dealSections}
        </div>
      </div>
    );
  }
}

export default InvestorDealPage;
