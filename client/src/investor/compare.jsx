import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './compare.scss';

class SearchRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'companySearch': ''
    };

    this.handleCompanySearchChange = this.handleCompanySearchChange.bind(this);
    this.addToCompareByName = this.addToCompareByName.bind(this);
    this.removeFromCompare = this.removeFromCompare.bind(this);
  }

  handleCompanySearchChange(e) {
    this.setState({ companySearch: e.currentTarget.value });
  }

  addToCompareByName(e) {
    if (e.key === 'Enter') {
      const name = e.currentTarget.value.trim();
      this.setState({ companySearch: '' });
      this.props.addToCompareByName(name);
    }
  }

  removeFromCompare(e) {
    const id = Number(e.currentTarget.id);
    this.props.removeFromCompare(id);
  }

  render() {
    const selectedIcons = this.props.selectedStartups.map(startup => {
      return (
        <img src={startup.photoUrl} key={startup.id} id={startup.id}
             onClick={this.removeFromCompare} />
      );
    });
    var emptyIcons = [];
    for (var i = 0; i < this.props.COMPARING_MAX_LENGTH - selectedIcons.length; i++) {
      emptyIcons.push((<i className="ion-ios-help" key={i} />));
    }

    return (
      <div className="ovc-compare-search-row">
        <div className="search-row-left">
          <input type="text" value={this.state.companySearch}
                 onChange={this.handleCompanySearchChange}
                 onKeyPress={this.addToCompareByName} />
        </div>
        <div className="search-row-mid">
          <span>Team</span>|
          <span>Board</span>|
          <span>Investors</span>|
          <span>Fundraising</span>|
          <span>Decks</span>|
          <span>KPIs</span>|
          <span>Customers</span>
        </div>
        <div className="search-row-right">
          {selectedIcons}
          {emptyIcons}
        </div>
      </div>
    );
  }
}

class QuickCompareRow extends React.Component {
  constructor(props) {
    super(props);

    this.addToCompare = this.addToCompare.bind(this);
  }

  addToCompare(e) {
    const id = Number(e.currentTarget.id);
    this.props.addToCompare(id);
  }

  render() {
    const startupIcons = this.props.startups.map(startup => {
      return (
        <img src={startup.photoUrl} key={startup.id} id={startup.id}
             onClick={this.addToCompare} />
      );
    });

    // Duplicate these for testing to show horizontal scroll
    return (
      <div className="ovc-compare-quick-row">
        {startupIcons}
        {startupIcons}
        {startupIcons}
        {startupIcons}
      </div>
    );
  }
}

class CompareSection extends React.Component {
  render() {
    return (
      <div className="ovc-compare-company-section">
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
        <h3>Compare</h3>
      </div>
    );
  }
}

class InvestorComparePage extends React.Component {
  constructor(props) {
    super(props);

    this.COMPARING_MAX_LENGTH = 4;

    /*
     * selected: [{ id: [startup id], photoUrl: [startup image URL] }, ...]
     */
    this.state = {
      'selected': [],
      'startups': []
    };

    this.filterQuickCompare = this.filterQuickCompare.bind(this);
    this.addToCompare = this.addToCompare.bind(this);
    this.addToCompareByName = this.addToCompareByName.bind(this);
    this.removeFromCompare = this.removeFromCompare.bind(this);

    fetch('/data/investor/landscape/startups.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'startups': json });
    }); // TODO: Handle errors
  }

  filterQuickCompare(startups) {
    return startups.filter(startup => true || startup.saved || startup.pipeline);
  }

  addToCompare(id) {
    const memberIdx = this.state.startups.findIndex(startup =>
      startup.id === id
    );
    const startup = this.state.startups[memberIdx];
    const startupInSelected = this.state.selected.filter(selectedStartup =>
      selectedStartup.id === startup.id
    ).length > 0;
    if (this.state.selected.length < this.COMPARING_MAX_LENGTH
        && !startupInSelected) {
      const newState = Immutable.fromJS(this.state)
        .update('selected', selected => selected.push({
          id: startup.id,
          photoUrl: startup.photoUrl
        }));
      this.setState(newState.toJS());
    }
  }

  addToCompareByName(name) {
    const memberIdx = this.state.startups.findIndex(startup =>
      startup.name.toLowerCase() === name.toLowerCase()
    );
    if (memberIdx > -1) {
      this.addToCompare(this.state.startups[memberIdx].id);
    }
  }

  removeFromCompare(id) {
    if (this.state.selected.length > 0) {
      const newSelected = this.state.selected.filter(selected =>
        selected.id !== id
      );
      const newState = Immutable.fromJS(this.state)
        .update('selected', value => newSelected);
      this.setState(newState.toJS());
    }
  }

  render() {
    return (
      <div className="ovc-investor-compare-container">
        <SearchRow selectedStartups={this.state.selected}
                   addToCompareByName={this.addToCompareByName}
                   removeFromCompare={this.removeFromCompare}
                   COMPARING_MAX_LENGTH={this.COMPARING_MAX_LENGTH} />
        <QuickCompareRow startups={this.filterQuickCompare(this.state.startups)}
                         addToCompare={this.addToCompare} />
        <CompareSection />
      </div>
    );
  }
}

export default InvestorComparePage;
