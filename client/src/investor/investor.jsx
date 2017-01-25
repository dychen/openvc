import React from 'react';

import './investor.scss';

class InvestorAppContainer extends React.Component {
  render() {
    return (
      <div className="ovc-investor-main">
        {this.props.children}
      </div>
    );
  }
}

export default InvestorAppContainer;

