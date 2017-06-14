import React from 'react';
import Immutable from 'immutable';
import {Link} from 'react-router-dom';
import {ProgressBar} from 'react-bootstrap';

import './application.scss';

/*
 * Team
 * - first name, last name, email
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
 */
const SectionTile = (props) => {
  let progressBarStyle = 'danger';
  if (props.progress === 100)
    progressBarStyle = 'success';
  else if (props.progress >= 50)
    progressBarStyle = 'info';
  else if (props.progress >= 20)
    progressBarStyle = 'warning';

  return (
    <div className="founder-application-section-tile">
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
  );
};

class FounderApplication extends React.Component {
  render() {
    const peopleLongText = (
      'People are the most important part of a company. We want to hear' +
      ' about you and your team. What makes you the right team to do what' +
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
          Welcome to the investment application
        </div>
        <div className="founder-application-section-tile-container">
          <SectionTile title="People"
                       icon="ion-android-person"
                       shortText="Tell us about your team."
                       longText={peopleLongText}
                       progress={10} />
          <SectionTile title="Company"
                       icon="ion-home"
                       shortText="Tell us about your company."
                       longText={companyLongText}
                       progress={30} />
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

export default FounderApplication;
