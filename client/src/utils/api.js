import 'whatwg-fetch';
import {getToken} from './auth.js';

/*
 * Return a new JSON object with all null values converted to empty strings.
 * TODO: Convert all date strings to dates
 */
const preprocessJSON = function(json) {
  if (Array.isArray(json)) {
    return json.map(v => preprocessJSON(v));
  }
  else if (json instanceof Object) {
    let newJSON = {};
    for (let key in json) {
      newJSON[key] = preprocessJSON(json[key]);
    }
    return newJSON;
  }
  else {
    return (json === undefined || json === null) ? '' : json;
  }
};

const authFetch = function(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.headers['Authorization'] = `Bearer ${getToken()}`;
  // CSRF Token
  // options.headers['X-CSRFToken'] = getCSRFToken();
  // Allow cookies to be sent via MDN fetch (and its polyfill).
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
  // options.credentials = 'include';
  return fetch(url, options);
};

export {authFetch, preprocessJSON};

