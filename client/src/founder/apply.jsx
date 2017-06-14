import React from 'react';
import Immutable from 'immutable';
import {Link} from 'react-router-dom';
import 'whatwg-fetch';

import './apply.scss';
import {Subnav, SubnavButton, SubnavFilters,
        filterData} from '../components/subnav.jsx';
import FounderApplication from './application.jsx';

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
      filterTags: [],
      investors: []
    };

    this.updateFilterTags = this.updateFilterTags.bind(this);
    this.toggleApply = this.toggleApply.bind(this);

    fetch('/data/founder/apply/investors.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'investors': json });
    }); // TODO: Handle errors
  }

  updateFilterTags(filterTags) {
    this.setState({ filterTags: filterTags });
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
    const filterList = ['name', 'location'].map(k => {
      return { key: k, display: `Filter by ${k}` };
    });

    return (
      <div className="ovc-founder-apply-container ovc-subnav-view-container">
        <Subnav title="Menu">
          <Link to="/founder/application">
            <SubnavButton text="Update App"
                          iconClass="ion-compose" />
          </Link>
          <SubnavFilters filterList={filterList}
                         onUpdate={this.updateFilterTags} />
        </Subnav>
        <ApplySection investors={filterData(this.state.investors,
                                            this.state.filterTags)}
                      toggleApply={this.toggleApply} />
      </div>
    );
  }
}

export default FounderApplyPage;
