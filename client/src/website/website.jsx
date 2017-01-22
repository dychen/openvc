import React from 'react';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'

import './website.scss';

class WebsiteHeader extends React.Component {
  render() {
    return (
      <div className="ovc-website-header">
        <div className="ovc-header-left">
          <span className="ovc-header-item logo">OpenVC</span>
          <Link to="/home">
            <span className="ovc-header-item button hvr-fade">Home</span>
          </Link>
          <Link to="/about">
            <span className="ovc-header-item button hvr-fade">About</span>
          </Link>
        </div>

        <div className="ovc-header-right">
          <span className="ovc-header-item text">I am a...</span>
          <Link to="/apply">
            <span className="ovc-header-item button hvr-fade">Founder</span>
          </Link>
          <span className="ovc-header-item button hvr-fade">Investor</span>
        </div>
      </div>
    );
  }
}

class WebsiteHome extends React.Component {
  render() {
    return (
      <div className="ovc-website-body home">
      </div>
    );
  }
}

class WebsiteAbout extends React.Component {
  render() {
    return (
      <div className="ovc-website-body about">
      </div>
    );
  }
}

class ApplyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    const results = {
      "organizations": [{"current": true, "startDate": "2014-06", "company": "Andreessen Horowitz", "title": "Partner"}],
      "firstName": "Daniel",
      "lastName": "Chen",
      "photoUrl": "https://d2ojpxxtu63wzl.cloudfront.net/static/baf6ef16e6e31945b7a803ae5b03bc8a_9e32644b2952ccda448b3c1d20feefad604e483466e63499b30dae94a4e3fca5",
      "linkedinUrl": "https://www.linkedin.com/in/danielyoungchen",
      "location": null,
      "gender": null
    };
    this.setState({
      firstName: results.firstName,
      lastName: results.lastName
    });
    return;
  }

  render() {
    return (
      <div className="apply-form" onSubmit={this.handleSubmit}>
        <label>Tell us about yourself</label>
        <label>First Name: {this.state.firstName}</label>
        <input type="text" name="firstName" value={this.state.firstName}
               onChange={this.handleChange} />
        <label>Last Name: {this.state.lastName}</label>
        <input type="text" name="lastName" value={this.state.lastName}
               onChange={this.handleChange} />
        <label>Email: {this.state.email}</label>
        <input type="text" name="email" value={this.state.email}
               onChange={this.handleChange} />
        <Link to="/apply/contact">
          <div className="apply-submit" onClick={this.handleSubmit}>
            Submit
          </div>
        </Link>
      </div>
    );
  }
}

class ContactForm extends React.Component {
  render() {
    return (
      <div></div>
    );
  }
}

class WebsiteApply extends React.Component {
  render() {
    return (
      <div className="ovc-website-body apply">
        <div className="apply-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}

class WebsiteFooter extends React.Component {
  render() {
    return (
      <div></div>
    );
  }
}

class WebsiteView extends React.Component {
  render() {
    return (
      <div className="ovc-website-container">
        <WebsiteHeader />
        {this.props.children}
        <WebsiteFooter />
      </div>
    );
  }
}

class WebsiteApp extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={WebsiteView}>
          <IndexRoute component={WebsiteHome} />
          <Route path="home" component={WebsiteHome} />
          <Route path="about" component={WebsiteAbout} />
          <Route path="apply" component={WebsiteApply}>
            <IndexRoute component={ApplyForm} />
            <Route path="basic" component={ApplyForm} />
            <Route path="contact" component={ContactForm} />
          </Route>
        </Route>
      </Router>
    );
  }
}

export default WebsiteApp;
