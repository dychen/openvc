/*
 * TODO: This is not secure and is vulnerable to XSS. Move to HttpOnly cookies.
 *       This requires a server-side implementation.
 */

import 'whatwg-fetch';

// TODO: Consider moving to this: https://github.com/js-cookie/js-cookie/
const getCookie = function(name) {
  let cookieValue;
  if (document.cookie && document.cookie !== '') {
    let cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const storeToken = function(token) {
  localStorage.setItem('apiToken', token);
}

const getToken = function() {
  return localStorage.getItem('apiToken');
}

const getCSRFToken = function() {
  return getCookie('csrftoken');
}

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

export {storeToken, getToken, authFetch};
