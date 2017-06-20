import React from 'react';
import {Sidenav} from '../components/sidenav.jsx';

const InvestorSidenav = (props) => {
  const ITEMS = [
    { link: '/investor/tables', icon: 'ion-easel',
      title: 'Tables', subtext: 'Build custom sheets' },
    { link: '/investor/discovery', icon: 'ion-earth',
      title: 'Discovery', subtext: 'Source new deals' },
    { link: '/investor/deals', icon: 'ion-ios-pulse',
      title: 'Pipeline', subtext: 'Manage incoming deals' },
    { link: '/investor/portfolio', icon: 'ion-arrow-graph-up-right',
      title: 'Portfolio', subtext: 'Manage investments' },
    { link: '/investor/compare', icon: 'ion-podium',
      title: 'Compare', subtext: 'Compare potential leads' },
    { link: '/investor/contacts', icon: 'ion-ios-people',
      title: 'Contacts', subtext: 'Connect to your network' },
    { link: '/investor/rooms', icon: 'ion-chatbubbles',
      title: 'Rooms', subtext: 'Chat with your network' },
    { link: '/investor/profile', icon: 'ion-android-person',
      title: 'Profile', subtext: 'Your profile page' },
    { link: '/investor/apis', icon: 'ion-network',
      title: 'APIs', subtext: 'Manage data sources' },
    { link: '/investor/access', icon: 'ion-lock-combination',
      title: 'Access', subtext: 'Manage user access' },
  ];
  return <Sidenav ITEMS={ITEMS} />
}

export default InvestorSidenav;
