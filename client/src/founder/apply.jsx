import React from 'react';
import Immutable from 'immutable';

import './apply.scss';

class SearchSection extends React.Component {
  render() {
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
        <input type="text" name="tags" />
      </div>
    );
  }
}

class ApplySection extends React.Component {
  render() {
    const investors = this.props.investors.map((investor, index) => {
      const checkButton = (investor.applied
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
      'investors': [{
        'id': 1,
        'name': 'Andreessen Horowitz',
        'photoUrl': 'https://pbs.twimg.com/profile_images/487366765106565120/jGvHRW6p.png',
        'location': 'Menlo Park, CA',
        'checkMin': '$1M',
        'checkMax': '$100M',
        'partners': ['Marc Andreessen', 'Ben Horowitz', 'Jeff Jordan',
                     'Peter Levine'],
        'tags': ['Seed', 'Venture', 'Growth', 'California', 'Palo Alto',
                 'Software', 'Mobile', 'Payments', 'Drones', 'Virtual Reality',
                 'Bitcoin'],
        'applied': true
      }, {
        'id': 2,
        'name': 'Sequoia Capital',
        'photoUrl': 'https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAazAAAAJDZlZmE0MzIzLTYzNmItNDg4Ny1hYjVmLTgyMGUwYzM0Nzc1Zg.png',
        'location': 'Menlo Park, CA',
        'checkMin': '$5M',
        'checkMax': '$100M',
        'partners': ['Michael Moritz', 'Doug Leone', 'Don Valentine',
                     'Jim Goetz', 'Alfred Lin'],
        'tags': ['Seed', 'Venture', 'Growth', 'California', 'Palo Alto',
                 'Software', 'Mobile', 'Data', 'Analytics', 'Machine Learning',
                 'Hardware'],
        'applied': false
      }, {
        'id': 3,
        'name': 'Y-Combinator',
        'photoUrl': 'https://www.ycombinator.com/images/ycombinator-logo-fb889e2e.png',
        'location': 'Mountain View, CA',
        'checkMin': '$50K',
        'checkMax': '$500K',
        'partners': ['Sam Altman', 'Paul Graham'],
        'tags': ['Seed', 'California', 'Software', 'Mobile', 'Data', 'Hardware'],
        'applied': false
      }, {
        'id': 4,
        'name': 'Greylock Partners',
        'photoUrl': 'https://pbs.twimg.com/profile_images/488805819744391168/WtmSJ00E_400x400.png',
        'location': 'San Francisco, CA',
        'checkMin': '$5M',
        'checkMax': '$50M',
        'partners': ['David Sze', 'Bill Helman', 'Reid Hoffman', 'John Lilly'],
        'tags': ['Venture', 'Growth', 'California', 'Software', 'Social',
                 'Mobile', 'Data', 'Hardware', 'Infrastructure'],
        'applied': false
      }, {
        'id': 5,
        'name': 'Accel Partners',
        'photoUrl': 'https://pbs.twimg.com/profile_images/793210822759583744/HygDDToa.jpg',
        'location': 'Palo Alto, CA',
        'checkMin': '$50K',
        'checkMax': '$500K',
        'partners': ['Rich Wong', 'Miles Clements', 'Sameer Gandhi', 'Kevin Efrusy'],
        'tags': ['Venture', 'Growth', 'California', 'Social', 'Mobile', 'Data',
                 'Software'],
        'applied': false
      }, {
        'id': 6,
        'name': 'Social+Capital',
        'photoUrl': 'https://pbs.twimg.com/profile_images/651210970136637440/0-XZfKUN.png',
        'location': 'Palo Alto, CA',
        'checkMin': '$50K',
        'checkMax': '$50M',
        'partners': ['Chamath Palihapitiya', 'Mamoon Hamid', 'Ted Maidenberg'],
        'tags': ['Seed', 'Venture', 'Growth', 'California', 'Software',
                 'Social', 'Mobile', 'Data', 'Analytics'],
        'applied': false
      }]
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.filterInvestors = this.filterInvestors.bind(this);
    this.toggleApply = this.toggleApply.bind(this);
  }

  updateFilter(e) {
    const newState = Immutable.fromJS(this.state)
      .updateIn(['filters', e.target.name], value => e.target.value);
    this.setState(newState.toJS());
  }

  filterInvestors(investors) {
    return investors.filter((investor, index) => {
      const nameMatch = investor.name.toLowerCase()
        .indexOf(this.state.filters.name.toLowerCase()) > -1;
      const locationMatch = investor.location.toLowerCase()
        .indexOf(this.state.filters.location.toLowerCase()) > -1;
      return nameMatch && locationMatch;
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
                       updateFilter={this.updateFilter} />
        <ApplySection investors={this.filterInvestors(this.state.investors)}
                      toggleApply={this.toggleApply} />
      </div>
    );
  }
}

export default FounderApplyPage;
