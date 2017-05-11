import {authFetch, formatAPIJSON, preprocessJSON} from '../../utils/api.js';

const TABLE_API_URL = `${SERVER_URL}/api/v1/tables`;

const getTableList = () => {
  return authFetch(TABLE_API_URL)
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
      return preprocessJSON(json);
    })
    .catch(err => {
      console.log(err);
      return err;
    });
};

const createTable = (entity) => {
  return authFetch(TABLE_API_URL, {
      method: 'POST',
      body: JSON.stringify(entity)
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
      return preprocessJSON(json);
    })
    .catch(err => {
      console.log(err);
      return err;
    });
};

const updateTable = (entityId, entity) => {
  return authFetch(`${TABLE_API_URL}/${entityId}`, {
      method: 'POST',
      body: JSON.stringify(entity)
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
      return preprocessJSON(json);
    })
    .catch(err => {
      console.log(err);
      return err;
    });
};

const deleteTable = (entityId) => {
  return authFetch(`${TABLE_API_URL}/${entityId}`, {
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
      return preprocessJSON(json);
    })
    .catch(err => {
      console.log(err);
      return err;
    });
};

export {getTableList, createTable, updateTable, deleteTable};
