import React from 'react';

import './home.scss';

class TeamSection extends React.Component {
  constructor(props) {
    super(props);

    // TODO: Load this from the server
    this.state = {
      "team": [{
        "firstName": "Suhail",
        "lastName": "Doshi",
        "title": "CEO, Co-founder",
        "email": "suhail@mixpanel.com",
        "photoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/000/236/372/2769b5d.jpg",
        "linkedinUrl": "https://www.linkedin.com/in/suhaildoshi"
      }, {
        "firstName": "Tim",
        "lastName": "Trefren",
        "title": "Cofounder",
        "email": "tim@mixpanel.com",
        "photoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/000/1b9/3c3/2ca072b.jpg",
        "linkedinUrl": "https://www.linkedin.com/in/timtrefren"
      }, {
        "firstName": "Stu",
        "lastName": "Aaron",
        "title": "President and COO",
        "email": "stu@mixpanel.com",
        "photoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAcKAAAAJDY5OTU4MjBmLTc1NWMtNGQ1OS1iNDQzLTQzZDg5NWQyMjVhMw.jpg",
        "linkedinUrl": "https://www.linkedin.com/in/stuaaron"
      }, {
        "firstName": "Shawn",
        "lastName": "Hansen",
        "title": "Chief Marketing Officer",
        "email": "shawn@mixpanel.com",
        "photoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAinAAAAJDg0Y2U3ODY3LThlM2UtNDQ5My1hODg5LTlmNDUxNGVjNzRhZg.jpg",
        "linkedinUrl": "https://www.linkedin.com/in/shawnha"
      }, {
        "firstName": "Joe",
        "lastName": "Xavier",
        "title": "VP Engineering",
        "email": "joe@mixpanel.com",
        "photoUrl": "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAiqAAAAJGE0ZWViMTM2LTFhMDktNDYyMC04Y2NkLThmMzBmZTk2MmZhZQ.jpg",
        "linkedinUrl": "https://www.linkedin.com/in/joexavier"
      }]
    };
  }

  render() {
    const teamMembers = this.state.team.map((member, index) =>
      <div className="ovc-team-card" key={index}>
        <img src={member.photoUrl} />
        <div>{member.firstName} {member.lastName}</div>
        <div>{member.title}</div>
        <div>{member.email}</div>
      </div>
    );

    return (
      <div className="ovc-team-section">
        {teamMembers}
      </div>
    );
  }
}

class FounderCompanyPage extends React.Component {
  render() {
    return (
      <div className="ovc-founder-main">
        <h3>Team</h3>
        <TeamSection />
        <h3>Board</h3>
        <h3>Investors</h3>
        <h3>Investments</h3>
        <h3>Pitch Decks</h3>
        <h3>KPIs</h3>
        <h3>Customers</h3>
        <h3>Documents</h3>
      </div>
    );
  }
}

export default FounderCompanyPage;
