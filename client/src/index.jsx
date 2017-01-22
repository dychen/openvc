import React from 'react';
import ReactDOM from 'react-dom';

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

import './index.scss';

import WebsiteApp from './website/website.jsx';

ReactDOM.render(
  <WebsiteApp />,
  document.getElementById('app')
);

