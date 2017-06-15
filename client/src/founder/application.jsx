import React from 'react';
import Immutable from 'immutable';
import {Link} from 'react-router-dom';
import {ProgressBar} from 'react-bootstrap';
const Scroll = require('react-scroll');
const ScrollElement = Scroll.Element;
const ScrollScroller = Scroll.scroller;

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
 * - cash/burn/runway
 * - business-specific KPIs
 * Personal notes + attachments to specific investors
 */

class TeamApplication extends React.Component {
  render() {
    return (
      <div />
    );
  }
}

class FormField extends React.Component {
  constructor(props) {
    super(props);
    this.focusInput = this.focusInput.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  // This is called for the initial element focus
  componentDidMount() {
    if (this.props.active) {
      this.focusInput();
    }
  }
  // This is called to refocus when the active element changes
  // Use componentDidUpdate instead of componentWillXXX because focusInput()
  // needs to fire after the rerender.
  componentDidUpdate(prevProps, prevState) {
    if (this.props.active) {
      this.focusInput();
    }
  }

  focusInput(e) {
    this.inputField.focus();
  }

  onSelect(e) {
    this.focusInput();
    this.props.setActiveField(this.props.field);
  }

  render() {
    const containerClass = (
      this.props.active ? 'ovc-form-field-bg active' : 'ovc-form-field-bg'
    );
    return (
      <div className={containerClass}
           onClick={this.onSelect}>
        <div className="ovc-form-field">
          <div className="form-field-header">
            {this.props.title}
          </div>
          <input className="form-field-input"
                 ref={input => this.inputField = input}
                 name={this.props.field}
                 value={this.props.value}
                 onChange={this.props.onChange} />
        </div>
      </div>
    );
  }
};

class CompanyApplication extends React.Component {
  constructor(props) {
    super(props);

    this.FIELDS = [
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

    this.state = {
      form: {
        name: '',
        description: '',
        sectors: '',
        businessModel: '',
        customers: '',
        competitors: '',
        stealth: ''
      },
      activeField: 'name'
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.setActiveField = this.setActiveField.bind(this);
  }

  onChange(e) {
    let newState = {};
    newState[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ form: newState });
  }

  onKeyPress(e) {
    if (e.key === 'Enter') {
      const fieldIdx = this.FIELDS.findIndex(field =>
        field.field === this.state.activeField
      );
      if (!e.shiftKey) {
        if (fieldIdx === this.FIELDS.length - 1) {
          // TODO
        }
        else if (fieldIdx < this.FIELDS.length - 1) {
          this.setState({ activeField: this.FIELDS[fieldIdx+1].field });
          ScrollScroller.scrollTo(this.FIELDS[fieldIdx+1].elementId, {
            duration: 500,
            smooth: true,
            containerId: 'founder-application-company-container'
          });
        }
      }
      else {
        if (fieldIdx > 0) {
          this.setState({ activeField: this.FIELDS[fieldIdx-1].field });
          ScrollScroller.scrollTo(this.FIELDS[fieldIdx-1].elementId, {
            duration: 500,
            smooth: true,
            containerId: 'founder-application-company-container'
          });
        }
      }
    }
  }

  setActiveField(field) {
    this.setState({ activeField: field });
  }

  render() {
    const formFields = this.FIELDS.map(field => (
      <ScrollElement name={field.elementId} key={field.elementId}
                     className="ovc-form-field-scroll-wrapper">
        <FormField title={field.title}
                   field={field.field}
                   value={this.state.form[field.field]}
                   active={this.state.activeField === field.field}
                   setActiveField={this.setActiveField}
                   onChange={this.onChange} />
      </ScrollElement>
    ));
    return (
      <div className="ovc-founder-application">
        <div className="founder-application-cancel"
             id="home"
             onClick={this.props.changeSection}>
          <i className="ion-android-arrow-back" />
        </div>
        <div className="founder-application-header">
          Tell us about your company
        </div>
        <div id="founder-application-company-container"
             className="founder-application-company-container"
             onKeyPress={this.onKeyPress} >
          {formFields}
        </div>
        <div className="founder-application-save"
             id="home"
             onClick={this.props.changeSection}>
          Save&nbsp;<i className="ion-checkmark" />
        </div>
      </div>
    );
  }
}

const SectionTile = (props) => {
  let progressBarStyle = 'danger';
  if (props.progress === 100)
    progressBarStyle = 'success';
  else if (props.progress >= 20)
    progressBarStyle = 'warning';

  return (
    <div className="founder-application-section-tile-bg">
      <div className="founder-application-section-tile"
           id={props.linkTo}
           onClick={props.onClick}>
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
                       progress={10} />
          <SectionTile title="Company"
                       icon="ion-home"
                       shortText="Tell us about your company."
                       longText={companyLongText}
                       progress={30}
                       linkTo="company"
                       onClick={this.props.changeSection} />
          <SectionTile title="Fundraise"
                       icon="ion-cash"
                       shortText="What's your fundraising/cash status?"
                       longText={fundraiseLongText}
                       progress={60} />
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
      currentSection: 'home'
    };

    this.changeSection = this.changeSection.bind(this);
  }

  changeSection(e) {
    this.setState({ currentSection: e.currentTarget.id });
  }

  render() {
    let currentSection;
    switch (this.state.currentSection) {
      case 'company':
        currentSection = <CompanyApplication changeSection={this.changeSection} />;
        break;
      case 'home':
      default:
        currentSection = <HomeApplication changeSection={this.changeSection} />;
        break;
    }

    return <div>{currentSection}</div>
  }
}

export default FounderApplication;
