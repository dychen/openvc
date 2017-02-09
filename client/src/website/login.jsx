import React from 'react';
import {Link, hashHistory} from 'react-router';
import 'whatwg-fetch';
import {storeToken} from '../utils/auth.js';

import './login.scss';

/*
 * TODO: Add validators and required fields
 */

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    fetch(SERVER_URL + '/api/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.email,
        password: this.state.password,
      })
    }).then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses:
          /*
           * {
           *   'username': ['This field may not be blank.'],
           *   'password': ['This field may not be blank.'],
           *   'non_field_errors': ['Unable to log in with provided
           *                         credentials.']
           * }
           */
          throw new Error('Unable to log in');
        });
      }
    }).then(json => {
      // TODO: Store token
      storeToken(json.token);
      hashHistory.push('/founder');
      return;
    }).catch(err => {
      return err;
    });
  }

  render() {
    return (
      <div className="basic-form login" onSubmit={this.handleSubmit}>
        <label>Email:</label>
        <input type="text" name="email" value={this.state.email}
               onChange={this.handleChange} />
        <label>Password:</label>
        <input type="password" name="password" value={this.state.password}
               onChange={this.handleChange} />
        <div className="basic-submit" onClick={this.handleSubmit}>
          Log In
        </div>

        <label>Don't have an account?</label>
        <Link to="/login/signup">
          <div className="basic-submit">Sign Up</div>
        </Link>
      </div>
    );
  }
}

class SignupForm extends React.Component {
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
    /* TODO: Call backend and update state */
    return;
  }

  render() {
    return (
      <div className="basic-form" onSubmit={this.handleSubmit}>
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
        <label>Password:</label>
        <input type="password" name="password" value={this.state.password} />
        <label>Password (again):</label>
        <input type="password" name="passwordConfirmation"
               value={this.state.passwordConfirmation} />
        <Link to="/login/startup">
          <div className="basic-submit" onClick={this.handleSubmit}>
            Submit
          </div>
        </Link>
      </div>
    );
  }
}

class StartupForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'company': '',
      'location': '',
      'website': ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div className="basic-form" onSubmit={this.handleSubmit}>
        <label>Tell us about your company</label>
        <label>Company: {this.state.company}</label>
        <input type="text" name="company" value={this.state.company}
               onChange={this.handleChange} />
        <label>Address: {this.state.location}</label>
        <input type="text" name="location" value={this.state.location}
               onChange={this.handleChange} />
        <label>Website: {this.state.website}</label>
        <input type="text" name="website" value={this.state.website}
               onChange={this.handleChange} />
        <Link to="/login/contact">
          <div className="basic-submit" onClick={this.handleSubmit}>
            Submit
          </div>
        </Link>
      </div>
    );
  }
}

class ContactForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "firstName": "Daniel",
      "lastName": "Chen",
      "email": "daniel@a16z.com",
      "photoUrl": "https://d2ojpxxtu63wzl.cloudfront.net/static/" +
                  "baf6ef16e6e31945b7a803ae5b03bc8a_9e32644b2952ccda448b3c1d" +
                  "20feefad604e483466e63499b30dae94a4e3fca5",
      "linkedinUrl": "https://www.linkedin.com/in/danielyoungchen",
      "location": "San Francisco, California",
      "gender": null,
      "organizations": [{
        "current": true,
        "startDate": "2014-06",
        "company": "Andreessen Horowitz",
        "title": "Partner"
      }]
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div className="contact-form" onSubmit={this.handleSubmit}>
        <label>Is this you?</label>
        <div className="contact-profile row">
          <div className="col-md-6">
            <img src={this.state.photoUrl}></img>
          </div>
          <div className="col-md-6">
            <div>First Name: {this.state.firstName}</div>
            <div>Last Name: {this.state.lastName}</div>
            <div>Email: {this.state.email}</div>
            <div>LinkedIn: {this.state.linkedinUrl}</div>
            <div>Location: {this.state.location}</div>
          </div>
        </div>
        <div className="contact-organizations">
        </div>
      </div>
    );
  }
}

export {LoginForm, SignupForm, StartupForm, ContactForm};
