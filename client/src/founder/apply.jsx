import React from 'react';
import Immutable from 'immutable';

import './apply.scss';

class SearchMenu extends React.Component {

}

class ApplySection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'investors': [{
        'name': 'Andreessen Horowitz',
        'photoUrl': 'https://pbs.twimg.com/profile_images/487366765106565120/jGvHRW6p.png',
        'location': 'Palo Alto, CA',
        'checkMin': '$1M',
        'checkMax': '$100M',
        'partners': ['Marc Andreessen', 'Ben Horowitz', 'Jeff Jordan',
                     'Peter Levine'],
        'tags': ['Seed', 'Venture', 'Growth', 'California', 'Palo Alto',
                 'Software', 'Mobile', 'Payments', 'Drones', 'Virtual Reality',
                 'Bitcoin'],
        'applied': true
      }, {
        'name': 'Sequoia Capital',
        'photoUrl': 'https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAazAAAAJDZlZmE0MzIzLTYzNmItNDg4Ny1hYjVmLTgyMGUwYzM0Nzc1Zg.png',
        'location': 'Palo Alto, CA',
        'checkMin': '$1M',
        'checkMax': '$100M',
        'partners': ['Michael Moritz', 'Doug Leone', 'Don Valentine',
                     'Jim Goetz', 'Alfred Lin'],
        'tags': ['Seed', 'Venture', 'Growth', 'California', 'Palo Alto',
                 'Software', 'Mobile', 'Data', 'Analytics', 'Machine Learning',
                 'Hardware'],
        'applied': false
      }, {
        'name': 'Y-Combinator',
        'photoUrl': 'https://www.ycombinator.com/images/ycombinator-logo-fb889e2e.png',
        'location': 'Mountain View, CA',
        'checkMin': '$50K',
        'checkMax': '$500K',
        'partners': ['Sam Altman', 'Paul Graham'],
        'tags': ['Seed', 'California', 'Software', 'Mobile', 'Data', 'Hardware'],
        'applied': false
      }]
    };

    this.toggleApply = this.toggleApply.bind(this);
  }

  toggleApply(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .updateIn(['investors', memberIdx, 'applied'], value => !value);
    this.setState(newState.toJS());
  }

  render() {
    const investors = this.state.investors.map((investor, index) => {
      const checkButton = (investor.applied
        ? <i className="ion-ios-checkmark-outline" />
        : <i className="ion-ios-plus-outline" />
      );
      return (
        <div className="ovc-investor-panel" key={index} id={index}
             onClick={this.toggleApply}>
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
  render() {
    return (
      <div>
        <ApplySection />
      </div>
    );
  }
}

export default FounderApplyPage;
