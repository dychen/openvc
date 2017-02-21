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

/*
 * Formats an object or a list of objects to contain exactly the fields
 * provided by the @fieldList parameter.
 *
 * Args:
 *   json [Object]: JSON object to convert - must be either the target object
 *                  represented by fieldList or a list of those objects.
 *   fieldList [Array]: List of valid fields to filter or add.
 */
const formatAPIJSON = function(json, fieldList) {
  if (Array.isArray(json)) {
    return json.map(v => formatAPIJSON(v, fieldList));
  }
  else if (json instanceof Object) {
    let newJSON = { id: json.id || undefined };
    fieldList.forEach(field => {
      newJSON[field] = json[field] || undefined;
    })
    return newJSON;
  }
  else {
    return json; // Could not convert json
  }
};

/*
 * Return a new JSON object with all values converted to objects with the
 * following format: {
 *   value: [value],     // The original value of the field
 *   editValue: [value], // The editing value of the field
 *   editing: false // Whether or not the field is currently being updated
 * }
 * Does not update id fields in this way.
 *
 * Args:
 *   json [Object]: JSON object to convert.
 *   fieldKey [string]: [Optional] Object key in the previous level of the
 *                                 recursion.
 */
const transformEditJSON = function(json, fieldKey) {
  if (Array.isArray(json)) {
    return json.map(v => transformEditJSON(v));
  }
  else if (json instanceof Object) {
    let newJSON = {};
    for (let key in json) {
      newJSON[key] = transformEditJSON(json[key], key);
    }
    return newJSON;
  }
  else {
    const value = (json === undefined || json === null) ? '' : json;
    if (fieldKey !== 'id') {
      return {
        value: value,
        editValue: value,
        editing: false
      };
    }
    else {
      return value;
    }
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

  // Handle the 'params' field of options (GET parameters)
  // From fetch API spec: https://fetch.spec.whatwg.org/#fetch-api
  let urlObj = new URL(url);
  if (options && options.params && options.params instanceof Object) {
    Object.keys(options.params).forEach(key =>
      urlObj.searchParams.append(key, options.params[key])
    );
  }
  return fetch(urlObj, options);
};

export {authFetch, preprocessJSON, formatAPIJSON, transformEditJSON};

