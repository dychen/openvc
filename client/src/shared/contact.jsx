import React from 'react';
import Immutable from 'immutable';
import {authFetch, preprocessJSON} from '../utils/api.js';

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

    const contactId = this.props.params.contactId;
    authFetch(`${SERVER_URL}/api/v1/contacts/self/${contactId}`)
      .then(function(response) {
        return response.json();
      }).then(json => {
        json = preprocessJSON(json);
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
    const interactions = this.state.contact.interactions.map(interaction =>
      (
        <tr key={interaction.id}>
          <td>{interaction.date}</td>
          <td>{interaction.label}</td>
          <td>{interaction.user}</td>
          <td>
            <i className="ion-ios-close remove-interaction" />
          </td>
        </tr>
      )
    );

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
        <div className="profile-info-section profile-interactions-container">
          <table>
            <thead>
              <tr><td colSpan="4">Interaction History</td></tr>
            </thead>
            <tbody>
              {interactions}
              <tr>
                <td className="add-interaction" colSpan="4">
                  <i className="ion-plus" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default ContactPage;

