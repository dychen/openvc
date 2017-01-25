import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './deals.scss';

class DealSection extends React.Component {
  render() {
    const deals = this.props.deals.map((deal, index) => {
      const sourceStr = [
        deal.referrer,
        deal.source,
        deal.referralType,
        deal.outreachType
      ].filter(e => e).join(', ');
      return (
        <div className="ovc-investor-deal-panel" key={deal.id}>
          <img className="company-logo" src={deal.photoUrl} />
          <div className="ovc-deal-text">
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
          <div className="move-deal">
            <i className="ion-ios-arrow-up" id={deal.id}
               onClick={this.props.moveDealBackward} />
            <i className="ion-ios-arrow-down" id={deal.id}
               onClick={this.props.moveDealForward} />
          </div>
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
      'numStages': 8,
      'deals': []
    };

    this.moveDealForward = this.moveDealForward.bind(this);
    this.moveDealBackward = this.moveDealBackward.bind(this);
    this.filterDeals = this.filterDeals.bind(this);

    fetch('/data/investor/deals/deals.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'deals': json });
    }); // TODO: Handle errors
  }

  filterDeals(deals, stageIdx) {
    return this.state.deals.filter(deal =>
      deal.stageIdx === stageIdx
    );
  }

  moveDealForward(e) {
    const memberIdx = this.state.deals.findIndex(deal =>
      deal.id === Number(e.currentTarget.id)
    );
    if (this.state.deals[memberIdx].stageIdx < this.state.numStages - 1) {
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

  render() {
    return (
      <div className="ovc-investor-deal-container">
        <DealSection deals={this.filterDeals(this.state.deals, 0)}
                     stageName="Inbound"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 1)}
                     stageName="Initial Triage"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 2)}
                     stageName="Partner Meeting"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 3)}
                     stageName="Partnership Meeting"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 4)}
                     stageName="Termsheet Issued"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 5)}
                     stageName="Documents Signed"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 6)}
                     stageName="Money Wired"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
        <DealSection deals={this.filterDeals(this.state.deals, 7)}
                     stageName="Closed"
                     moveDealForward={this.moveDealForward}
                     moveDealBackward={this.moveDealBackward} />
      </div>
    )
  }
}

export default InvestorDealPage;
