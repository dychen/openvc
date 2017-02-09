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

export {preprocessJSON};

