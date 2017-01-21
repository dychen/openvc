import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'

import Bootstrap from 'bootstrap/dist/css/bootstrap.css';

import './index.scss';

import WebsiteApp from './website/website.jsx';

ReactDOM.render(
  <WebsiteApp />,
  document.getElementById('app')
);

