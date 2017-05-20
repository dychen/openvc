import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

import './index.scss';

import {WebsiteHeader, WebsiteHome, WebsiteAbout, WebsiteLogin,
        WebsiteFooter} from './website/website.jsx';
import {LoginForm, SignupForm, StartupForm,
        ContactForm} from './website/login.jsx';

import FounderAppContainer from './founder/founder.jsx';
import FounderSidenav from './founder/sidenav.jsx';
import FounderTopnav from './founder/topnav.jsx';
import FounderApplyPage from './founder/apply.jsx';
import FounderFundraisingPage from './founder/fundraising.jsx';

import InvestorAppContainer from './investor/investor.jsx';
import InvestorSidenav from './investor/sidenav.jsx';
import InvestorTopnav from './investor/topnav.jsx';
//import InvestorDealPage from './investor/deals.jsx';
import InvestorLandscapePage from './investor/landscape.jsx';
import InvestorComparePage from './investor/compare.jsx';
import InvestorPorfolioPage from './investor/portfolio/portfolio.jsx';
import InvestorDealsPage from './investor/deals/deals.jsx';

import UserTablesPage from './shared/tables/tables.jsx';
import ContactsPage from './shared/contacts/contacts.jsx';
import {FounderCompanyPage, InvestorCompanyPage} from './shared/company/company.jsx';
import {UserProfilePage, ContactProfilePage} from './shared/profile/wrapper.jsx';

import RoomsApp from './rooms/rooms.jsx';

const appRoutes = [
  // Website
  {
    path: '/',
    topnav: WebsiteHeader,
    main: WebsiteHome,
    exact: true
  },
  {
    path: '/home',
    topnav: WebsiteHeader,
    main: WebsiteHome
  },
  {
    path: '/about',
    topnav: WebsiteHeader,
    main: WebsiteAbout
  },
  {
    path: '/login',
    topnav: WebsiteHeader,
    main: LoginForm,
    container: WebsiteLogin,
    exact: true
  },
  {
    path: '/signup',
    topnav: WebsiteHeader,
    main: SignupForm,
    container: WebsiteLogin,
    exact: true
  },
  {
    path: '/startup',
    topnav: WebsiteHeader,
    main: StartupForm,
    container: WebsiteLogin,
    exact: true
  },
  {
    path: '/contact',
    topnav: WebsiteHeader,
    main: ContactForm,
    container: WebsiteLogin,
    exact: true
  },
  // Founder app
  {
    path: '/founder',
    sidenav: FounderSidenav,
    main: FounderCompanyPage,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/company',
    sidenav: FounderSidenav,
    main: FounderCompanyPage,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/apply',
    sidenav: FounderSidenav,
    main: FounderApplyPage,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/fundraising',
    sidenav: FounderSidenav,
    main: FounderFundraisingPage,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/contacts',
    sidenav: FounderSidenav,
    main: ContactsPage,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/contacts/:contactId',
    sidenav: FounderSidenav,
    main: ContactProfilePage,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/rooms',
    sidenav: FounderSidenav,
    main: RoomsApp,
    container: FounderAppContainer,
    exact: true
  },
  {
    path: '/founder/profile',
    sidenav: FounderSidenav,
    main: UserProfilePage,
    container: FounderAppContainer,
    exact: true
  },
  // Investor app
  {
    path: '/investor',
    sidenav: InvestorSidenav,
    main: InvestorDealsPage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/tables',
    sidenav: InvestorSidenav,
    main: UserTablesPage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/deals',
    sidenav: InvestorSidenav,
    main: InvestorDealsPage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/landscape',
    sidenav: InvestorSidenav,
    main: InvestorLandscapePage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/compare',
    sidenav: InvestorSidenav,
    main: InvestorComparePage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/portfolio',
    sidenav: InvestorSidenav,
    main: InvestorPorfolioPage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/portfolio/:companyId',
    sidenav: InvestorSidenav,
    main: InvestorCompanyPage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/contacts',
    sidenav: InvestorSidenav,
    main: ContactsPage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/contacts/:contactId',
    sidenav: InvestorSidenav,
    main: ContactProfilePage,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/rooms',
    sidenav: InvestorSidenav,
    main: RoomsApp,
    container: InvestorAppContainer,
    exact: true
  },
  {
    path: '/investor/profile',
    sidenav: InvestorSidenav,
    main: UserProfilePage,
    container: InvestorAppContainer,
    exact: true
  },
];

const wrapRouteMainComponent = (Component, Container) => {
  if (Container) {
    return (props => (<Container><Component {...props}/></Container>));
  }
  return Component;
};

const App = (props) => {
  const sidenavRoutes = appRoutes.map((route, index) => {
    if (route.sidenav) {
      return (
        <Route key={index}
               path={route.path}
               component={route.sidenav}
               exact={route.exact} />
      );
    }
  }).filter(route => typeof route !== 'undefined');
  const topnavRoutes = appRoutes.map((route, index) => {
    if (route.topnav) {
      return (
        <Route key={index}
               path={route.path}
               component={route.topnav}
               exact={route.exact} />
      );
    }
  }).filter(route => typeof route !== 'undefined');
  const mainRoutes = appRoutes.map((route, index) => {
    if (route.main) {
      return (
        <Route key={index}
               path={route.path}
               component={wrapRouteMainComponent(route.main, route.container)}
               exact={route.exact} />
      );
    }
  }).filter(route => typeof route !== 'undefined');

  return (
    <HashRouter>
      <div className="ovc-app-container">
        {sidenavRoutes}
        <div className="ovc-right-container">
          {topnavRoutes}
          {mainRoutes}
        </div>
      </div>
    </HashRouter>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

