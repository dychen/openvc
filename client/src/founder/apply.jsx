import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './apply.scss';

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
      <div className="ovc-apply-search-menu">
        <label>Search for an investor</label>
        <input type="text" name="name" value={this.props.filters.name}
               onChange={this.props.updateFilter} />
        <label>Amount raising</label>
        <input type="text" name="checkSize" value={this.props.filters.checkSize}
               onChange={this.props.updateFilter} />
        <label>Location</label>
        <input type="text" name="location" value={this.props.filters.location}
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

class ApplySection extends React.Component {
  render() {
    const investors = this.props.investors.map((investor, index) => {
      const checkButton = (
        investor.applied
        ? <i className="ion-ios-checkmark-outline" />
        : <i className="ion-ios-plus-outline" />
      );
      return (
        <div className="ovc-investor-panel" key={index} id={investor.id}
             onClick={this.props.toggleApply}>
          <img className="investor-logo" src={investor.photoUrl} />
          <div className="ovc-investor-text">
            <div>
              <span className="investor-name">{investor.name}</span>
              <span>{investor.location}</span>
              <span>{investor.checkMin} - {investor.checkMax}</span>
            </div>
            <div>{investor.partners.join(', ')}</div>
            <div className="investor-tags">{investor.tags.join(', ')}</div>
          </div>
          <div className="has-applied">
            {checkButton}
          </div>
        </div>
      );
    });

    return (
      <div className="ovc-apply-investor-list">
        {investors}
      </div>
    );
  }
}

class FounderApplyPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'filters': {
        'name': '',
        'checkSize': '',
        'location': '',
        'tags': []
      },
      'investors': []
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.addFilterTag = this.addFilterTag.bind(this);
    this.removeFilterTag = this.removeFilterTag.bind(this);
    this.filterInvestors = this.filterInvestors.bind(this);
    this.toggleApply = this.toggleApply.bind(this);

    fetch('/data/founder/apply/investors.json').then(function(response) {
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

  filterInvestors(investors) {
    const filterTags = new Set(this.state.filters.tags.map(tag =>
      tag.toLowerCase()
    ));
    return investors.filter((investor, index) => {
      const nameMatch = investor.name.toLowerCase()
        .indexOf(this.state.filters.name.toLowerCase()) > -1;
      const locationMatch = investor.location.toLowerCase()
        .indexOf(this.state.filters.location.toLowerCase()) > -1;
      // Match both no tags or if there is at least one common tag
      const investorTags = investor.tags.map(tag => tag.toLowerCase());
      const tagsMatch = (
        filterTags.size === 0
        || investorTags.filter(tag => filterTags.has(tag)).length > 0
      );
      return nameMatch && locationMatch && tagsMatch;
    });
  }

  toggleApply(e) {
    const memberIdx = this.state.investors.findIndex(investor =>
      investor.id === Number(e.currentTarget.id)
    );
    const newState = Immutable.fromJS(this.state)
      .updateIn(['investors', memberIdx, 'applied'], value => !value);
    this.setState(newState.toJS());
  }

  render() {
    return (
      <div className="ovc-founder-apply-container">
        <SearchSection filters={this.state.filters}
                       updateFilter={this.updateFilter}
                       addFilterTag={this.addFilterTag}
                       removeFilterTag={this.removeFilterTag} />
        <ApplySection investors={this.filterInvestors(this.state.investors)}
                      toggleApply={this.toggleApply} />
      </div>
    );
  }
}

export default FounderApplyPage;
