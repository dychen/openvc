import React from 'react';
import Immutable from 'immutable';
import {Link} from 'react-router-dom';

import './application.scss';

class FounderApplication extends React.Component {
  render() {
    return (
      <div className="ovc-founder-application">
        <div className="founder-application-cancel">
          <Link to="/founder/apply">
            <i className="ion-android-close" />
          </Link>
        </div>
        <div className="founder-application-header">
          Welcome to the investment application
        </div>
      </div>
    );
  }
}

export default FounderApplication;
