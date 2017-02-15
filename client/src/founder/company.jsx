import React from 'react';
import Immutable from 'immutable';
import {hashHistory} from 'react-router';
import {authFetch, preprocessJSON} from '../utils/api.js';

import CreatePersonModal from '../components/modals/person.jsx';

import './company.scss';

/*
 * props:
 *   _API_URL [string]: Backend API endpoint to hit.
 *   _USER_TYPE [string]: 'founder' or 'investor', depending on user role.
 */
class MemberSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      members: [],
      modalVisible: false
    };

    this._goToContactPage = this._goToContactPage.bind(this);

    // New member component handlers
    this.addNewMember = this.addNewMember.bind(this);
    this.handleDeleteMember = this.handleDeleteMember.bind(this);

    // New member modal handlers
    this.cancelNewMember = this.cancelNewMember.bind(this);
    this.handleCreateMember = this.handleCreateMember.bind(this);

    // Update existing member component handlers
    this.updateInput = this.updateInput.bind(this);
    this.cancelEdits = this.cancelEdits.bind(this);
    this.editMember = this.editMember.bind(this);
    this.handleUpdateMember = this.handleUpdateMember.bind(this);

    // Member API
    this.getMemberList = this.getMemberList.bind(this);
    this.createMember = this.createMember.bind(this);
    this.updateMember = this.updateMember.bind(this);
    this.deleteMember = this.deleteMember.bind(this);

    this.getMemberList();
  }

  _goToContactPage(e) {
    const linkUrl = '/' + this.props._USER_TYPE + '/contacts/' + e.currentTarget.id;
    hashHistory.push(linkUrl);
  }

  /*
   * New member component handlers
   */

  addNewMember(e) {
    this.setState({ modalVisible: true });
  }

  cancelNewMember(e) {
    this.setState({ modalVisible: false });
  }

  /*
   * New member modal handlers
   */

  handleCreateMember(person) {
    this.createMember(person);
  }

  handleDeleteMember(e) {
    e.stopPropagation();
    this.deleteMember(Number(e.currentTarget.id));
  }

  /*
   * Update existing member component handlers
   */

  updateInput(e) {
    const memberId = Number(e.currentTarget.id);
    const memberIdx = this.state.members.findIndex(member =>
      member.id === memberId
    );
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    const newState = Immutable.fromJS(this.state)
      .updateIn(['members', memberIdx, fieldName], value => fieldValue);
    this.setState(newState.toJS());
  }

  cancelEdits() {
    /* Get user out of edit mode for existing cards */
    const newState = Immutable.fromJS(this.state)
      .update('members', members =>
        members.map(member => member.set('editing', false))
      );
    this.setState(newState.toJS());
  }

  editMember(e) {
    e.stopPropagation();
    const memberId = Number(e.currentTarget.id);
    const memberIdx = this.state.members.findIndex(member =>
      member.id === memberId
    );
    const newState = Immutable.fromJS(this.state)
      .update('members', members =>
        members.map((member, index) => {
          if (index === memberIdx)
            return member.set('editing', true);
          else
            return member.set('editing', false);
          })
        );
    this.setState(newState.toJS());
  }

  handleUpdateMember(e) {
    const memberId = Number(e.currentTarget.id);
    const memberIdx = this.state.members.findIndex(member =>
      member.id === memberId
    );
    const member = this.state.members[memberIdx];
    this.updateMember(memberId, {
      firstName: member.firstName,
      lastName: member.lastName,
      title: member.title,
      email: member.email,
      linkedinUrl: member.linkedinUrl
    });
  }

  /*
   * Member API
   */

  getMemberList() {
    authFetch(this.props._API_URL)
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
        this.setState({ members: json });
      })
      .catch(err => {
        // Failure
        console.log(err);
        return err;
      });
  }

  createMember(member) {
    authFetch(this.props._API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(member)
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
      const newMemberState = Immutable.fromJS(this.state)
        .update('members', members => members.push(json));
      const newModalState = newMemberState.set('modalVisible', false);

      this.setState(newModalState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  updateMember(memberId, member) {
    authFetch(`${this.props._API_URL}/${memberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(member)
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
      const memberIdx = this.state.members.findIndex(member =>
        member.id === json.id
      );

      const newState = Immutable.fromJS(this.state)
        .setIn(['members', memberIdx], json);
      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  deleteMember(memberId) {
    authFetch(`${this.props._API_URL}/${memberId}`, {
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
      const newMembers = this.state.members.filter(member =>
        member.id !== deletedId
      );
      const newState = Immutable.fromJS(this.state)
        .set('members', newMembers);

      this.setState(newState.toJS());
    })
    .catch(err => {
      // Failure
      console.log(err);
      return err;
    });
  }

  render() {
    const members = this.state.members.map((member, index) => {
      if (member.editing) {
        return (
          <div className="ovc-member-card edit" key={member.id}>
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
                 onClick={this.handleUpdateMember} />
          </div>
        );
      }
      else {
        return (
          <div className="ovc-member-card item" key={member.id} id={member.id}
               onClick={this._goToContactPage}>
            <i className="ion-trash-a remove-member" id={member.id}
               onClick={this.handleDeleteMember} />
            <i className="ion-edit edit-member" id={member.id}
               onClick={this.editMember} />
            <img src={member.photoUrl} />
            <div>{member.firstName} {member.lastName}</div>
            <div>{member.title}</div>
            <div>{member.email}</div>
          </div>
        );
      }
    });

    return (
      <div className="ovc-member-section">
        {members}
        <div className="ovc-member-card add" onClick={this.addNewMember}>
          <i className="ion-ios-plus-empty" />
        </div>
        <CreatePersonModal visible={this.state.modalVisible}
                           hideModal={this.cancelNewMember}
                           createEntity={this.handleCreateMember} />
      </div>
    );
  }
}

class TeamSection extends React.Component {
  render() {
    return <MemberSection _API_URL={`${SERVER_URL}/api/v1/users/company/team`}
                          {...this.props} />
  }
}

class BoardSection extends React.Component {
  render() {
    return <MemberSection _API_URL={`${SERVER_URL}/api/v1/users/company/board`}
                          {...this.props} />
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
        <BoardSection _USER_TYPE={this._USER_TYPE} />
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
