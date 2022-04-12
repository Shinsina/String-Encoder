import { request } from '$lib/requests';
import { prerequestValidator } from './prerequestValidator';

/**
 * Set the body of a request to retrieve data from the MongoDB database.
 * @param {Array} data An array of returned objects from a query (potentially empty).
 * @param {Array} fields An array of objects containing value keys representing query parameters.
 * @returns {Promise<any[]>} An updated array of the data passed in containing the query results.
 */
export async function setBodyGet(data, fields) {
  const body = {};
  if (typeof fields[0] === 'string') {
    body._id = fields;
  } else {
    fields.forEach((field) => {
      const { selectValue, value } = field;
      try {
        body[selectValue] = JSON.parse(value);
      } catch (error) {
        body[selectValue] = value;
      }
    });
  }
  body['isBrowseQuery'] = true;
  data = await request(body, 'POST');
  return data;
}

/**
 * Set the body of a request to insert MongoDB document(s) using fields
 * @param {Object} parameters The parameters for the setBodyPost function.
 * @param {Object} parameters.body The complete body of query parameters to insert a MongoDB document.
 * @param {Array} parameters.fields An array of NEW fields to add to the requested MongoDB document.
 * @returns {Object} A status code and the appropriate return data (Error message or retrieved data).
 */
export function setBodyPostFields({ body, fields }) {
  if (fields) {
    fields.forEach((field) => {
      body[field.name] = field.type;
    });
    request(body, 'POST');
  }
}

/**
 * Set the body of a request to insert MongoDB document(s) using fieldValueStore
 * @param {Object} parameters The parameters for the setBodyPost function.
 * @param {Object} parameters.body The complete body of query parameters to insert a MongoDB document.
 * @param {Object} parameters.fieldValueStore An object of keyed field, value pairs containing the data for a new MongoDB document.
 * @returns {Object} A status code and the appropriate return data (Error message or retrieved data).
 */
export function setBodyPostFieldValueStore({ body, fieldValueStore }) {
  if (fieldValueStore && prerequestValidator(fieldValueStore, body).isValid) {
    request(prerequestValidator(fieldValueStore, body).body, 'POST');
  }
}

/**
 * Set the body of a request to update MongoDB document(s) using fields an oldFields
 * @param {Object} parameters The parameters for the setBodyPut function.
 * @param {Object} parameters.body The incomplete body of query parameters to update a MongoDB document.
 * @param {Array} parameters.fields An array of NEW fields to add to the requested MongoDB document.
 * @param {Array} parameters.oldFields An array of fields already found on a requested MongoDB document.
 */
export function setBodyPutFields({ body, fields, oldFields }) {
  if (fields && oldFields) {
    fields.forEach((field, key) => {
      body[field.name] = oldFields[key];
      if (!oldFields[key]) {
        body[field.name] = field.type;
      }
    });
    request(body, 'PUT');
  }
}

/**
 * Set the body of a request to update MongoDB document(s) using fieldValueStore
 * @param {Object} parameters The parameters for the setBodyPut function.
 * @param {Object} parameters.body The incomplete body of query parameters to update a MongoDB document.
 * @param {Object} parameters.fieldValueStore An object of keyed field, value pairs containing the new data for a requested MongoDB document.
 */
export function setBodyPutFieldValueStore({ body, fieldValueStore }) {
  if (fieldValueStore && prerequestValidator(fieldValueStore, body).isValid) {
    request(prerequestValidator(fieldValueStore, body).body, 'PUT');
  }
}

/**
 * Set the body of a request to delete MongoDB document(s)
 * @param {Array} fields An array of query parameters to find MongoDB documents to delete if they match.
 */
export async function setBodyDelete(fields) {
  const body = {};
  fields.forEach((field) => {
    const { selectValue, value } = field;
    try {
      body[selectValue] = JSON.parse(value);
    } catch (error) {
      body[selectValue] = value;
    }
  });
  const alerts = {
    success: 'Found Item(s) Deleted',
    unconfirmed: 'Nothing deleted, please enter new search criteria'
  };
  if (body.isDefinition) {
    alerts.confirm = 'Deleting type(s) will delete all implements of that type. Delete anyway?';
  } else if (Object.keys(body).includes('isDefinition')) {
    alerts.confirm = 'This will delete all implements matching the criteria. Delete anyway?';
  } else {
    alerts.confirm = 'Are you sure you want to delete item(s) matching this criteria?';
  }
  const confirm = window.confirm(alerts.confirm);
  if (confirm) {
    await request(body, 'DELETE').then(() => window.alert(alerts.success));
  } else {
    window.alert(alerts.unconfirmed);
  }
}
