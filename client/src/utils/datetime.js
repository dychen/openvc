import moment from 'moment';

const getStartOfQuarter = function(date, offset) {
  offset = offset || 0;
  const offsetQuarter = moment(date).add(offset, 'quarters');
  return new Date(offsetQuarter.startOf('quarter'));
};

const getEndOfQuarter = function(date, offset) {
  offset = offset || 0;
  const offsetQuarter = moment(date).add(offset, 'quarters');
  return new Date(offsetQuarter.endOf('quarter'));
};

const getStartOfYear = function(date, offset) {
  offset = offset || 0;
  const offsetYear = moment(date).add(offset, 'years');
  return new Date(offsetYear.startOf('year'));
};

const getEndOfYear = function(date, offset) {
  offset = offset || 0;
  const offsetYear = moment(date).add(offset, 'years');
  return new Date(offsetYear.endOf('year'));
};

export {getStartOfQuarter, getEndOfQuarter, getStartOfYear, getEndOfYear};

