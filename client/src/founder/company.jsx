import React from 'react';
import Immutable from 'immutable';
import 'whatwg-fetch';

import './company.scss';

class TeamSection extends React.Component {
  constructor(props) {
    super(props);

    // TODO: Load this from the server
    this.state = {
      'team': []
    };

    this.editCard = this.editCard.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.addCard = this.addCard.bind(this);
    this.removeCard = this.removeCard.bind(this);

    fetch('/data/founder/company/team.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'team': json });
    }); // TODO: Handle errors
  }

  editCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .update('team', teamMembers =>
        teamMembers.map((teamMember, index) => {
          if (index === memberIdx)
            return teamMember.update('editing', value => true);
          else
            return teamMember.update('editing', value => false);
        })
      )
    this.setState(newState.toJS());
  }

  handleFieldChange(e) {
    const memberIdx = Number(e.currentTarget.id);
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    const newState = Immutable.fromJS(this.state)
      .updateIn(['team', memberIdx, fieldName], value => fieldValue);
    this.setState(newState.toJS());
  }

  saveCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .updateIn(['team', memberIdx, 'editing'], value => false);
    this.setState(newState.toJS());
  }

  addCard(e) {
    /* Get user out of edit mode for existing cards */
    const newState = Immutable.fromJS(this.state)
      .update('team', teamMembers =>
        teamMembers.map((teamMember, index) => {
          return teamMember.update('editing', value => false);
        })
      );
    const appendedState = newState.update('team', teamMembers =>
      teamMembers.push({
        "firstName": "",
        "lastName": "",
        "title": "",
        "email": "",
        "photoUrl": "",
        "linkedinUrl": "",
        "editing": true
      })
    );
    this.setState(appendedState.toJS());
  }

  removeCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .get('team').filter((teamMembers, index) =>
        index !== memberIdx
      );
    this.setState({ team: newState.toJS() });
  }

  render() {
    const teamMembers = this.state.team.map((member, index) => {
      if (member.editing) {
        return (
          <div className="ovc-team-card edit" key={index}>
            <input type="text" name="firstName" id={index}
                   value={member.firstName} onChange={this.handleFieldChange}
                   placeholder="First name, e.g. John" />
            <input type="text" name="lastName" id={index}
                   value={member.lastName} onChange={this.handleFieldChange}
                   placeholder="Last name, e.g. Doe" />
            <input type="text" name="title" id={index}
                   value={member.title} onChange={this.handleFieldChange}
                   placeholder="Title, e.g. CEO" />
            <input type="text" name="email" id={index}
                   value={member.email} onChange={this.handleFieldChange}
                   placeholder="Email, e.g. john.doe@gmail.com" />
            <input type="text" name="photoUrl" id={index}
                   value={member.photoUrl} onChange={this.handleFieldChange}
                   placeholder="Image URL, http://..." />
            <i className="ion-ios-close-outline cancel" id={index}
                 onClick={this.removeCard} />
            <i className="ion-ios-checkmark-outline save" id={index}
                 onClick={this.saveCard} />
          </div>
        );
      }
      else {
        return (
          <div className="ovc-team-card item" key={index} id={index}
               onClick={this.editCard}>
            <img src={member.photoUrl} />
            <div>{member.firstName} {member.lastName}</div>
            <div>{member.title}</div>
            <div>{member.email}</div>
          </div>
        );
      }
    });

    return (
      <div className="ovc-team-section">
        {teamMembers}
        <div className="ovc-team-card add" onClick={this.addCard}>
          <i className="ion-ios-plus-empty" />
        </div>
      </div>
    );
  }
}

class BoardSection extends React.Component {
  constructor(props) {
    super(props);

    // TODO: Load this from the server
    this.state = {
      'board': []
    };

    this.editCard = this.editCard.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.addCard = this.addCard.bind(this);
    this.removeCard = this.removeCard.bind(this);

    fetch('/data/founder/company/board.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'board': json });
    }); // TODO: Handle errors
  }

  editCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .update('board', boardMembers =>
        boardMembers.map((boardMember, index) => {
          if (index === memberIdx)
            return boardMember.update('editing', value => true);
          else
            return boardMember.update('editing', value => false);
        })
      )
    this.setState(newState.toJS());
  }

  handleFieldChange(e) {
    const memberIdx = Number(e.currentTarget.id);
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    const newState = Immutable.fromJS(this.state)
      .updateIn(['board', memberIdx, fieldName], value => fieldValue);
    this.setState(newState.toJS());
  }

  saveCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .updateIn(['board', memberIdx, 'editing'], value => false);
    this.setState(newState.toJS());
  }

  addCard(e) {
    /* Get user out of edit mode for existing cards */
    const newState = Immutable.fromJS(this.state)
      .update('board', boardMembers =>
        boardMembers.map((boardMember, index) => {
          return boardMember.update('editing', value => false);
        })
      );
    const appendedState = newState.update('board', boardMembers =>
      boardMembers.push({
        "firstName": "",
        "lastName": "",
        "title": "",
        "company": "",
        "email": "",
        "photoUrl": "",
        "linkedinUrl": "",
        "editing": true
      })
    );
    this.setState(appendedState.toJS());
  }

  removeCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .get('board').filter((boardMembers, index) =>
        index !== memberIdx
      );
    this.setState({ board: newState.toJS() });
  }

  render() {
    const boardMembers = this.state.board.map((member, index) => {
      if (member.editing) {
        return (
          <div className="ovc-board-card edit" key={index}>
            <input type="text" name="firstName" id={index}
                   value={member.firstName} onChange={this.handleFieldChange}
                   placeholder="First name, e.g. John" />
            <input type="text" name="lastName" id={index}
                   value={member.lastName} onChange={this.handleFieldChange}
                   placeholder="Last name, e.g. Doe" />
            <input type="text" name="title" id={index}
                   value={member.title} onChange={this.handleFieldChange}
                   placeholder="Title, e.g. CEO" />
            <input type="text" name="company" id={index}
                   value={member.company} onChange={this.handleFieldChange}
                   placeholder="Company, e.g. OpenVC" />
            <input type="text" name="email" id={index}
                   value={member.email} onChange={this.handleFieldChange}
                   placeholder="Email, e.g. john.doe@gmail.com" />
            <input type="text" name="photoUrl" id={index}
                   value={member.photoUrl} onChange={this.handleFieldChange}
                   placeholder="Image URL, http://..." />
            <i className="ion-ios-close-outline cancel" id={index}
                 onClick={this.removeCard} />
            <i className="ion-ios-checkmark-outline save" id={index}
                 onClick={this.saveCard} />
          </div>
        );
      }
      else {
        return (
          <div className="ovc-board-card item" key={index} id={index}
               onClick={this.editCard}>
            <img src={member.photoUrl} />
            <div>{member.firstName} {member.lastName}</div>
            <div>{member.title}</div>
            <div>{member.company}</div>
            <div>{member.email}</div>
          </div>
        );
      }
    });

    return (
      <div className="ovc-board-section">
        {boardMembers}
        <div className="ovc-board-card add" onClick={this.addCard}>
          <i className="ion-ios-plus-empty" />
        </div>
      </div>
    );
  }
}

class InvestorSection extends React.Component {
  constructor(props) {
    super(props);

    // TODO: Load this from the server
    this.state = {
      'investors': []
    };

    this.editCard = this.editCard.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.addCard = this.addCard.bind(this);
    this.removeCard = this.removeCard.bind(this);

    fetch('/data/founder/company/investors.json').then(function(response) {
      return response.json();
    }).then(json => {
      this.setState({ 'investors': json });
    }); // TODO: Handle errors
  }

  editCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .update('investors', investors =>
        investors.map((investor, index) => {
          if (index === memberIdx)
            return investor.update('editing', value => true);
          else
            return investor.update('editing', value => false);
        })
      )
    this.setState(newState.toJS());
  }

  handleFieldChange(e) {
    const memberIdx = Number(e.currentTarget.id);
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    const newState = Immutable.fromJS(this.state)
      .updateIn(['investors', memberIdx, fieldName], value => fieldValue);
    this.setState(newState.toJS());
  }

  saveCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .updateIn(['investors', memberIdx, 'editing'], value => false);
    this.setState(newState.toJS());
  }

  addCard(e) {
    /* Get user out of edit mode for existing cards */
    const newState = Immutable.fromJS(this.state)
      .update('investors', investors =>
        investors.map((investor, index) => {
          return investor.update('editing', value => false);
        })
      );
    const appendedState = newState.update('investors', investors =>
      investors.push({
        "name": "",
        "round": "",
        "amount": "",
        "photoUrl": "",
        "editing": true
      })
    );
    this.setState(appendedState.toJS());
  }

  removeCard(e) {
    const memberIdx = Number(e.currentTarget.id);
    const newState = Immutable.fromJS(this.state)
      .get('investors').filter((investors, index) =>
        index !== memberIdx
      );
    this.setState({ investors: newState.toJS() });
  }

  render() {
    const investors = this.state.investors.map((investor, index) => {
      if (investor.editing) {
        return (
          <div className="ovc-investor-card edit" key={index}>
            <input type="text" name="name" id={index}
                   value={investor.name} onChange={this.handleFieldChange}
                   placeholder="Name, e.g. MyCapital" />
            <input type="text" name="round" id={index}
                   value={investor.round} onChange={this.handleFieldChange}
                   placeholder="Round, e.g. Series A" />
            <input type="text" name="amount" id={index}
                   value={investor.amount} onChange={this.handleFieldChange}
                   placeholder="Amount, e.g. 12000000" />
            <input type="text" name="photoUrl" id={index}
                   value={investor.photoUrl} onChange={this.handleFieldChange}
                   placeholder="Image URL, http://..." />
            <i className="ion-ios-close-outline cancel" id={index}
                 onClick={this.removeCard} />
            <i className="ion-ios-checkmark-outline save" id={index}
                 onClick={this.saveCard} />
          </div>
        );
      }
      else {
        return (
          <div className="ovc-investor-card item" key={index} id={index}
               onClick={this.editCard}>
            <img src={investor.photoUrl} />
            <div>{investor.name}</div>
            <div>{investor.round}</div>
            <div>{investor.amount}</div>
          </div>
        );
      }
    });

    return (
      <div className="ovc-investor-section">
        {investors}
        <div className="ovc-investor-card add" onClick={this.addCard}>
          <i className="ion-ios-plus-empty" />
        </div>
      </div>
    );
  }
}

class FounderCompanyPage extends React.Component {
  render() {
    return (
      <div className="ovc-founder-company-container">
        <h3>Team</h3>
        <TeamSection />
        <h3>Board</h3>
        <BoardSection />
        <h3>Investors</h3>
        <InvestorSection />
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
