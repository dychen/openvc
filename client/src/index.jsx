import React from 'react';
import ReactDOM from 'react-dom';

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

import './index.scss';

import WebsiteView from './website/website.jsx';

ReactDOM.render(
  <WebsiteView />,
  document.getElementById('app')
);

