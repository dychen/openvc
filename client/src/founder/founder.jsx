import React from 'react';

import './founder.scss';

class FounderAppContainer extends React.Component {
  render() {
    return (
      <div className="ovc-founder-main">
        {this.props.children}
      </div>
    );
  }
}

export default FounderAppContainer;
