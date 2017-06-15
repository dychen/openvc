import React from 'react';
import Immutable from 'immutable';
import {Link} from 'react-router-dom';
import {ProgressBar} from 'react-bootstrap';

import {FormContainer} from '../components/form.jsx';

import './application.scss';

/*
 * Team
 * - first name, last name, email, linkedin
 * - Alma mater and graduation date (if applicable)
 * - affiliated organizations
 * - bio
 * Company (+ for particular investors)
 * - name
 * - description
 * - segment, applicable sectors
 * - business model
 * - customers
 * - competitors
 * - in stealth? We will make sure to respect this when communicating to investors
 * - pitch deck, executive summary, etc.
 * Fundraise
 * - raised to date
 * - amount raising
 * - investors
 * - board
 * - cash/burn/runway
 * - business-specific KPIs
 * Personal notes + attachments to specific investors
 */

const TeamApplication = (props) => {
  const FIELDS = [
    { field: 'names', elementId: 'form-field-team-names',
      title: 'What are the names of the founders?' },
  ];

  const onSave = (data) => {
    props.onSave('team', data);
  };

  return (
    <div className="ovc-founder-application">
      <div className="founder-application-cancel"
           onClick={props.onCancel}>
        <i className="ion-android-arrow-back" />
      </div>
      <div className="founder-application-header">
        Tell us about your team
      </div>
      <FormContainer FIELDS={FIELDS} data={props.data} onSave={onSave}
                     containerClass="founder-application-company-container" />
    </div>
  );
}

const CompanyApplication = (props) => {
  const FIELDS = [
    { field: 'name', elementId: 'form-field-company-name',
      title: 'What\'s your company\'s name?' },
    { field: 'description', elementId: 'form-field-company-description',
      title: 'Please describe your company' },
    { field: 'sectors', elementId: 'form-field-company-sectors',
      title: 'Choose the sectors that best fit your company' },
    { field: 'businessModel', elementId: 'form-field-company-businessModel',
      title: 'Describe your business model' },
    { field: 'customers', elementId: 'form-field-company-customers',
      title: 'Who are your current customers?' },
    { field: 'competitors', elementId: 'form-field-company-competitors',
      title: 'Who are your current competitors?' },
    { field: 'stealth', elementId: 'form-field-company-stealth',
      title: 'Are you in stealth?' },
  ];

  const onSave = (data) => {
    props.onSave('company', data);
  };

  return (
    <div className="ovc-founder-application">
      <div className="founder-application-cancel"
           onClick={props.onCancel}>
        <i className="ion-android-arrow-back" />
      </div>
      <div className="founder-application-header">
        Tell us about your company
      </div>
      <FormContainer FIELDS={FIELDS} data={props.data} onSave={onSave}
                     containerClass="founder-application-company-container" />
    </div>
  );
}

const FundraiseApplication = (props) => {
  const FIELDS = [
    { field: 'amount', elementId: 'form-field-fundraise-amount',
      title: 'How much money are you raising?' },
    { field: 'raised', elementId: 'form-field-fundraise-raised',
      title: 'Home much money have you raised to date?' },
    { field: 'investors', elementId: 'form-field-fundraise-investors',
      title: 'Who are your current investors?' },
    { field: 'board', elementId: 'form-field-fundraise-board',
      title: 'Who are your board members?' },
    { field: 'cash', elementId: 'form-field-fundraise-cash',
      title: 'How much cash do you have?' },
    { field: 'rml', elementId: 'form-field-fundraise-rml',
      title: 'What\'s your estimated runway (RML)?' },
    { field: 'revenue', elementId: 'form-field-fundraise-revenue',
      title: 'What\'s your current net revenue?' },
  ];

  const onSave = (data) => {
    props.onSave('fundraise', data);
  };

  return (
    <div className="ovc-founder-application">
      <div className="founder-application-cancel"
           id="home"
           onClick={props.onCancel}>
        <i className="ion-android-arrow-back" />
      </div>
      <div className="founder-application-header">
        Tell us about your fundraise
      </div>
      <FormContainer FIELDS={FIELDS} data={props.data} onSave={onSave}
                     containerClass="founder-application-fundraise-container" />
    </div>
  );
}

const SectionTile = (props) => {
  const onClick = (e) =>  {
    props.onClick(props.linkTo);
  }

  let progressBarStyle = 'danger';
  if (props.progress === 100)
    progressBarStyle = 'success';
  else if (props.progress >= 20)
    progressBarStyle = 'warning';

  return (
    <div className="founder-application-section-tile-bg">
      <div className="founder-application-section-tile"
           onClick={onClick}>
        <div className="section-tile-header">
          <i className={props.icon} />
          <span>{props.title}</span>
        </div>
        <div className="section-tile-body">
          <span className="subtext-short">{props.shortText}</span>
          <span className="subtext-long">{props.longText}</span>
        </div>
        <div className="section-tile-footer">
          <span>Progress</span>
          <ProgressBar striped bsStyle={progressBarStyle} now={props.progress} />
        </div>
      </div>
    </div>
  );
};

/*
 * props:
 *   progress [Object]: { [string: section]: [Number: progress] }
 *   changeSection [function]: Function called on SectionTile click
 */
class HomeApplication extends React.Component {
  render() {
    const teamLongText = (
      'People are the most important part of a company. We want to hear' +
      ' about you and your team. What makes you the right people to do what' +
      ' you\'re doing?'
    );
    const companyLongText = (
      'What\'s your vision? What are you doing and how are you doing it' +
      ' better than your competitors? How big is your market?'
    );
    const fundraiseLongText = (
      'We want to help you with your fundraise, but need some numbers to' +
      ' better understand how we best fit in.'
    );
    const otherLongText = (
      'Legal disclosures, contracting work, and other miscellanea. Things' +
      ' an investor should uncover during due diligence and anything else' +
      ' that\'s relevant.'
    );
    return (
      <div className="ovc-founder-application">
        <div className="founder-application-cancel">
          <Link to="/founder/apply">
            <i className="ion-android-close" />
          </Link>
        </div>
        <div className="founder-application-header">
          Welcome to your investment application
        </div>
        <div className="founder-application-section-tile-container">
          <SectionTile title="Team"
                       icon="ion-android-person"
                       shortText="Tell us about your team."
                       longText={teamLongText}
                       progress={this.props.progress.team}
                       linkTo="team"
                       onClick={this.props.changeSection} />
          <SectionTile title="Company"
                       icon="ion-home"
                       shortText="Tell us about your company."
                       longText={companyLongText}
                       progress={this.props.progress.company}
                       linkTo="company"
                       onClick={this.props.changeSection} />
          <SectionTile title="Fundraise"
                       icon="ion-cash"
                       shortText="What's your fundraising/cash status?"
                       longText={fundraiseLongText}
                       progress={this.props.progress.fundraise}
                       linkTo="fundraise"
                       onClick={this.props.changeSection} />
          <SectionTile title="Other"
                       icon="ion-lightbulb"
                       shortText="A few other questions."
                       longText={otherLongText}
                       progress={100} />
        </div>
      </div>
    );
  }
}

class FounderApplication extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      team: {},
      company: {},
      fundraise: {},
      currentSection: 'home'
    };

    this.changeSection = this.changeSection.bind(this);
    this.onFormSave = this.onFormSave.bind(this);
    this.onFormCancel = this.onFormCancel.bind(this);
  }

  changeSection(section) {
    this.setState({ currentSection: section });
  }

  onFormSave(section, data) {
    const newState = Immutable.fromJS(this.state)
      .set('currentSection', 'home')
      .set(section, data);
    this.setState(newState.toJS());
  }

  onFormCancel() {
    this.setState({ currentSection: 'home' });
  }

  render() {
    let currentSection;
    switch (this.state.currentSection) {
      case 'team':
        currentSection = <TeamApplication data={this.state.team}
                                          onSave={this.onFormSave}
                                          onCancel={this.onFormCancel} />;
        break;
      case 'company':
        currentSection = <CompanyApplication data={this.state.company}
                                             onSave={this.onFormSave}
                                             onCancel={this.onFormCancel} />;
        break;
      case 'fundraise':
        currentSection = <FundraiseApplication data={this.state.fundraise}
                                               onSave={this.onFormSave}
                                               onCancel={this.onFormCancel} />;
        break;
      case 'home':
      default:
        let progressMap = {};
        ['team', 'company', 'fundraise'].forEach(section => {
          const completed = Object.keys(this.state[section]).filter(key =>
            this.state[section][key]
          ).length;
          const length = Object.keys(this.state[section]).length;
          progressMap[section] = Math.ceil(completed * 100 / length) || 0;
        });
        currentSection = <HomeApplication changeSection={this.changeSection}
                                          progress={progressMap} />;
        break;
    }

    return <div>{currentSection}</div>
  }
}

export default FounderApplication;
