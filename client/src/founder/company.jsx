import React from 'react';
import Immutable from 'immutable';
import {hashHistory} from 'react-router';
import {authFetch, preprocessJSON} from '../utils/api.js';

import CreatePersonModal from '../components/modals/person.jsx';

import './company.scss';

/*
 * props:
 *   _USER_TYPE [string]: 'founder' or 'investor', depending on user role.
 */
class TeamSection extends React.Component {
  constructor(props) {
    super(props);

    this._API_URL = `${SERVER_URL}/api/v1/users/company/team`;

    this.state = {
      team: [],
      modalVisible: false
    };

    this._goToContactPage = this._goToContactPage.bind(this);

    // New team member component handlers
    this.addNewTeamMember = this.addNewTeamMember.bind(this);
    this.handleDeleteTeamMember = this.handleDeleteTeamMember.bind(this);

    // New team member modal handlers
    this.cancelNewTeamMember = this.cancelNewTeamMember.bind(this);
    this.handleCreateTeamMember = this.handleCreateTeamMember.bind(this);

    // Update existing team member component handlers
    this.updateInput = this.updateInput.bind(this);
    this.cancelEdits = this.cancelEdits.bind(this);
    this.editTeamMember = this.editTeamMember.bind(this);
    this.handleUpdateTeamMember = this.handleUpdateTeamMember.bind(this);

    // Team member API
    this.getTeamMemberList = this.getTeamMemberList.bind(this);
    this.createTeamMember = this.createTeamMember.bind(this);
    this.updateTeamMember = this.updateTeamMember.bind(this);
    this.deleteTeamMember = this.deleteTeamMember.bind(this);

    this.getTeamMemberList();
  }

  _goToContactPage(e) {
    const linkUrl = '/' + this.props._USER_TYPE + '/contacts/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
  }

  /*
   * New team member component handlers
   */

  addNewTeamMember(e) {
    this.setState({ modalVisible: true });
  }

  cancelNewTeamMember(e) {
    this.setState({ modalVisible: false });
  }

  /*
   * New team member modal handlers
   */

  handleCreateTeamMember(person) {
    this.createTeamMember(person);
  }

  handleDeleteTeamMember(e) {
    e.stopPropagation();
    this.deleteTeamMember(Number(e.currentTarget.id));
  }

  /*
   * Update existing team member component handlers
   */

  updateInput(e) {
    const memberId = Number(e.currentTarget.id);
    const memberIdx = this.state.team.findIndex(member =>
      member.id === memberId
    );
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    const newState = Immutable.fromJS(this.state)
      .updateIn(['team', memberIdx, fieldName], value => fieldValue);
    this.setState(newState.toJS());
  }

  cancelEdits() {
    /* Get user out of edit mode for existing cards */
    const newState = Immutable.fromJS(this.state)
      .update('team', teamMembers =>
        teamMembers.map(teamMember => teamMember.set('editing', false))
      );
    this.setState(newState.toJS());
  }

  editTeamMember(e) {
    e.stopPropagation();
    const memberId = Number(e.currentTarget.id);
    const memberIdx = this.state.team.findIndex(member =>
      member.id === memberId
    );
    const newState = Immutable.fromJS(this.state)
      .update('team', teamMembers =>
        teamMembers.map((teamMember, index) => {
          if (index === memberIdx)
            return teamMember.set('editing', true);
          else
            return teamMember.set('editing', false);
          })
        );
    this.setState(newState.toJS());
  }

  handleUpdateTeamMember(e) {
    const memberId = Number(e.currentTarget.id);
    const memberIdx = this.state.team.findIndex(member =>
      member.id === memberId
    );
    const member = this.state.team[memberIdx];
    this.updateTeamMember(memberId, {
      firstName: member.firstName,
      lastName: member.lastName,
      title: member.title,
      email: member.email,
      linkedinUrl: member.linkedinUrl
    });
  }

  /*
   * Team member API
   */

  getTeamMemberList() {
    authFetch(this._API_URL)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        else {
          return response.json().then(json => {
            throw new Error(json);
          });
        }
      })
      .then(json => {
        json = preprocessJSON(json);
        this.setState({ team: json });
      })
      .catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  createTeamMember(teamMember) {
    authFetch(this._API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(teamMember)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const newTeamState = Immutable.fromJS(this.state)
        .update('team', team => team.push(json));
      const newModalState = newTeamState.set('modalVisible', false);

      this.setState(newModalState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  updateTeamMember(teamMemberId, teamMember) {
    authFetch(`${this._API_URL}/${teamMemberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(teamMember)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          // TODO: Handle error responses
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const teamMemberIdx = this.state.team.findIndex(teamMember =>
        teamMember.id === json.id
      );

      const newState = Immutable.fromJS(this.state)
        .setIn(['team', teamMemberIdx], json);
      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  deleteTeamMember(teamMemberId) {
    authFetch(`${this._API_URL}/${teamMemberId}`, {
      method: 'DELETE'
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      else {
        return response.json().then(json => {
          throw new Error(json);
        });
      }
    })
    .then(json => {
      // Success
      json = preprocessJSON(json);
      const deletedId = json.id;
      const newTeam = this.state.team.filter(teamMember =>
        teamMember.id !== deletedId
      );
      const newState = Immutable.fromJS(this.state)
        .set('team', newTeam);

      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  render() {
    const teamMembers = this.state.team.map((member, index) => {
      if (member.editing) {
        return (
          <div className="ovc-team-card edit" key={member.id}>
            <input type="text" name="firstName" id={member.id}
                   value={member.firstName} onChange={this.updateInput}
                   placeholder="First name, e.g. John" />
            <input type="text" name="lastName" id={member.id}
                   value={member.lastName} onChange={this.updateInput}
                   placeholder="Last name, e.g. Doe" />
            <input type="text" name="title" id={member.id}
                   value={member.title} onChange={this.updateInput}
                   placeholder="Title, e.g. CEO" />
            <input type="text" name="email" id={member.id}
                   value={member.email} onChange={this.updateInput}
                   placeholder="Email, e.g. john.doe@gmail.com" />
            <input type="text" name="photoUrl" id={member.id}
                   value={member.photoUrl} onChange={this.updateInput}
                   placeholder="Image URL, http://..." />
            <i className="ion-ios-close-outline cancel" id={member.id}
                 onClick={this.cancelEdits} />
            <i className="ion-ios-checkmark-outline save" id={member.id}
                 onClick={this.handleUpdateTeamMember} />
          </div>
        );
      }
      else {
        return (
          <div className="ovc-team-card item" key={member.id} id={member.id}
               onClick={this._goToContactPage}>
            <i className="ion-trash-a remove-team-member" id={member.id}
               onClick={this.handleDeleteTeamMember} />
            <i className="ion-edit edit-team-member" id={member.id}
               onClick={this.editTeamMember} />
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
        <div className="ovc-team-card add" onClick={this.addNewTeamMember}>
          <i className="ion-ios-plus-empty" />
        </div>
        <CreatePersonModal visible={this.state.modalVisible}
                           hideModal={this.cancelNewTeamMember}
                           createEntity={this.handleCreateTeamMember} />
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
  constructor(props) {
    super(props);

    // TODO: Refactor this
    this._USER_TYPE = (
      this.props.location.pathname.includes('investor') ? 'investor' : 'founder'
    );
  }

  render() {
    return (
      <div className="ovc-founder-company-container">
        <h3>Team</h3>
        <TeamSection _USER_TYPE={this._USER_TYPE} />
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
