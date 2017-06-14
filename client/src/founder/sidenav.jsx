import React from 'react';
import {Sidenav} from '../components/sidenav.jsx';

const FounderSidenav = (props) => {
  const ITEMS = [
    { link: '/founder/company', icon: 'ion-speedometer',
      title: 'Company', subtext: 'Your company data' },
    { link: '/founder/apply', icon: 'ion-android-checkmark-circle',
      title: 'Apply', subtext: 'Apply for funding' },
    { link: '/founder/fundraising', icon: 'ion-cash',
      title: 'Fundraising', subtext: 'Fundraising status' },
    { link: '/founder/benchmarking', icon: 'ion-stats-bars',
      title: 'Benchmarking', subtext: 'Compare your metrics' },
    { link: '/founder/contacts', icon: 'ion-ios-people',
      title: 'Contacts', subtext: 'Connect to your network' },
    { link: '/founder/rooms', icon: 'ion-chatbubbles',
      title: 'Rooms', subtext: 'Chat with your network' },
    { link: '/founder/profile', icon: 'ion-android-person',
      title: 'Profile', subtext: 'Your profile page' },
    { link: '/founder/apis', icon: 'ion-network',
      title: 'APIs', subtext: 'Manage data sources' },
    { link: '/founder/access', icon: 'ion-lock-combination',
      title: 'Access', subtext: 'Manage user access' },
  ];
  return <Sidenav ITEMS={ITEMS} />
}

export default FounderSidenav;

