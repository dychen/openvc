import {authFetch, handleResponse} from '../../utils/api.js';

const TABLE_API_URL = `${SERVER_URL}/api/v1/tables`;

/* Tables */

const getTableList = () => {
  return authFetch(TABLE_API_URL).then(handleResponse);
};

const createTable = (table) => {
  return authFetch(TABLE_API_URL, {
    method: 'POST',
    body: JSON.stringify(table)
  }).then(handleResponse);
};

const updateTable = (tableId, table) => {
  return authFetch(`${TABLE_API_URL}/${tableId}`, {
    method: 'POST',
    body: JSON.stringify(table)
  }).then(handleResponse);
};

const deleteTable = (tableId) => {
  return authFetch(`${TABLE_API_URL}/${tableId}`, {
    method: 'DELETE'
  }).then(handleResponse);
};

/* Fields */

const getFieldList = (tableId) => {
  return authFetch(`${TABLE_API_URL}/${tableId}/fields`).then(handleResponse);
};

const createField = (tableId, field) => {
  return authFetch(`${TABLE_API_URL}/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(field)
  }).then(handleResponse);
};

const updateField = (tableId, fieldId, field) => {
  return authFetch(`${TABLE_API_URL}/${tableId}/fields/${fieldId}`, {
    method: 'POST',
    body: JSON.stringify(field)
  }).then(handleResponse);
};

const deleteField = (tableId, fieldId) => {
  return authFetch(`${TABLE_API_URL}/${tableId}/fields/${fieldId}`, {
    method: 'DELETE'
  }).then(handleResponse);
};

export {getTableList, createTable, updateTable, deleteTable,
        getFieldList, createField, updateField, deleteField};
