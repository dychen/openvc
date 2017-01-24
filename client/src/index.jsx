import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, Link, hashHistory} from 'react-router';

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

import './index.scss';

import {WebsiteHeader, WebsiteHome, WebsiteAbout, WebsiteLogin, WebsiteFooter,
        WebsiteApp} from './website/website.jsx';
import {LoginForm, SignupForm, StartupForm,
        ContactForm} from './website/login.jsx';

import FounderAppContainer from './founder/founder.jsx';
import FounderSidenav from './founder/sidenav.jsx';
import FounderTopnav from './founder/topnav.jsx';
import FounderCompanyPage from './founder/company.jsx';
import FounderApplyPage from './founder/apply.jsx';


class AppContainer extends React.Component {
  render() {
    const {main, topnav, sidenav} = this.props;

    return (
      <div className="ovc-app-container">
        {sidenav}
        <div className="ovc-right-container">
          {topnav}
          {main}
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={AppContainer}>
          <IndexRoute components={{main: WebsiteHome,
                                   topnav: WebsiteHeader}} />
          <Route path="home" components={{main: WebsiteHome,
                                          topnav: WebsiteHeader}} />
          <Route path="about" components={{main: WebsiteAbout,
                                           topnav: WebsiteHeader}} />
          <Route path="login" components={{main: WebsiteLogin,
                                           topnav: WebsiteHeader}}>
            <IndexRoute component={LoginForm} />
            <Route path="signup" components={SignupForm} />
            <Route path="startup" components={StartupForm} />
            <Route path="contact" components={ContactForm} />
          </Route>

          <Route path="founder" components={{main: FounderAppContainer,
                                             topnav: FounderTopnav,
                                             sidenav: FounderSidenav}}>
            <IndexRoute component={FounderCompanyPage} />
            <Route path="company" component={FounderCompanyPage} />
            <Route path="apply" component={FounderApplyPage} />
          </Route>
        </Route>
      </Router>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

