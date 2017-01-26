import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './landscape.scss';

class SearchSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'tagInput': ''
    }

    this.handleTagChange = this.handleTagChange.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
  }

  handleTagChange(e) {
    this.setState({ tagInput: e.currentTarget.value });
  }

  addFilterTag(e) {
    if (e.key === 'Enter') {
      const tag = e.currentTarget.value.trim();
      this.setState({ tagInput: '' });
      this.props.addFilterTag(tag);
    }
  }

  render() {
    const tags = this.props.filters.tags.map((tag, index) => {
      return (
        <div className="filter-tag" key={index} id={index}
             onClick={this.props.removeFilterTag}>
          <div className="filter-close">
            <i className="ion-ios-close-empty" />
          </div>
          {tag}
        </div>
      );
    });

    return (
      <div className="ovc-landscape-search-menu">
        <label>Search for a startup</label>
        <input type="text" name="name" value={this.props.filters.name}
               onChange={this.props.updateFilter} />
        <label>Last Round</label>
        <input type="text" name="lastRound" value={this.props.filters.lastRound}
               onChange={this.props.updateFilter} />
        <label>Add a search tag</label>
        <input type="text" name="tags" value={this.state.tagInput}
               onChange={this.handleTagChange}
               onKeyPress={this.addFilterTag} />
        {tags}
      </div>
    );
  }
}

class StartupPanel extends React.Component {
  render() {
    const startup = this.props.startup;
    const lastRoundStr = [
      startup.lastRound.name,
      startup.lastRound.valuation,
      startup.lastRound.date
    ].filter(e => e).join(', ');
    const totalRaised = (
      startup.totalRaised ? '(' + startup.totalRaised + ' raised)' : ''
    );
    if (this.props.section === 'all' || this.props.section === 'saved') {
      const actionButton = (
        startup.saved
        ? <i className="ion-ios-minus-outline save-button" />
        : <i className="ion-ios-plus-outline save-button" />
      );
      var logoDiv = (
        <div className="logo-container save-startup" id={startup.id}
             onClick={this.props.toggleSaveStartup} >
          <img className="company-logo" src={startup.photoUrl} />
          {actionButton}
        </div>
      );
    }
    else {
      var logoDiv = (
        <div className="logo-container">
          <img className="company-logo" src={startup.photoUrl} />
        </div>
      );
    }

    return (
      <div className="ovc-investor-landscape-panel">
        {logoDiv}
        <div className="startup-text">
          <div>
            {startup.name} {totalRaised}
          </div>
          <div>
            Last Round: {lastRoundStr}
          </div>
          <div>
            Investors: {startup.investors.join(', ')}
          </div>
        </div>
      </div>
    );
  }
}

class PipelineStartupsSection extends React.Component {
  render() {
    const startups = this.props.startups.map(startup =>
      (<StartupPanel key={startup.id}
                     startup={startup}
                     section="pipeline" />)
    );

    return (
      <div className="ovc-landscape-startups-section col-lg-4">
        <h3>In The Pipe</h3>
        {startups}
      </div>
    );
  }
}

class SavedStartupsSection extends React.Component {
  render() {
    const startups = this.props.startups.map(startup =>
      (<StartupPanel startup={startup} key={startup.id}
                     section="saved"
                     toggleSaveStartup={this.props.toggleSaveStartup} />)
    );

    return (
      <div className="ovc-landscape-startups-section col-lg-4">
        <h3>Saved</h3>
        {startups}
      </div>
    );
  }
}

class AllStartupsSection extends React.Component {
  render() {
    const startups = this.props.startups.map(startup =>
      (<StartupPanel startup={startup} key={startup.id}
                     section="all"
                     toggleSaveStartup={this.props.toggleSaveStartup} />)
    );

    return (
      <div className="ovc-landscape-startups-section col-lg-4">
        <h3>All</h3>
        {startups}
      </div>
    );
  }
}

class InvestorLandscapePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'filters': {
        'name': '',
        'lastRound': '',
        'tags': []
      },
      'startups': []
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
    this.filterSearchMenu = this.filterSearchMenu.bind(this);
    this.filterSavedStartups = this.filterSavedStartups.bind(this);
    this.toggleSaveStartup = this.toggleSaveStartup.bind(this);

    fetch('/data/investor/landscape/startups.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'startups': json });
    }); // TODO: Handle errors
  }

  updateFilter(e) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filters', e.target.name], value => e.target.value);
    this.setState(newState.toJS());
  }

  addFilterTag(tag) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filters', 'tags'], tags => tags.push(tag));
    this.setState(newState.toJS());
  }

  removeFilterTag(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newTags = this.state.filters.tags.filter((tag, index) =>
      index !== memberIdx
    );
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filters', 'tags'], value => newTags);
    this.setState(newState.toJS());
  }

  filterSearchMenu(startups) {
    const filterTags = new Set(this.state.filters.tags.map(tag =>
      tag.toLowerCase()
    ));
    return startups.filter((startup, index) => {
      const nameMatch = startup.name.toLowerCase()
        .indexOf(this.state.filters.name.toLowerCase()) > -1;
      const lastRoundMatch = startup.lastRound.name.toLowerCase()
        .indexOf(this.state.filters.lastRound.toLowerCase()) > -1;
      // Match both no tags or if all tags match
      const startupTags = startup.tags.map(tag => tag.toLowerCase());
      const tagsMatch = (
        filterTags.size === 0
        || (startupTags.filter(tag => filterTags.has(tag)).length
            === filterTags.size)
      );
      return nameMatch && lastRoundMatch && tagsMatch;
    });
  }

  filterPipelineStartups(startups) {
    return startups.filter(startup => startup.pipeline);
  }

  filterSavedStartups(startups) {
    return startups.filter(startup => startup.saved && !startup.pipeline);
  }

  filterAllStartups(startups) {
    return startups.filter(startup => !startup.saved && !startup.pipeline);
  }

  toggleSaveStartup(e) {
    const memberIdx = this.state.startups.findIndex(startup =>
      startup.id === Number(e.currentTarget.id)
    );
    const newState = Immutable.fromJS(this.state)
      .updateIn(['startups', memberIdx, 'saved'], value => !value);
    this.setState(newState.toJS());
  }

  render() {
    // TODO: Change column ordering on smaller device widths
    return (
      <div className="ovc-investor-landscape-container">
        <SearchSection filters={this.state.filters}
                       updateFilter={this.updateFilter}
                       addFilterTag={this.addFilterTag}
                       removeFilterTag={this.removeFilterTag} />
        <div className="ovc-landscape-startups-container row">
          <AllStartupsSection startups={this.filterSearchMenu(
                                        this.filterAllStartups(
                                        this.state.startups))}
                              toggleSaveStartup={this.toggleSaveStartup} />
          <SavedStartupsSection startups={this.filterSavedStartups(
                                          this.state.startups)}
                                toggleSaveStartup={this.toggleSaveStartup} />
          <PipelineStartupsSection startups={this.filterPipelineStartups(
                                             this.state.startups)}
                                   toggleSaveStartup={this.toggleSaveStartup} />
        </div>
      </div>
    );
  }
}

export default InvestorLandscapePage;
