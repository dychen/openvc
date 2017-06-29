import {authFetch, handleResponse} from '../../utils/api.js';

/* Data */

const DATA_URL = `${SERVER_URL}/api/v1/custom/company/data`;

const getCompanyList = () => {
  return authFetch(DATA_URL).then(handleResponse);
};

const createCompany = (company) => {
  return authFetch(DATA_URL, {
    method: 'POST',
    body: JSON.stringify(company)
  }).then(handleResponse);
};

const updateCompany = (companyId, company) => {
  return authFetch(`${DATA_URL}/${companyId}`, {
    method: 'POST',
    body: JSON.stringify(company)
  }).then(handleResponse);
};

const deleteCompany = (companyId) => {
  return authFetch(`${DATA_URL}/${companyId}`, {
    method: 'DELETE'
  }).then(handleResponse);
};

/* Schema */

const SCHEMA_URL = `${SERVER_URL}/api/v1/custom/company/schema`;

const getFieldList = () => {
  return authFetch(SCHEMA_URL).then(handleResponse);
};

const createField = (field) => {
  return authFetch(SCHEMA_URL, {
    method: 'POST',
    body: JSON.stringify(field)
  }).then(handleResponse);
};

const updateField = (fieldId, field) => {
  return authFetch(`${SCHEMA_URL}/${fieldId}`, {
    method: 'POST',
    body: JSON.stringify(field)
  }).then(handleResponse);
};

const deleteField = (fieldId) => {
  return authFetch(`${SCHEMA_URL}/${fieldId}`, {
    method: 'DELETE'
  }).then(handleResponse);
};

/* Integrations */

const getSourceList = () => {
  return authFetch(`${SERVER_URL}/api/v1/sources`).then(handleResponse);
};

export {getCompanyList, createCompany, updateCompany, deleteCompany,
        getFieldList, createField, updateField, deleteField,
        getSourceList};

