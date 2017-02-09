import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './contact.scss';

class ContactPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contact: {
        firstName: '',
        lastName: '',
        title: '',
        company: '',
        location: '',
        email: '',
        linkedin: '',
        experience: [],
        interactions: []
      }
    }

    /* TODO - query by this.props.params.contactId */
    fetch('/data/shared/contact/contact.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'contact': json });
    }); // TODO: Handle errors
  }

  render() {
    const experience = this.state.contact.experience.map(exp => {
      const endDate = exp.endDate ? exp.endDate : 'present';
      return (
        <div className="profile-info-subsection" key={exp.id}>
          <div>
            {exp.title}&nbsp;at&nbsp;{exp.company}
          </div>
          <div className="light italic">
            {exp.location}&nbsp;({exp.startDate}&nbsp;-&nbsp;{exp.endDate})
          </div>
          <div className="light">
            {exp.notes}
          </div>
        </div>
      );
    });

    return (
      <div className="ovc-shared-profile-container">
        <div className="profile-picture-container">
          <img src={this.state.contact.photoUrl} />
        </div>
        <div className="profile-info-section profile-basic-info-section">
          <div className="bold">
            {this.state.contact.firstName}
            &nbsp;
            {this.state.contact.lastName}
          </div>
          <div>
            {this.state.contact.title}
          </div>
          <div>
            {this.state.contact.company}
          </div>
          <div className="light">
            {this.state.contact.location}
          </div>
          <div className="light">
            {this.state.contact.email}
          </div>
          <div className="light">
            {this.state.contact.linkedin}
          </div>
        </div>
        <div className="profile-info-section profile-experience-container">
          {experience}
        </div>
      </div>
    );
  }
}

export default ContactPage;

